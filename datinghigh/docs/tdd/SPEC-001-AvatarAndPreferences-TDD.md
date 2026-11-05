# SPEC-001-AvatarAndPreferences — TDD 測試清單

> **MVP**：[MVP-001-LoveGameDatingApp](../requirements/MVP-001-LoveGameDatingApp.md)
> **SPEC**：[SPEC-001-AvatarAndPreferences](../specs/SPEC-001-AvatarAndPreferences.md)（使用者 2026-11-01 已確認，包括 D-047 無 SQL Trigger）
> **BDD**：[SPEC-001-AvatarAndPreferences-BDD](../bdd/SPEC-001-AvatarAndPreferences-BDD.md)，73 個唯一場景
> **最後修訂**：2026-11-04；**狀態**：本輪Web／Android範圍Well-Done完成（236/236；最終回歸671/671 exit0）。真Gemini／私人媒體／16正式圖及Web流程已有證據，使用者已確認第三版風格與相似度。完整ID **236/275（85.8%）** 已覆核，不能把測試總數當完整案例驗收。

---

### 2026-11-04 本輪驗收範圍調整

使用者最新決策：無障礙專項設計、實作及驗收不納入目前整個遊戲MVP範圍（D-051），不列待補、不作完成阻擋；iOS開發／驗收則依D-052暫緩。原始規劃及歷史證據保留，不將排除或暫緩改記通過；原始275項的覆核比例不是調整範圍後的完成率，Web／Android其餘功能與故障斷言仍須逐項驗證。

「跨SPEC授權」指後續MatchingSessions的輪次／參與者、AffectionAndFeedback的雙方名片同意，以及StoryDialogueAndExit的終止狀態整合。本份依已確認SPEC只交付資料契約、分享欄位白名單及私人媒體界線；目前本人可管理／預覽，他人讀取預設拒絕。後續模組完成後再驗同輪有效同意可讀、跨輪／終止拒絕的新讀取；這項後續整合不要求在本份先實作其他SPEC。

**本輪Web／Android責任範圍**：236/236（100%）完整TDD ID已覆核；另列iOS暫緩13項、後續SPEC整合26項，均未改記通過。

## 🎯 開發進度總覽

| 層級 | 總數 | 完整ID已覆核 | 狀態 |
|---|---:|---:|---|
| UT | 121 | 105 | 本輪105/105；其餘16項為後續SPEC正向整合 |
| IT | 69 | 59 | 本輪59/59；真D1／R2／Gemini與故障矩陣已覆核，另10項後續SPEC整合 |
| API | 44 | 44 | HTTP狀態／Cookie及Bearer矩陣完整覆核，SQL／R2／真Gemini另有補充；不代表原生三平台UI |
| E2E | 41 | 28 | Web／Android功能28/28；另13項iOS暫緩，無障礙不在範圍 |
| **合計** | **275** | **236** | **85.8%** |

BDD完整場景 **65/73**；原始三平台前端紀錄 **0/13** 僅作歷史保留。本輪BDD 65/65、UX 13/13；8項後續SPEC正向整合另列，無障礙不在範圍，不沿用舊三平台Gate。逐ID完整規劃斷言／現有證據／缺項見[追溯JSON](../verification/avatar-preferences-traceability.json)與[索引](../verification/SPEC-001-AvatarAndPreferences-Traceability.md)，重建命令 `node tools/audit-avatar-traceability.mjs`；人工核准map只列已覆核完整ID，不自動依Trait放行。

## 本輪實作與驗證沿革（各階段數量及缺項僅代表當時，現況以上方範圍與最新驗證紀錄為準）

### 2026-11-03 當時證據與補實作順序

詳見[本輪驗證紀錄](../verification/SPEC-001-AvatarAndPreferences-Verification.md)：已建立8MiB專用串流、共用Skia壓縮、真私人R2、照片原子配額／排序／刪除／補償、真Gemini逐張最多4張／request replay／選1張、16款prototype風格正式插畫及本人畫面。0002已套default local，未部署雲端／production。

本輪補上上傳遺失回覆的pending-only補償，Red真D1新command不存在，Green18/18；補上排序錯誤碼與SPEC一致性，Red實際回INVALID_PHOTO_ORDER、Green改回400 INVALID_PROFILE。精確59:59／60:00／60:01到期與已有2圖第三張未知結果測試通過。使用者已確認第三版真人相似度／風格，Web真生成採用先取消再確認全程只呼叫一次。

本輪再完成兩個獨立Worker runtime共享D1／R2的首次與第4張競態、request replay及到期新輪，完整覆核AP-IT-068。正式AI圖重選、跨帳號拒絕錯誤分類、過期／撤銷後原lease失敗補償、來源失效關輪及草稿CAS保護另有新增測試。Web真Gemini及兩項基本流程3/3通過；重選舊圖全程僅1次生成。

接續缺項：Web／Android功能故障／重登矩陣、人工來源畫質、雲端長期GC及其餘逐項狀態／故障矩陣、後續SPEC的授權讀取正向契約整合、真帳單成本核對。缺項仍回寫逐ID，不以拒絕所有他人請求冒充正向授權完成。

### 2026-11-04 Web逐項補驗

六項Web真local UI測試通過（2.2分鐘）：真Gemini單張採用與重新選用，以及四張互異候選、兩分頁爭第2張200／409、同request重播、回選第2張、正式圖SHA-256等於該候選且僅一張正式資產。空選圖取消、16圖鍵盤選用、超8MiB回饋／重新選圖、三張排序／revision衝突／刪除確認另有完整斷言，增補後四項基本Web測試重跑通過。完整覆核新增AP-E2E-001／004／007／010／019；AP-E2E-016證據更新為第2張兩分頁真競爭，不沿用只有第1張busy的局部證據。

新增AP-IT-038真Application／D1／R2跨帳號拒絕與兩人資料全列不變的整合證據，媒體整合3/3、全Integration25/25通過。

`ProfileReadContractTests`新增16項完整HTTP傳輸／DTO／拒絕斷言，API整體94/94通過；完整覆核AP-API-001～009及017／018。Web Cookie與Android／iOS Bearer僅代表HTTP模式，不能擴推原生UI。惡意query依Foundation共通錯誤碼400 INVALID_REQUEST，已澄清AP-API-002，未改既有認證協定。

稽核發現React Native Web未映射舊accessibilityState：新增失敗測試後以Web aria-pressed及跨平台aria-checked修正；client120/120及typecheck通過。當時Android API36受UiAutomator exit137／殘留鍵盤與捲動位置影響，未記為通過；其後API31的基本／照片／單張及四候選完整通過，詳見後續段落，不擴推API36。

**基線與範圍**：本份只有 `user_profiles` 15欄、`user_media_assets` 9欄；依 D-047 沒有 SQL Trigger；照片上限必須用固定 prepared 單條件式 `INSERT ... SELECT ... WHERE COUNT < 5 RETURNING`，不可先查再無條件插入；媒體更新採 owner、kind、status 條件與可變欄位白名單。原六張基礎表 54欄不變；名片邀請／同意／25分權限仍由後續 SPEC 負責。

**真實性 Gate**：UT 可 mock 時鐘／AI 故障，IT 的 SQL 性質須實際 Miniflare D1；R2 私人串流須實際介面；Gemini 真圖驗證不可用 mock 替代；16 款角色須有真正式資產；原型 Fixture 和 PlatformFoundation 過往通過不作此 SPEC 證據。

### 2026-11-04 原生比例與失敗矩陣補強

原生實際Red顯示內建圖框248×797（被viewport截斷），不是3:4。讀本地React Native Image.android.js確認intrinsic source height仍保留；明確清除height後，Android基本流程新增實際框比例斷言整輪exit0。原生系統picker上傳三張／排序／刪照功能已通過，首次最後清fixture逾時exit1後已補清，未改寫退出結果。此階段首次真AI完成生成但未走完採用，當時未列通過；其後單張及四候選已補齊完整exit0，見下一節與驗證紀錄。

壓縮新增精確200000 bytes分段、多尺寸、8方向逐角及高熵全景品質下限；Provider壞圖錯誤先Red 400→Green503；Application上傳補償及ready回覆遺失不誤刪9/9。真D1/R2新增不同候選並行只一正式圖、重複圖不增index／主動新request才繼續。前端補未成年／成對年齡提示、重複候選成本說明，成功變更後清除舊本人名片預覽。整體check573項exit0（Tools24／Unit184／API97／IT25／Worker115／client128）；完整ID覆核數仍與測試函式數分開。

### 2026-11-04 原生四候選及HTTP矩陣

Android API31四候選整輪exit0：四風格／用途、逐張真生成、4個實際3:4框、回選第2張selected、取消保留／確認採用、第五張停用及重登僅1正式圖；來源清除。照片CRUD與最後fixture清理亦最新exit0。

目錄相容性以隔離暫停既有puzzle後讀／改／再存，真D1維持code與語意，正式目錄不變。資料跨Android→Web family替換後19欄／兩組JSON／照片／免費角色／profileUUID保留，cv不變且provider0；空職業及本人名片刪後即時更新。

API44/44完整覆核：HTTP fixture只驗DTO／錯誤／transport，另連真Miniflare／Gemini證據；本次新增真default local二進位／8MiB／16KiB／Origin／Cookie／Bearer／私人R2測試通過。其後已依SPEC「最多8」釐清最大合法集合應取上限與現行目錄數的較小值；topic現有6碼、上限仍8，不新增假代碼。AP-UT-101／102及IT-051已以真D1最大集合／未知、重複、超量、錯型及成對年齡界線覆核。

### 2026-11-04 配額、媒體身分與BDD業務覆核

五張刪一補一的真D1／R2整合通過，舊圖保持deleted／404且不混入本人名片。所有13個媒體固定指令的非法欄位、身分與生命週期矩陣25/25；候選1／2可讀、0／3／4／5／他人不可讀且key從CurrentUser推導的真R2檔23/23。675個多頁清理物件分次有限預算清完，保留四個有效物件及D1 tombstone；該檔13/13，雲端長期負載仍未驗。本人預覽與成年／空職業定向Unit34/34；最新Web5/5包含重試可能增加供應商成本、目前免費不扣款。

完整TDD118/275、BDD業務場景17/73，新增逐場景原始斷言／證據／缺項；13項三平台UX仍0/13。最終check:foundation 645項全部通過（Tools24／Unit202／API142／IT27／Worker120／client130），兩模組typecheck及git diff檢查通過；平台限制見驗證紀錄，未宣稱100%。

### 2026-11-04 到期確認窗與Web錯誤矩陣

原有到期timer只重繪畫面、沒有關閉已開啟採用窗；兩種timer時序均先Red。修正到期關窗及實際確認時再查serverNow，過期不送選用PUT。client完整132/132、定向24/24及typecheck／export通過；Chrome到期確認窗與503／429／409／410共6個受控HTTP故障案例通過，初次登出清理路由錯誤已修正並獨立保留exit1歷史，該批fixture亦補登出完成。候選為測試讀取注入，沒有呼叫真Gemini；真SQL／R2故障證據另列，當次Android／iOS到期UI尚未實測；其後Android七情境整輪已通過，iOS依D-052暫緩。完整覆核AP-E2E-022，其餘平台不隨之勾選。

## 歷史階段紀錄（以下數字／未實作敘述僅代表當時，現況以上段與驗證紀錄為準）

### 2026-11-02 Well-Done 局部實作與 Runner 證據

**階段：M1 Domain 與 M2 D1 核心命令部分完成；整體 Gate 尚未通過。只有 AP-UT-113 已通過；其餘 274 個完整 TDD ID、73 個 BDD 場景、13 個 UX 場景維持未通過，不以單一局部測試冒充整項驗收。**

| 範圍 | 變更／真實證據 | 尚未達到的 Gate |
|---|---|---|
| Domain | 新增 `backend/src/DatingHigh.Domain/AvatarAndPreferencesPolicies.cs`，年齡（含閏日）、Unicode、16 個免費角色 ID、照片配額、AI 4 張／60 分鐘純規則；xUnit Red `e47553bf-c34c-443e-b210-fb88bc0480b7` 缺正式實作編譯失敗，Green `f26acd81-e048-4859-abf4-bb156eb3e0a8` 33/33，完整 Unit `01bbf71f-91a8-472e-92ca-cd8204bc1d2d` 100/100；追加 AP-UT-113 固定臺灣午夜 Red `c583d845-b24e-43b7-850c-f9b65f793025`、Green 全 Unit `f1f7a1e8-cb58-4dfa-af0d-d94410c9a540` **101/101** | Domain Aggregate／Application、目錄正式圖片、共用壓縮、媒體 I/O、跨端真 API 尚未驗；`AP-UT-113` Domain 固定時鐘已通過 |
| D1 Schema／照片 | `cloudflare/migrations/0002_avatar_preferences.sql` 新增2表24欄，零 Trigger；`profile.photo.reserve/ready/delete/list` 使用受控 owner/session SQL；Red `9cac1cc0-f909-4a7d-b230-46661424196b` 因 migration 未存在失敗，Green `d7cd40b3-a12f-4532-8d50-ac25c6944988` 真 Miniflare 63/63 | `AP-IT-057` 尚缺兩個獨立 API client 與 R2 故障補償，`AP-IT-058` 尚缺 0列→HTTP 409，`AP-IT-059` 尚缺完整跨帳號轉移矩陣；不可勾選 |
| D1 Profile | `profile.ensure/read/update` 固定欄位與 preferences 9 鍵 JSON，revision CAS，session revoke 防覆寫；Red `ed92dd86-3cbd-444f-9263-498b81847514` 新 command 不存在時失敗；Green `1b1b7212-14b6-40b8-9f5e-119cac918e64` 66/66；追加 `profile.avatar.builtin/generated` 真 D1 同條件 CAS、owner/status 守衛，Green `71d90184-0ed7-47f3-9fdf-989710572b83` **68/68（含10個本輪 D1 案例）**；TS typecheck `571e6789-5ccd-49a8-a490-4e1e804199f1` 成功 | 缺 .NET Application／HTTP GET/PUT 與 client、完整 tag/catalog 驗證、實際環境 migration |
| 全 .NET Server 回歸 | Job `6b623b87-4ded-4dbc-ba4c-05282fd7df36` 通過：**Unit 101/101、API 53/53、Integration 22/22** | Foundation 回歸不能替代本 SPEC 的新 API/R2 或三平台驗收 |
| 權限／AI／前端 | 尚未實作真 Gemini、R2 條件 CAS、採用一張的流程、16 個實際免費圖、Web/Android/iOS UI 或名片串流 | M1／M2／M3／M4／M5 均保留未完成，不降低門檻 |

**接續順序**：完成 .NET Application + 嚴格 API／8MiB 專用媒體串流（不能放寬 Foundation 的 16KiB JSON／8KiB R2 限制）、200KB 可重用壓縮、私人 R2 與補償；再真 Gemini 一張一張、R2 跨 Worker 排他、16 個可用正式圖、前端三平台與完整場景驗收。Migration 目前只在 Miniflare 測試套用，尚未對既有 local/SIT/production 執行。

### 2026-11-02 Well-Done 接續：真人照片排序／刪除 D1 原子操作

- **Red → Green／重排**：真 Miniflare 新增 `AP-D1-PHOTO-REORDER-001～003`，Red Job `bf9f3b63-2846-495c-8207-72fb8b82a002`：68 passed／3 failed（`UNKNOWN_COMMAND`）；Green Job `364bb4fe-520d-4de4-ad27-128351101c92`：71/71 passed。
- **Red → Green／刪除**：新增 `AP-D1-PHOTO-DELETE-001～002`，Red Job `7a36007c-c277-430a-96a4-eba3061a2793`：71 passed／2 failed（`UNKNOWN_COMMAND`）；Green Job `04936a45-52c6-4bd4-8b52-eb4cb1f05c9e`：73/73 passed（本 SPEC 真 D1 15 cases）。涵蓋完整集合、跨帳號、pending、重複清單、no-op、過期 revision、撤銷 session、並發 CAS 單一成功、刪後 0～N-1、已刪不可復活。
- **實作**：`cloudflare/src/commands.ts` 新增僅內部的 `profile.photo.reorder` 與 `profile.photo.delete-compact` 固定 SQL；重排透過單一 D1 batch 的 `user_profiles.revision` CAS、完整本人 ready 集合驗證、一次序號變更；正式刪除在同一 D1 batch 做 profile CAS、owner/status 條件軟刪及剩餘 ready 列的 window 排序壓緊。舊 `profile.photo.delete` 保留作 pending 上傳補償，對外刪除不可不經 CAS 逕用舊命令。
- **額外修復 pending→ready 排序競態**：新的 `AP-D1-PHOTO-READY-001` 覆蓋「3 張占位、2 張先 ready 後重排、另一張較晚才 ready」情境；Red Job `221d4c75-1eb3-4974-94d7-2294c7507a0e` **73 passed／1 failed**，確實證明舊邏輯會重複 `display_order`；Green Job `a97051e9-edc7-4963-84f4-d6ce63a1fbc5` **74/74 passed**（本 SPEC 真 D1 16 cases）。`profile.photo.ready` 現於條件式 pending→ready 原子 UPDATE 中，依目前有效 ready 照片的 MAX(display_order)+1 配發序號，不沿用占位時可能過期的原序號。更新後 TypeScript typecheck Job `d7fb6aaf-6a52-4fa1-bde2-467b5ef0ce0f` exit0。
- **Gate 邊界**：這是 SQL 局部證據，不是整項 `AP-IT-003/004`、`AP-UT-005～008` 或 HTTP／R2／前端完成證據；這些完整 ID 仍不勾選。TDD **1/275**、BDD **0/73**、UX **0/13**，M1～M5 仍未完成；兩表24欄／0 Trigger 不變，未部署 local／SIT／production。

### 2026-11-02 Well-Done 再續：本人 Profile Application／HTTP API 與 Unicode 跨層一致性

**本輪為新的局部後端切片，不代表 M1／M2 Gate 完成。完整 TDD 仍僅 1/275、BDD 0/73、前端 UX 0/13。**

- **.NET Application／Red→Green**：新增 `backend/src/DatingHigh.Application/DatingProfileService.cs`，包含 `ProfileUpdateInput` 嚴格19欄完整 JSON 輸入（未知／重複鍵拒絕）、Unicode scalar、臺灣18歲生日界線、標籤陣列與年齡區間；本人 `ReadAsync` 首次冪等 ensure、ready 照片 metadata 安全投影，不回 Email／R2 key；`SaveAsync` 先 ensure 再用固定 `profile.update` revision CAS，0列以 `session.validate` 區分401 `SESSION_REVOKED` 和409 `PROFILE_VERSION_CONFLICT`。新增 `backend/tests/DatingHigh.Unit.Tests/Application/DatingProfileApplicationTests.cs` 15個測試；Red `73b0f16f-3aa8-4192-9182-c4f038c79802` 缺實作編譯失敗、Green `ec1a2333-9c22-4c1d-8f8d-71df5e95399d` 15/15；補 session 撤銷競態 Red `873ac887-f24d-4e65-aced-23711353d371` 14/15、Green `62485696-2b68-4189-a3e4-7004370c295a` 15/15。缺正式版本化目錄、生成角色 ready/owner 查核、共用圖片壓縮，不能勾完整 TDD 項。
- **HTTP API／Red→Green**：`backend/src/DatingHigh.Api/Program.cs`、`HttpContract.cs` 新增受保護 `GET`、`PUT /api/v1/me/dating-profile`，只在該 PUT 啟用 ≤16KiB 完整 JSON parser（含陣列），原 Foundation parser 不改；Web Cookie+Origin、native Bearer 與 family 驗證沿用。`backend/tests/DatingHigh.Api.Tests/DatingProfileEndpointTests.cs` 5個 HTTP fixture 測試，Green `7fb2a88e-d149-4d0d-a313-da9ae62a8773` 5/5，覆蓋無秘密 GET、Web/native PUT、重複／未知鍵、無效登入、Origin、超大 body、409 CAS。Fixture 不是跨服務真 D1/R2 E2E，完整 API Gate 尚未通過。
- **Worker 真 D1 Unicode／Red→Green**：`cloudflare/src/commands.ts` nickname/bio/occupation 改為 Unicode scalar（非 UTF-16 `.length`）；`AP-D1-PROFILE-UNICODE-001` 驗 Emoji、控制碼、surrogate 及長度界線。Red Job `03eee2e9-193d-492b-869e-cf3859d736c9` 74 passed/1 failed，Green Job `435f4859-358c-4863-8496-4068e8ed99f3` 75/75 passed（本 SPEC D1 17 cases）。typecheck `fda53a85-32e6-4e85-a98c-e90e725f478a` exit0。
- **.NET 全回歸**：原 Job `f9d85e03-678e-4e79-8d90-1588ad917a3d` 因舊 Foundation 測試寫死受保護路由總數6而僅1失敗；已改為逐一驗原6個路由與新增2個路由的 PlatformAccess。Green `deea69f5-05eb-4f9d-936a-b9c12ea11ef7` Unit116/116、API58/58、Integration22/22，**196/196**。舊 Foundation Integration 不能冒充此 SPEC 真 D1→HTTP 或跨端 E2E。
- **Gate 保留**：不新增資料表或 Trigger，Foundation六表54欄／本份兩表24欄不變；`0002_avatar_preferences.sql` 僅在 Miniflare 測試套用，未對 local／SIT／production 套用。真 R2 媒體 IO、8MiB 專用上傳與壓縮、真 Gemini、16款正式授權立繪、三平台 UX 尚未完成。完整 TDD **1/275**、BDD **0/73**、UX **0/13**，M1～M5 均不勾選。

### 2026-11-03 Well-Done：本人照片安全 metadata／排序／D1 軟刪除 API

- **本輪實作**：`backend/src/DatingHigh.Application/PersonalPhotosService.cs` 新增完整嚴格 `PhotoOrderInput`（版本、1～5個不重複 UUIDv7、未知／重複 JSON 鍵拒絕）；`ListAsync` 只投影本人 ready 照片安全欄位且二次核對目前 Session；`ReorderAsync` 驗 D1 `profile.photo.reorder` CAS 與變更列數，0列二次區分 401 撤銷／409 舊版；`DeleteAsync` 先查本人 ready 集合與當前 revision，再用已驗 D1 `profile.photo.delete-compact` 軟刪並壓緊其他 ready 照片順序，猜 ID／已刪資產404。沒有回傳 email／objectKey／私人 R2 URL。
- **新 HTTP 路由**：`GET /api/v1/me/photos`、`PUT /api/v1/me/photos/order`、`DELETE /api/v1/me/photos/{assetId}`；全部繼承 PlatformAccess／Web Cookie+Origin／native Bearer。排序 PUT 專用完整 JSON parser，原 Foundation 16KiB 上限和其他端點 body 規則不變；Web DELETE 依原 CSRF 傳空 `{}` JSON，native 可無 body。測試 `backend/tests/DatingHigh.Api.Tests/PersonalPhotoEndpointTests.cs` 與 `ApiFixture.cs`。
- **Red→Green**：6項初始 HTTP fixture，Red `8fc10a72-ee09-4a83-826c-985ccfc0b983` 編譯錯（缺 fixture Photo 種子），Green `cf8a4135-4d00-4896-9afe-f526326ffbf5` **6/6**。追加3項 soft-delete／猜 ID／撤銷／Web Origin，Red `912f3b19-b0fe-4d72-a656-ab9e5dd1c90a` **6 passed／3 failed**，Green `9f0766d3-6a36-4c97-8ba6-2a9cf66806cc` **9/9**。先前照片排序與刪除之真 Miniflare D1 測試仍在 Worker 完整回歸內。Foundation 受保護路由斷言保留原6條，另確認2條 Profile、3條 Photo，總計11條。
- **完整回歸**：.NET Runner `2bf40a46-23ad-4f57-8c4c-bcea6bd379b4` **Unit 116/116、API 67/67、Integration 22/22，合計205/205**；Worker Runner `b732e70c-5d5f-4dd6-b074-5c53f917879a` **75/75**（含本 SPEC 17 個真 D1 cases）；Worker TypeScript Runner `8dd685c2-020b-4bc0-8e24-e259e5a5d9f4` exit0。
- **硬 Gate 不可提前放行**：公開 DELETE **目前只有 D1 邏輯刪除，沒有實際刪除私人 R2 bytes**；專用8MiB媒體上傳、≤200000 bytes真正解碼／壓縮、R2寫入／讀取／清理及故障補償、真 .NET↔Worker↔D1/R2端到端、Gemini逐張生成與三平台UX皆未完成。上述 HTTP fixture 和真 D1 SQL 證據不能單獨勾選 AP-IT-003/004、AP-API-016～024 或 BDD。依完整 Gate 維持 **TDD 1/275、BDD 0/73、前端 UX 0/13**。兩表24欄、零 Trigger 不變；本輪無 local/SIT/production migration、部署或 Git commit。

### 2026-11-03 Well-Done 接續：私人照片真 D1＋R2 串流／刪除及平台工具阻塞

- **已完成的局部實作**：`cloudflare/src/platform.ts` 新增只由內部 `platform.internal` 受控呼叫的 `GET/DELETE /v1/media/personal-photos/{assetId}`，以有效 Session family／cv／到期、D1 owner／asset 狀態及固定 `private/{accountId}/photos/{assetId}` key 保護私人 R2；GET 僅 ready、未刪、MIME 一致、儲存版本小於等於 200000 bytes 才串流，設定 `no-store` 與 `nosniff`；R2 讀取後再次查 D1／Session。DELETE 僅於 D1 已 tombstone 後才能清除 R2，不能直接刪 pending／ready。
- **真整合 Red→Green**：新增 `cloudflare/tests/photo-media-d1-r2.integration.test.ts` 四項真 Miniflare D1＋R2 案例，覆蓋本人 ready 串流、猜測 ID／跨帳號／撤銷／非內部主機、未完成及已軟刪資產不能新讀、D1 tombstone 後才可清 R2、超限與 MIME 不符 fail-closed。Red Runner `97753621-7422-4dce-a42b-bd6acab1df52`（本輪新測試未有媒體 handler，4項失敗），Green Runner `fa6deb45-e2ac-4778-84d1-efee598570b9` **Worker 79/79 通過（7 個測試檔）**，其中本 SPEC 原17項真 D1，另加4項真 D1＋R2。
- **阻塞未假稱通過**：隨後兩次 `datinghigh-platform-typecheck` 工具請求遭 ChatGPT 平台安全檢查拒絕，至本次接續再次被拒絕；實際回應為「此次工具調用已被 OpenAI 的安全檢查封鎖。請再次檢查你傳送的內容。」因此**本次 TS 型別檢查沒有執行證據**，不能引用上一輪通過結果證明目前新增媒體程式可編譯。依使用者平台權限要求停止工具繞行、保留代碼；本次僅補文件證據。
- **尚未通過的完整 Gate**：`GET/DELETE` 目前僅 Worker 內部受控端點；缺 .NET 正式公開 `GET /me/media/{assetId}` stream 串接、刪除後實體 R2 補償／孤兒清理、8 MiB 專用上傳、真正 JPEG/PNG/WebP 安全解碼和 `IImageCompressionService` ≤200000 bytes 壓縮、真 .NET↔Worker↔D1/R2 E2E、三平台 UX／真 Gemini。不得以已通過的四項 worker IT 替代 `AP-IT-004/060/062/065` 的全部要求，也不可勾整項 TDD。
- **整體進度與限制**：完整 TDD 仍 **1/275**（`AP-UT-113`）、BDD **0/73**、前端 UX **0/13**，M1～M5 未完成；本次無新業務表、無 SQL Trigger、無 Local/SIT/production migration，未提交或部署。後續首先須有合法 `datinghigh-platform-typecheck` runner-confirmed exit0，並在交付前回歸 .NET／Worker，才能往媒體 API 及壓縮推進。

### 里程碑

- [ ] M1 — Red→Green：Domain／Application 規則與共用媒體壓縮
- [ ] M2 — 真 Miniflare D1，兩表、全部 API／媒體 R2、原子並發
- [ ] M3 — 真 Gemini 逐張1張、最多四張候選、相似度人工驗收、暫存一小時及選1張
- [ ] M4 — Web／Android／iOS UX、授權及故障驗證（未驗收平台保留明確缺項）
- [ ] M5 — 跨 SPEC 名片契約交付及完整深度稽核

## 🔗 MVP／SPEC／BDD／TDD 追溯矩陣

每個 `AP-BDD` 至少對應 3 個可驗證 TDD 項；每個 TDD ID 只在一項 checklist 中計數。MVP→AP-AC 以 SPEC §1.1 明確的 US-001／002／003 及 US-020 資料契約為準，不能因此把整個 US-020 標完成。

| BDD Scenario | SPEC 驗收 | 對應 TDD |
|---|---|---|
| `AP-BDD-001` | AP-AC-001、AP-AC-020 | `AP-UT-001`、`AP-UT-002`、`AP-IT-001` |
| `AP-BDD-002` | AP-AC-001、AP-AC-009、AP-AC-019 | `AP-UT-003`、`AP-UT-004`、`AP-IT-002`、`AP-API-040` |
| `AP-BDD-003` | AP-AC-001 | `AP-UT-005`、`AP-UT-006`、`AP-IT-003` |
| `AP-BDD-004` | AP-AC-001、AP-AC-015、AP-AC-023 | `AP-UT-007`、`AP-UT-008`、`AP-IT-004`、`AP-IT-065` |
| `AP-BDD-005` | AP-AC-004、AP-AC-017 | `AP-UT-009`、`AP-UT-010`、`AP-IT-005`、`AP-E2E-038` |
| `AP-BDD-006` | AP-AC-004、AP-AC-006 | `AP-UT-011`、`AP-UT-012`、`AP-IT-006` |
| `AP-BDD-007` | AP-AC-005、AP-AC-012、AP-AC-013 | `AP-UT-013`、`AP-UT-014`、`AP-IT-007`、`AP-API-041` |
| `AP-BDD-008` | AP-AC-021 | `AP-UT-015`、`AP-UT-016`、`AP-IT-008` |
| `AP-BDD-009` | AP-AC-011 | `AP-UT-017`、`AP-UT-018`、`AP-IT-009` |
| `AP-BDD-010` | AP-AC-012、AP-AC-015 | `AP-UT-019`、`AP-UT-020`、`AP-IT-010` |
| `AP-BDD-011` | AP-AC-013、AP-AC-014 | `AP-UT-021`、`AP-UT-022`、`AP-IT-011` |
| `AP-BDD-012` | AP-AC-007、AP-AC-008、AP-AC-010 | `AP-UT-023`、`AP-UT-024`、`AP-IT-012` |
| `AP-BDD-013` | AP-AC-015、AP-AC-016、AP-AC-023 | `AP-UT-025`、`AP-UT-026`、`AP-IT-013` |
| `AP-BDD-014` | AP-AC-020 | `AP-UT-027`、`AP-UT-028`、`AP-IT-014` |
| `AP-BDD-015` | AP-AC-002、AP-AC-003、AP-AC-018 | `AP-UT-029`、`AP-UT-030`、`AP-IT-015`、`AP-IT-061` |
| `AP-BDD-016` | AP-AC-003、AP-AC-006 | `AP-UT-031`、`AP-UT-032`、`AP-IT-016` |
| `AP-BDD-017` | AP-AC-003、AP-AC-004 | `AP-UT-033`、`AP-UT-034`、`AP-IT-017` |
| `AP-BDD-018` | AP-AC-019 | `AP-UT-035`、`AP-UT-036`、`AP-IT-018` |
| `AP-BDD-019` | AP-AC-024 | `AP-UT-037`、`AP-UT-038`、`AP-IT-019` |
| `AP-BDD-020` | AP-AC-001、AP-AC-004 | `AP-UT-039`、`AP-UT-040`、`AP-IT-020` |
| `AP-BDD-021` | AP-AC-001、AP-AC-018 | `AP-UT-041`、`AP-UT-042`、`AP-IT-021` |
| `AP-BDD-022` | AP-AC-001 | `AP-UT-043`、`AP-UT-044`、`AP-IT-022` |
| `AP-BDD-023` | AP-AC-003 | `AP-UT-045`、`AP-UT-046`、`AP-IT-023` |
| `AP-BDD-024` | AP-AC-005、AP-AC-012 | `AP-UT-047`、`AP-UT-048`、`AP-IT-024` |
| `AP-BDD-025` | AP-AC-003 | `AP-UT-049`、`AP-UT-050`、`AP-IT-025` |
| `AP-BDD-026` | AP-AC-015、AP-AC-023 | `AP-UT-051`、`AP-UT-052`、`AP-IT-026` |
| `AP-BDD-027` | AP-AC-014 | `AP-UT-053`、`AP-UT-054`、`AP-IT-027` |
| `AP-BDD-028` | AP-AC-009 | `AP-UT-055`、`AP-UT-056`、`AP-IT-028` |
| `AP-BDD-029` | AP-AC-009 | `AP-UT-057`、`AP-UT-058`、`AP-IT-029` |
| `AP-BDD-030` | AP-AC-009、AP-AC-019 | `AP-UT-059`、`AP-UT-060`、`AP-IT-030` |
| `AP-BDD-031` | AP-AC-001 | `AP-UT-061`、`AP-UT-062`、`AP-IT-031` |
| `AP-BDD-032` | AP-AC-007、AP-AC-008 | `AP-UT-063`、`AP-UT-064`、`AP-IT-032` |
| `AP-BDD-033` | AP-AC-007 | `AP-UT-065`、`AP-UT-066`、`AP-IT-033` |
| `AP-BDD-034` | AP-AC-003、AP-AC-024 | `AP-UT-067`、`AP-UT-068`、`AP-IT-034` |
| `AP-BDD-035` | AP-AC-003、AP-AC-024 | `AP-UT-069`、`AP-UT-070`、`AP-IT-035` |
| `AP-BDD-036` | AP-AC-003、AP-AC-018、AP-AC-024 | `AP-UT-071`、`AP-UT-072`、`AP-IT-036` |
| `AP-BDD-037` | AP-AC-003 | `AP-UT-073`、`AP-UT-074`、`AP-IT-037`、`AP-IT-064` |
| `AP-BDD-038` | AP-AC-003、AP-AC-006 | `AP-UT-075`、`AP-UT-076`、`AP-IT-038` |
| `AP-BDD-039` | AP-AC-001 | `AP-UT-077`、`AP-UT-078`、`AP-IT-039` |
| `AP-BDD-040` | AP-AC-003 | `AP-UT-079`、`AP-UT-080`、`AP-IT-040`、`AP-IT-063` |
| `AP-BDD-041` | AP-AC-005、AP-AC-013 | `AP-UT-081`、`AP-UT-082`、`AP-IT-041` |
| `AP-BDD-042` | AP-AC-021 | `AP-UT-083`、`AP-UT-084`、`AP-IT-042` |
| `AP-BDD-043` | AP-AC-016、AP-AC-023 | `AP-UT-085`、`AP-UT-086`、`AP-IT-043` |
| `AP-BDD-044` | AP-AC-016、AP-AC-023 | `AP-UT-087`、`AP-UT-088`、`AP-IT-044` |
| `AP-BDD-045` | AP-AC-005 | `AP-UT-089`、`AP-UT-090`、`AP-IT-045` |
| `AP-BDD-046` | AP-AC-001 | `AP-UT-091`、`AP-UT-092`、`AP-IT-046` |
| `AP-BDD-047` | AP-AC-001 | `AP-UT-093`、`AP-UT-094`、`AP-IT-047`、`AP-IT-057`、`AP-IT-058` |
| `AP-BDD-048` | AP-AC-001 | `AP-UT-095`、`AP-UT-096`、`AP-IT-048` |
| `AP-BDD-049` | AP-AC-001、AP-AC-006 | `AP-UT-097`、`AP-UT-098`、`AP-IT-049`、`AP-IT-059` |
| `AP-BDD-050` | AP-AC-005、AP-AC-021 | `AP-UT-099`、`AP-UT-100`、`AP-IT-050`、`AP-UT-113` |
| `AP-BDD-051` | AP-AC-011、AP-AC-013 | `AP-UT-101`、`AP-UT-102`、`AP-IT-051` |
| `AP-BDD-052` | AP-AC-019 | `AP-UT-103`、`AP-UT-104`、`AP-IT-052`、`AP-IT-062` |
| `AP-BDD-053` | AP-AC-003 | `AP-UT-105`、`AP-UT-106`、`AP-IT-053` |
| `AP-BDD-054` | AP-AC-003 | `AP-UT-107`、`AP-UT-108`、`AP-IT-054` |
| `AP-BDD-055` | AP-AC-023 | `AP-UT-109`、`AP-UT-110`、`AP-IT-055`、`AP-IT-060` |
| `AP-BDD-056` | AP-AC-024 | `AP-UT-111`、`AP-UT-112`、`AP-IT-056` |
| `AP-BDD-057` | AP-AC-001、AP-AC-020 | `AP-E2E-001`、`AP-E2E-002`、`AP-E2E-003` |
| `AP-BDD-058` | AP-AC-004、AP-AC-017 | `AP-E2E-004`、`AP-E2E-005`、`AP-E2E-006` |
| `AP-BDD-059` | AP-AC-001、AP-AC-009 | `AP-E2E-007`、`AP-E2E-008`、`AP-E2E-009` |
| `AP-BDD-060` | AP-AC-001 | `AP-E2E-010`、`AP-E2E-011`、`AP-E2E-012` |
| `AP-BDD-061` | AP-AC-018 | `AP-E2E-013`、`AP-E2E-014`、`AP-E2E-015`、`AP-E2E-037` |
| `AP-BDD-062` | AP-AC-003、AP-AC-018 | `AP-E2E-016`、`AP-E2E-017`、`AP-E2E-018` |
| `AP-BDD-063` | AP-AC-003、AP-AC-022 | `AP-E2E-019`、`AP-E2E-020`、`AP-E2E-021` |
| `AP-BDD-064` | AP-AC-003、AP-AC-024 | `AP-E2E-022`、`AP-E2E-023`、`AP-E2E-024` |
| `AP-BDD-065` | AP-AC-005、AP-AC-012、AP-AC-013、AP-AC-021 | `AP-E2E-025`、`AP-E2E-026`、`AP-E2E-027` |
| `AP-BDD-066` | AP-AC-020、AP-AC-015 | `AP-E2E-028`、`AP-E2E-029`、`AP-E2E-030` |
| `AP-BDD-067` | AP-AC-016、AP-AC-023 | `AP-E2E-031`、`AP-E2E-032`、`AP-E2E-033` |
| `AP-BDD-068` | AP-AC-001、AP-AC-003、AP-AC-012 | `AP-E2E-034`、`AP-E2E-035`、`AP-E2E-036` |

| `AP-BDD-069` | AP-AC-003、AP-AC-018 | `AP-UT-114`、`AP-UT-115`、`AP-IT-066`、`AP-API-042` |
| `AP-BDD-070` | AP-AC-003 | `AP-UT-116`、`AP-UT-117`、`AP-IT-067`、`AP-API-043` |
| `AP-BDD-071` | AP-AC-003、AP-AC-024 | `AP-UT-118`、`AP-UT-119`、`AP-IT-068`、`AP-API-044` |
| `AP-BDD-072` | AP-AC-003、AP-AC-024 | `AP-UT-120`、`AP-UT-121`、`AP-IT-069` |
| `AP-BDD-073` | AP-AC-003、AP-AC-018 | `AP-E2E-039`、`AP-E2E-040`、`AP-E2E-041` |

## 1️⃣ 單元測試（Unit Tests）

.NET Domain/Application 隔離規則、可固定 clock/provider；所有業務判斷的正常／拒絕均需先 Red 後 Green。

- [x] `AP-UT-001` **`PhotoPurposeNotice_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-001`（AP-AC-001、AP-AC-020）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人已登入且目前沒有照片；執行 本人開啟照片管理並選擇上傳；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-002` **`PhotoPurposeNotice_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-001`（AP-AC-001、AP-AC-020）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人開啟照片管理並選擇上傳；斷言 顯示「請提供自己最滿意的個人照，未來同意的情況下提供對方交換名片時查閱」；並且 並告知照片將在本人主動啟用 AI 時提供第三方生成服務。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-003` **`PersonalPhotoUpload_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-002`（AP-AC-001、AP-AC-009、AP-AC-019）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人選擇兩張有效圖片且單張不超過8 MiB；執行 本人依序上傳照片；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-004` **`PersonalPhotoUpload_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-002`（AP-AC-001、AP-AC-009、AP-AC-019）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人依序上傳照片；斷言 系統透過共用壓縮將每張壓至200000 bytes以下並寫入私人 R2；並且 D1 僅保留本人 pending→ready 的照片資產，不存原始未壓縮檔。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-005` **`PersonalPhotoReorder_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-003`（AP-AC-001）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人已有三張 ready 個人照且持有目前 revision；執行 本人提交包含全部三張資產的全新順序；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-006` **`PersonalPhotoReorder_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-003`（AP-AC-001）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人提交包含全部三張資產的全新順序；斷言 本人照片顯示順序依提交清單更新；並且 不產生額外照片及不改動其他帳號資料。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-007` **`PersonalPhotoDelete_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-004`（AP-AC-001、AP-AC-015、AP-AC-023）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人有一張 ready 照片且已授權的同輪名片讀取存在；執行 本人刪除該照片後對方再提出有效名片讀取；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-008` **`PersonalPhotoDelete_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-004`（AP-AC-001、AP-AC-015、AP-AC-023）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人刪除該照片後對方再提出有效名片讀取；斷言 已刪照片不再列於即時名片且不能重新取得影像；並且 已刪照不作下次 AI 輸入並可排程清除 R2。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-009` **`BuiltinAvatarCatalog_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-005`（AP-AC-004、AP-AC-017）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人已登入；執行 本人開啟免費化身選擇清單；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-010` **`BuiltinAvatarCatalog_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-005`（AP-AC-004、AP-AC-017）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人開啟免費化身選擇清單；斷言 顯示 male-01 至 male-08 與 female-01 至 female-08 共16個不同立繪；並且 任何使用者都能跨風格分組自由選用且不要求照片。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-011` **`SelectBuiltinAvatar_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-006`（AP-AC-004、AP-AC-006）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人已取得合法 builtin ID 且 revision 最新；執行 本人選取免費角色並重新登入另一裝置；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-012` **`SelectBuiltinAvatar_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-006`（AP-AC-004、AP-AC-006）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人選取免費角色並重新登入另一裝置；斷言 目前遊戲化身仍為相同的 builtin ID；並且 保留暱稱、職業與其他既有個人資料。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-013` **`SaveDatingProfile_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-007`（AP-AC-005、AP-AC-012、AP-AC-013）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人有最新 revision 及合法資料欄位；執行 本人儲存暱稱、自介、工作、標籤、生活偏好與擇偶條件；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-014` **`SaveDatingProfile_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-007`（AP-AC-005、AP-AC-012、AP-AC-013）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人儲存暱稱、自介、工作、標籤、生活偏好與擇偶條件；斷言 資料以 user_profiles 的固定 JSON 契約保存；並且 下次 GET 回傳同一目前版本且 revision 增加1。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-015` **`AdultProfileReady_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-008`（AP-AC-021）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人出生日期符合臺灣日期下已滿18歲且已有合法暱稱與免費化身；執行 本人儲存並重新讀取個人資料；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-016` **`AdultProfileReady_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-008`（AP-AC-021）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人儲存並重新讀取個人資料；斷言 profileReady 為 true；並且 精確生日只供後端且不出現在他人投影。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-017` **`InterestCatalog_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-009`（AP-AC-011）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：版本化目錄至少涵蓋文創、戶外、美食、影劇動漫、心理測驗；執行 本人開啟目錄並儲存合法標籤；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-018` **`InterestCatalog_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-009`（AP-AC-011）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人開啟目錄並儲存合法標籤；斷言 使用代碼而非 label 持久化三組興趣資料；並且 舊代碼停用後既存資料仍可辨識。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-019` **`CurrentCardProfile_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-010`（AP-AC-012、AP-AC-015）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人已填寫 occupation、生活習慣與價值觀；執行 受信任服務以有效同意內容讀取名片；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-020` **`CurrentCardProfile_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-010`（AP-AC-012、AP-AC-015）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 受信任服務以有效同意內容讀取名片；斷言 回傳本人當前工作和生活描述；並且 不含私人擇偶條件或登入帳號秘密。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-021` **`MatchingInputProjection_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-011`（AP-AC-013、AP-AC-014）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人已保存合法年齡範圍、地區、興趣權重及標籤；執行 已授權的 MatchingSessions 服務要求配對輸入；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-022` **`MatchingInputProjection_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-011`（AP-AC-013、AP-AC-014）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 已授權的 MatchingSessions 服務要求配對輸入；斷言 只回傳目前配對演算法必需的欄位；並且 不回傳真人照、Email、原型固定候選或他人資料。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-023` **`CandidatePersonaProjection_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-012`（AP-AC-007、AP-AC-008、AP-AC-010）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：配對服務已對本輪候選完成授權；執行 呼叫取得候選人物投影；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-024` **`CandidatePersonaProjection_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-012`（AP-AC-007、AP-AC-008、AP-AC-010）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 呼叫取得候選人物投影；斷言 回傳當前選用化身與有限公開暱稱資訊；並且 不含真人照、occupation、生日、Email 或擇偶私有資料。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-025` **`AuthorizedCardPhoto_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-013`（AP-AC-015、AP-AC-016、AP-AC-023）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：同輪雙方已有效同意且互動未終止；執行 授權服務請求當前名片與受控照片串流；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-026` **`AuthorizedCardPhoto_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-013`（AP-AC-015、AP-AC-016、AP-AC-023）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 授權服務請求當前名片與受控照片串流；斷言 讀到最新 ready 照片的200KB壓縮版；並且 不產生任何名片快照或公開 R2 URL。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-027` **`MyCardPreview_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-014`（AP-AC-020）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人已填入工作、興趣與照片；執行 本人開啟我的名片預覽；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-028` **`MyCardPreview_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-014`（AP-AC-020）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人開啟我的名片預覽；斷言 顯示本人當前可分享的欄位與照片；並且 預覽權限不提供另一人讀取授權。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-029` **`GenerateOneAvatar_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-015`（AP-AC-002、AP-AC-003、AP-AC-018）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人已保存至少兩張 ready 真人照並已閱讀產圖頁第三方送照提醒；操作 本人按「開始產生第1張」；驗證只允許合法狀態繼續 IO。

- [x] `AP-UT-030` **`GenerateOneAvatar_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-015`（AP-AC-002、AP-AC-003、AP-AC-018）
  - **前置／動作／預期**：以替身 Repository／Clock／Provider 操作：本人按「開始產生第1張」；斷言 後端只呼叫本次一張 Gemini 並回傳一張真正可預覽的插畫，不要求一口氣取得四張；另驗 回傳 attemptId、index=1、producedCount=1 及60分鐘到期資訊。失敗不污染既有狀態、日誌不留秘密。

- [x] `AP-UT-031` **`SelectGeneratedAvatar_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-016`（AP-AC-003、AP-AC-006）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人已依序成功產生三張私人 R2 候選且 revision 為最新；操作 本人回選第2張、看完採用警語後按「確認採用」；驗證只允許合法狀態繼續 IO。

- [x] `AP-UT-032` **`SelectGeneratedAvatar_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-016`（AP-AC-003、AP-AC-006）
  - **前置／動作／預期**：以替身 Repository／Clock／Provider 操作：本人回選第2張、看完採用警語後按「確認採用」；斷言 只有所選第2張正式寫入 user_media_assets 並更新目前遊戲化身，本輪隨即關閉；另驗 其餘已成功兩張不建立正式媒體列，未確認前舊化身維持不變。失敗不污染既有狀態、日誌不留秘密。

- [x] `AP-UT-033` **`ReselectGeneratedAvatar_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-017`（AP-AC-003、AP-AC-004）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人擁有先前成功選定且仍為 ready 的 generated_avatar；執行 本人切換至該正式 assetId；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-034` **`ReselectGeneratedAvatar_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-017`（AP-AC-003、AP-AC-004）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人切換至該正式 assetId；斷言 選用的 generated_avatar 被持久化為目前化身；並且 無需重新呼叫生成服務也不須新增圖片。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-035` **`ReusableImageCompression_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-018`（AP-AC-019）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：另一個服務提供符合介面契約的圖片 stream 與 targetBytes；執行 該服務呼叫同一 IImageCompressionService；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-036` **`ReusableImageCompression_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-018`（AP-AC-019）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 該服務呼叫同一 IImageCompressionService；斷言 得到正確 MIME、寬高及小於等於目標的壓縮輸出；並且 實作未依賴 avatar 名稱、R2 或照片數量規則。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-037` **`GeminiLiveVerification_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-019`（AP-AC-024）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：測試環境以安全方式配置使用者授權的 Gemini API 憑證與真人照片；操作 本人明確要求單張生成，後端啟用真實 Gemini API；驗證只允許合法狀態繼續 IO。

- [x] `AP-UT-038` **`GeminiLiveVerification_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-019`（AP-AC-024）
  - **前置／動作／預期**：以替身 Repository／Clock／Provider 操作：本人明確要求單張生成，後端啟用真實 Gemini API；斷言 每次成功真正產出一張可預覽的3:4插畫並記錄非敏感的模型版本與耗時／用量證據；另驗 客戶端、Git與日誌均不包含秘密或原始人像，未產出圖片不能假成功。失敗不污染既有狀態、日誌不留秘密。

- [x] `AP-UT-039` **`FreeWithoutPhotos_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-020`（AP-AC-001、AP-AC-004）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人沒有任何真人照片；執行 本人選取 male-03 或 female-07；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-040` **`FreeWithoutPhotos_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-020`（AP-AC-001、AP-AC-004）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人選取 male-03 或 female-07；斷言 可以成功選用免費角色並進入已具備條件的個人資料流程；並且 不觸發 Gemini、付費或強制照片欄位。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-041` **`InsufficientSourcePhotos_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-021`（AP-AC-001、AP-AC-018）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人只有0或1張 ready 真人照；執行 本人點擊 AI 鎖頭；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-042` **`InsufficientSourcePhotos_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-021`（AP-AC-001、AP-AC-018）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人點擊 AI 鎖頭；斷言 顯示至少需要兩張已保存真人照的提示；並且 不發送 AI provider 請求也不改動目前化身。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-043` **`ReplaceAtPhotoLimit_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-022`（AP-AC-001）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人已持有五張 ready 真人照；執行 本人刪除一張後再上傳一張有效照片；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-044` **`ReplaceAtPhotoLimit_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-022`（AP-AC-001）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人刪除一張後再上傳一張有效照片；斷言 新照片可占用釋放的第五個額度；並且 已刪照片不能復活或混入當前名片。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-045` **`AbandonGeneratedCandidates_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-023`（AP-AC-003）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人已有當前免費角色與一至三張本輪已成功候選；操作 本人暫不採用並離開產圖畫面；驗證只允許合法狀態繼續 IO。

- [x] `AP-UT-046` **`AbandonGeneratedCandidates_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-023`（AP-AC-003）
  - **前置／動作／預期**：以替身 Repository／Clock／Provider 操作：本人暫不採用並離開產圖畫面；斷言 目前遊戲化身保持不變且已成功候選在60分鐘效期內仍可由本人依參照安全預覽；另驗 到期才拒絕讀取／清理，沒有正式資產、付款或自動產下一張。失敗不污染既有狀態、日誌不留秘密。

- [x] `AP-UT-047` **`OptionalOccupation_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-024`（AP-AC-005、AP-AC-012）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人已有成年生日、暱稱及合法角色；執行 本人將 occupation 設為 null；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-048` **`OptionalOccupation_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-024`（AP-AC-005、AP-AC-012）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人將 occupation 設為 null；斷言 可成功保存並完成最小設定；並且 名片不會憑空顯示虛構職業。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-049` **`RetryExpiredAttempt_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-025`（AP-AC-003）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人的上次 attempt 已超過60分鐘；操作 本人在照片足夠時再次主動按「開始產生第1張」；驗證只允許合法狀態繼續 IO。

- [x] `AP-UT-050` **`RetryExpiredAttempt_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-025`（AP-AC-003）
  - **前置／動作／預期**：以替身 Repository／Clock／Provider 操作：本人在照片足夠時再次主動按「開始產生第1張」；斷言 建立新的獨立短效本輪、只請求一張，不恢復舊 provider 執行；另驗 先前候選已失效且需提示重試可能有供應商成本，但本 MVP 不扣款。失敗不污染既有狀態、日誌不留秘密。

- [ ] `AP-UT-051` **`LiveCardRefresh_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-026`（AP-AC-015、AP-AC-023）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：有效名片交換後本人修改 occupation 與照片；執行 同輪對方在互動仍有效時重新讀取名片；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-052` **`LiveCardRefresh_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-026`（AP-AC-015、AP-AC-023）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 同輪對方在互動仍有效時重新讀取名片；斷言 只顯示新的 occupation 和現存 ready 照片；並且 不從配對當時或前次名片讀取快照。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-053` **`PersistAfterRelogin_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-027`（AP-AC-014）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人已儲存偏好及正式選用角色；執行 本人重新登入 Web 或原生裝置；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-054` **`PersistAfterRelogin_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-027`（AP-AC-014）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人重新登入 Web 或原生裝置；斷言 讀取同一帳號最新個人資料、照片清單與化身；並且 不因 Session family 改變而重新產生使用者資料。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-055` **`RejectOversizePhoto_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-028`（AP-AC-009）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人選擇一張大於8 MiB的照片；執行 本人送出照片上傳；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-056` **`RejectOversizePhoto_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-028`（AP-AC-009）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人送出照片上傳；斷言 回傳413 IMAGE_TOO_LARGE；並且 R2 不保存原始檔且 D1 不增加 ready 照片。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-057` **`RejectForgedImage_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-029`（AP-AC-009）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：檔名為 .jpg 但內容不是可解碼影像；執行 本人嘗試上傳；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-058` **`RejectForgedImage_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-029`（AP-AC-009）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人嘗試上傳；斷言 回傳400 INVALID_IMAGE；並且 不得產生可讀的圖片資產或洩漏解碼例外。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-059` **`RejectUncompressibleImage_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-030`（AP-AC-009、AP-AC-019）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：圖片經安全解碼仍無法在畫質限制內壓至200000 bytes；執行 本人上傳該圖片；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-060` **`RejectUncompressibleImage_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-030`（AP-AC-009、AP-AC-019）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人上傳該圖片；斷言 回傳413 COMPRESSED_IMAGE_TOO_LARGE；並且 不改存未壓縮原檔，也不破壞已存照片。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-061` **`RejectSixthPhoto_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-031`（AP-AC-001）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人已有五張 pending 或 ready 本人照；執行 本人再上傳第六張；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-062` **`RejectSixthPhoto_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-031`（AP-AC-001）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人再上傳第六張；斷言 回傳409 PHOTO_LIMIT_REACHED；並且 資料庫不得新增第六張或殘留可讀 R2 孤兒。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-063` **`RejectForeignMedia_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-032`（AP-AC-007、AP-AC-008）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：A 擁有私人照和正式 AI 圖片，B 已登入但沒有授權；執行 B 猜出 A 的 assetId 嘗試取得影像；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-064` **`RejectForeignMedia_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-032`（AP-AC-007、AP-AC-008）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 B 猜出 A 的 assetId 嘗試取得影像；斷言 伺服器以本人擁有權驗證拒絕存取；並且 不公開圖片存在性、R2 objectKey 或持久 URL。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-065` **`RejectRevokedSession_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-033`（AP-AC-007）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人舊 Session family 已被新登入撤銷；執行 舊憑證請求照片或選用化身；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-066` **`RejectRevokedSession_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-033`（AP-AC-007）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 舊憑證請求照片或選用化身；斷言 回傳401 SESSION_REVOKED；並且 不得把舊請求寫入任何帳號的資料。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-067` **`RejectMissingSingleImage_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-034`（AP-AC-003、AP-AC-024）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本輪已有兩張有效候選但這次 Gemini 沒有回傳可解碼圖片；操作 本人按「產生下一張」要求第3張；驗證只允許合法狀態繼續 IO。

- [x] `AP-UT-068` **`RejectMissingSingleImage_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-034`（AP-AC-003、AP-AC-024）
  - **前置／動作／預期**：以替身 Repository／Clock／Provider 操作：本人按「產生下一張」要求第3張；斷言 本次回傳503 IMAGE_PROVIDER_UNAVAILABLE 或明確失敗，producedCount 保持2；另驗 既有兩張依舊可預覽／採用，不能刪掉、冒充第3張或自動重送。失敗不污染既有狀態、日誌不留秘密。

- [x] `AP-UT-069` **`RejectDuplicateCandidate_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-035`（AP-AC-003、AP-AC-024）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本輪已有一張成功候選，provider 回傳 byte-identical 的圖片；操作 本人要求產生下一張，後端比對已有候選；驗證只允許合法狀態繼續 IO。

- [x] `AP-UT-070` **`RejectDuplicateCandidate_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-035`（AP-AC-003、AP-AC-024）
  - **前置／動作／預期**：以替身 Repository／Clock／Provider 操作：本人要求產生下一張，後端比對已有候選；斷言 這次不產生新的 index，也不增加 producedCount，提示可主動再試；另驗 先前候選保持可選，禁止複製舊圖冒充新成果。失敗不污染既有狀態、日誌不留秘密。

- [x] `AP-UT-071` **`HandleSingleGeminiFailure_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-036`（AP-AC-003、AP-AC-018、AP-AC-024）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：Gemini 不可用、限額不足或本張請求超時，且本輪已有一張成功候選；操作 本人要求第二張插畫；驗證只允許合法狀態繼續 IO。

- [x] `AP-UT-072` **`HandleSingleGeminiFailure_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-036`（AP-AC-003、AP-AC-018、AP-AC-024）
  - **前置／動作／預期**：以替身 Repository／Clock／Provider 操作：本人要求第二張插畫；斷言 明確回傳503 IMAGE_PROVIDER_UNAVAILABLE 或429 RATE_LIMITED；若供應商狀態不確定須顯示不可自動重送；另驗 第一張候選仍有效、舊化身不變，沒有假圖或自動繼續產生。失敗不污染既有狀態、日誌不留秘密。

- [x] `AP-UT-073` **`RejectExpiredCandidate_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-037`（AP-AC-003）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：attemptId 已超過60分鐘；執行 本人試圖預覽或選擇過期候選；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-074` **`RejectExpiredCandidate_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-037`（AP-AC-003）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人試圖預覽或選擇過期候選；斷言 預覽回410 AVATAR_CANDIDATE_EXPIRED；並且 不得新增正式媒體資產或改動目前化身。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-075` **`RejectForeignAvatarSelection_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-038`（AP-AC-003、AP-AC-006）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：B 持有 A 的 attemptId 或 generated assetId；執行 B 試圖將該圖設為自己的角色；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-076` **`RejectForeignAvatarSelection_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-038`（AP-AC-003、AP-AC-006）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 B 試圖將該圖設為自己的角色；斷言 回傳404或400 INVALID_AVATAR_SELECTION；並且 B 的目前角色及兩個帳號資產均維持原狀。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-077` **`CompensateFailedPhotoStorage_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-039`（AP-AC-001）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：照片在 D1 成功占位但 R2 上傳失敗；執行 後端執行失敗補償；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-078` **`CompensateFailedPhotoStorage_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-039`（AP-AC-001）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 後端執行失敗補償；斷言 本人該筆 pending 標記 deleted 且不可對外顯示；並且 不洩漏未壓縮 bytes，重試可正常占用額度。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-079` **`CompensateFailedAvatarSelection_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-040`（AP-AC-003）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：候選圖已複製到正式 R2 但 D1 CAS 失敗；執行 後端執行補償；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-080` **`CompensateFailedAvatarSelection_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-040`（AP-AC-003）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 後端執行補償；斷言 標記失敗的正式媒體列 deleted 並清除 R2 孤兒；並且 目前原化身仍有效且其他候選不持久化。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-081` **`RejectInvalidProfilePayload_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-041`（AP-AC-005、AP-AC-013）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人送未知鍵、非法年齡範圍或非法標籤代碼；執行 本人更新個人資料；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-082` **`RejectInvalidProfilePayload_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-041`（AP-AC-005、AP-AC-013）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人更新個人資料；斷言 回傳400 INVALID_PROFILE；並且 revision、JSON 內容及其他資料保持原值。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-083` **`RejectUnderageProfile_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-042`（AP-AC-021）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人輸入未滿18歲的有效生日；執行 本人嘗試完成個人資料設定；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-084` **`RejectUnderageProfile_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-042`（AP-AC-021）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人嘗試完成個人資料設定；斷言 profileReady 為 false 且交友入口被阻擋；並且 不得把尚未完成成年驗證當作已成年。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-085` **`RejectUnconsentedCard_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-043`（AP-AC-016、AP-AC-023）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：雙方尚未完成同輪名片交換同意；執行 B 試圖查閱 A 的名片與私人照；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-086` **`RejectUnconsentedCard_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-043`（AP-AC-016、AP-AC-023）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 B 試圖查閱 A 的名片與私人照；斷言 內部受控查詢拒絕；並且 即使知道對方 assetId 也不能經本人路由繞過。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-087` **`RejectTerminatedCard_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-044`（AP-AC-016、AP-AC-023）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：A、B 曾同意名片但該輪已終止或 B 換成另一輪；執行 B 請求 A 的新資料或新照片；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-088` **`RejectTerminatedCard_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-044`（AP-AC-016、AP-AC-023）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 B 請求 A 的新資料或新照片；斷言 授權服務拒絕新讀取；並且 先前見過的影像不能因此生成新的永久授權 URL。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-089` **`RejectStaleProfileRevision_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-045`（AP-AC-005）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人同時開啟兩個版本相同的編輯頁；執行 第一頁成功更新後第二頁儲存舊 expectedRevision；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-090` **`RejectStaleProfileRevision_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-045`（AP-AC-005）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 第一頁成功更新後第二頁儲存舊 expectedRevision；斷言 第二頁回409 PROFILE_VERSION_CONFLICT；並且 第一頁更新保留且前端提示重新載入。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-091` **`RejectInvalidPhotoOrder_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-046`（AP-AC-001）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人提供不完整、重複或含其他人的照片排序清單；執行 本人送出排序；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-092` **`RejectInvalidPhotoOrder_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-046`（AP-AC-001）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人送出排序；斷言 回傳400 INVALID_PROFILE 或409 PROFILE_VERSION_CONFLICT；並且 所有原照片順序和 revision 保持不變。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-093` **`AtomicFifthSixthInsert_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-047`（AP-AC-001）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人已有四張 pending 或 ready 真人照；執行 兩個來源同時向同一 D1 執行受控條件 INSERT；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-094` **`AtomicFifthSixthInsert_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-047`（AP-AC-001）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 兩個來源同時向同一 D1 執行受控條件 INSERT；斷言 最多一筆新增成功且最終有效數量恰為5；並且 資料庫不存在 CREATE TRIGGER 且敗者回409 PHOTO_LIMIT_REACHED。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-095` **`PendingReservationCounts_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-048`（AP-AC-001）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人有四張 ready 及一張 pending 真人照；執行 另外一個請求嘗試上傳；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-096` **`PendingReservationCounts_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-048`（AP-AC-001）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 另外一個請求嘗試上傳；斷言 單一條件 INSERT 不得新增第六筆 pending；並且 pending 超時由既有清理處理但不能靠清理才限制額度。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-097` **`ImmutableMediaIdentity_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-049`（AP-AC-001、AP-AC-006）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：已存在一筆 deleted 媒體資產；執行 呼叫者試圖走受控 command 變更 account_id、kind、object_key 或改回 ready；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-098` **`ImmutableMediaIdentity_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-049`（AP-AC-001、AP-AC-006）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 呼叫者試圖走受控 command 變更 account_id、kind、object_key 或改回 ready；斷言 平台拒絕非法欄位與狀態變化；並且 不使用 Trigger 且所有受控入口維持同一不變式。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-099` **`UnicodeAndAgeBoundary_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-050`（AP-AC-005、AP-AC-021）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：測試時鐘固定在臺灣日期並準備邊界生日；執行 本人依序輸入剛滿18歲與差一天未滿18歲生日；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-100` **`UnicodeAndAgeBoundary_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-050`（AP-AC-005、AP-AC-021）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人依序輸入剛滿18歲與差一天未滿18歲生日；斷言 僅剛滿18歲能使 profileReady 為 true；並且 暱稱以 Unicode scalar 計數且拒絕控制字元與孤立 surrogate。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-101` **`JsonPreferenceBoundaries_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-051`（AP-AC-011、AP-AC-013）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人提供各組可達的合法最大選取數（取欄位上限與目前目錄數的較小值；topic 上限仍為8、現有6碼）的 traits、interest、topic、value 與 region 陣列；執行 本人儲存並接著測試重複及超上限元素；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-102` **`JsonPreferenceBoundaries_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-051`（AP-AC-011、AP-AC-013）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人儲存並接著測試重複及超上限元素；斷言 上限合法資料保存且重複、未知鍵、超限資料被拒絕；並且 preferredAgeMin/Max 成對且18至120、Min不大於Max。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-103` **`CompressionExactBoundary_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-052`（AP-AC-019）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：不同影像大小剛好等於200000 bytes並透過分段輸入；執行 共用壓縮服務處理輸入；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-104` **`CompressionExactBoundary_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-052`（AP-AC-019）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 共用壓縮服務處理輸入；斷言 成功輸出小於或等於200000 bytes；並且 保留長寬比、方向與五官可辨識，不保留 EXIF/GPS。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-105` **`CandidateIndexBoundary_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-053`（AP-AC-003）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人持有尚未到期、只成功產出索引1與2的 attemptId；操作 本人請求索引0、3、5或他人 attemptId；驗證只允許合法狀態繼續 IO。

- [x] `AP-UT-106` **`CandidateIndexBoundary_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-053`（AP-AC-003）
  - **前置／動作／預期**：以替身 Repository／Clock／Provider 操作：本人請求索引0、3、5或他人 attemptId；斷言 僅實際存在且屬本人的1與2可讀，其餘索引拒絕；另驗 R2 key 從 server CurrentUser.accountId 推導，且最多容許索引4。失敗不污染既有狀態、日誌不留秘密。

- [x] `AP-UT-107` **`AvatarSelectionRace_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-054`（AP-AC-003）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人有兩個有效候選且同時送同一 expectedRevision；執行 兩個不同選用請求同時提交；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-108` **`AvatarSelectionRace_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-054`（AP-AC-003）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 兩個不同選用請求同時提交；斷言 只有一個 CAS 成功且 revision 增加1；並且 落敗的複製檔案被補償，最終唯一角色仍可讀。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-109` **`CardTerminationRace_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-055`（AP-AC-023）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：B 在同輪授權讀取 A 的照片之同時互動被終止；執行 後端準備開啟新的照片串流；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-110` **`CardTerminationRace_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-055`（AP-AC-023）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 後端準備開啟新的照片串流；斷言 必須在開啟時核對有效同意與互動狀態；並且 不得因以前有同意就取得新增照片或新內容。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-111` **`SecretExposureBoundary_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-056`（AP-AC-024）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：Gemini server secret 與本人照片已配置於測試環境；執行 執行成功與故障生成、產出客戶端 bundle；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-112` **`SecretExposureBoundary_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-056`（AP-AC-024）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 執行成功與故障生成、產出客戶端 bundle；斷言 日誌、API response、bundle、R2 object key 均無明碼秘密或 raw source；並且 僅留下去識別的驗證證據。失敗時保留既有狀態及無秘密 log。

### [補強] 2026-11-01 實作前稽核追加 UT 測試（1項）

**來源**：[RiskAudit](../specs/SPEC-001-AvatarAndPreferences-RiskAudit.md) 的 `RG-01`～`RG-14`；使用者已確認 RQ-01=A／RQ-02=A。測試尚未執行。

- [x] `AP-UT-113` **`CalculateAdultAge_LeapDayAndTaiwanMidnight_UsesFixedClock`**
  - **稽核缺漏**：`RG-14`；**優先級**：低；**BDD**：`AP-BDD-050`；**來源**：RA-12、BDD-050
  - **測試位置**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **前置／操作**：以固定台灣時鐘測閏年2/29出生、剛滿18、差一天未滿18與午夜交界
  - **預期斷言**：固定時鐘驗2月29日、邊界當日及前一日，未成年不能 profileReady。不得以 Mock、Fixture 或單一平台成功冒充要求的真整合與跨平台結果。
  - **2026-11-02 Runner 實證**：`DatingHigh.Unit.Tests/Domain/AvatarAndPreferencesPolicyTests.cs` 固定 UTC 時鐘 15:59:59→16:00:00 對應臺灣午夜，並驗閏年2月29與未滿／剛滿18；Red `c583d845-b24e-43b7-850c-f9b65f793025`，Green 全 Unit `f1f7a1e8-cb58-4dfa-af0d-d94410c9a540` **101/101**。純 Domain 規則通過，不代表 HTTP 或 E2E 通過。

### 2026-11-02 D-050 逐張生成新增 UT 測試（8項）

以下測試源自已確認 D-050，尚未實作或執行；保留原本測試ID，新增本輪唯一測試ID。

- [x] `AP-UT-114` **`GenerateOneCandidate_FirstImageApproved_DoesNotRequestRemainingThree`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-069`（AP-AC-003、AP-AC-018／024；D-050）
  - **前置／動作／預期**：模擬只產出第一張且使用者立即確定採用；預期 驗 Gemini 僅被呼叫一次、後續三張均未請求、目前免費且採用後本輪關閉。

- [x] `AP-UT-115` **`ChooseFirstCandidate_ConfirmOnce_OnlyOneAssetCreated`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-069`（AP-AC-003、AP-AC-018／024；D-050）
  - **前置／動作／預期**：模擬首次真圖、採用確認及重複送出選用；預期 驗只新增1張正式生成 asset、profile revision 只增加1、重複不二次建立。

- [x] `AP-UT-116` **`KeepSkippedCandidate_WhenNewOneArrives_PreservesEarlierReference`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-070`（AP-AC-003、AP-AC-018／024；D-050）
  - **前置／動作／預期**：模擬本輪第1張暫不採用，接著成功產生第2張；預期 驗候選清單保留1與2，前端只有短效參照、不存持久圖片資料。

- [x] `AP-UT-117` **`SelectEarlierCandidate_AfterSecondResult_PersistsOnlySelected`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-070`（AP-AC-003、AP-AC-018／024；D-050）
  - **前置／動作／預期**：模擬回選第1張並確認採用；預期 驗只正式化第1張、候選2不寫入 user_media_assets。

- [x] `AP-UT-118` **`ReserveCandidateSlot_ConcurrentRequests_AllowsSingleInFlight`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-071`（AP-AC-003、AP-AC-018／024；D-050）
  - **前置／動作／預期**：以同帳號兩分頁不同 clientRequestId 競爭第4張；預期 只有一個 inFlight 取得權利，另一個409；同 id 重送不再次呼叫 provider。

- [x] `AP-UT-119` **`RejectFifthCandidate_AfterFourSuccesses_DoesNotChargeProvider`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-071`（AP-AC-003、AP-AC-018／024；D-050）
  - **前置／動作／預期**：本輪 manifest producedCount=4、closed 或過期；預期 拒絕第5張與已關閉請求，provider 呼叫次數不增加。

- [x] `AP-UT-120` **`ProviderTimeout_AfterTwoCandidates_DoesNotIncrementCount`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-072`（AP-AC-003、AP-AC-018／024；D-050）
  - **前置／動作／預期**：已有2張候選，第3張失敗或超時；預期 確認 producedCount 仍2、保留先前2圖並保留原化身。

- [x] `AP-UT-121` **`UnknownProviderCost_DoesNotAutoRetrySameRequest`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-072`（AP-AC-003、AP-AC-018／024；D-050）
  - **前置／動作／預期**：假設供應商狀態未知且 client 重送相同 requestId；預期 不自動重新消耗成本／新增候選，需使用者明確再次操作、限流再驗。

## 2️⃣ 集成測試（Integration Tests）

實際 Miniflare D1／R2 私有資產與系統故障注入；SQL 不得只用 SQLite in-memory 或 stub 當真實結論。

- [x] `AP-IT-001` **`PhotoPurposeNotice_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-001`（AP-AC-001、AP-AC-020）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人已登入且目前沒有照片；When 本人開啟照片管理並選擇上傳；Then 顯示「請提供自己最滿意的個人照，未來同意的情況下提供對方交換名片時查閱」；And 並告知照片將在本人主動啟用 AI 時提供第三方生成服務。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-002` **`PersonalPhotoUpload_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-002`（AP-AC-001、AP-AC-009、AP-AC-019）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人選擇兩張有效圖片且單張不超過8 MiB；When 本人依序上傳照片；Then 系統透過共用壓縮將每張壓至200000 bytes以下並寫入私人 R2；And D1 僅保留本人 pending→ready 的照片資產，不存原始未壓縮檔。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-003` **`PersonalPhotoReorder_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-003`（AP-AC-001）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人已有三張 ready 個人照且持有目前 revision；When 本人提交包含全部三張資產的全新順序；Then 本人照片顯示順序依提交清單更新；And 不產生額外照片及不改動其他帳號資料。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-004` **`PersonalPhotoDelete_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-004`（AP-AC-001、AP-AC-015、AP-AC-023）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人有一張 ready 照片且已授權的同輪名片讀取存在；When 本人刪除該照片後對方再提出有效名片讀取；Then 已刪照片不再列於即時名片且不能重新取得影像；And 已刪照不作下次 AI 輸入並可排程清除 R2。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-005` **`BuiltinAvatarCatalog_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-005`（AP-AC-004、AP-AC-017）
  - **前置／動作／預期**：應用整合（可替身 provider，但 Gemini 真測另列）：Given 本人已登入；When 本人開啟免費化身選擇清單；Then 顯示 male-01 至 male-08 與 female-01 至 female-08 共16個不同立繪；And 任何使用者都能跨風格分組自由選用且不要求照片。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-006` **`SelectBuiltinAvatar_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-006`（AP-AC-004、AP-AC-006）
  - **前置／動作／預期**：應用整合（可替身 provider，但 Gemini 真測另列）：Given 本人已取得合法 builtin ID 且 revision 最新；When 本人選取免費角色並重新登入另一裝置；Then 目前遊戲化身仍為相同的 builtin ID；And 保留暱稱、職業與其他既有個人資料。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-007` **`SaveDatingProfile_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-007`（AP-AC-005、AP-AC-012、AP-AC-013）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人有最新 revision 及合法資料欄位；When 本人儲存暱稱、自介、工作、標籤、生活偏好與擇偶條件；Then 資料以 user_profiles 的固定 JSON 契約保存；And 下次 GET 回傳同一目前版本且 revision 增加1。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-008` **`AdultProfileReady_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-008`（AP-AC-021）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人出生日期符合臺灣日期下已滿18歲且已有合法暱稱與免費化身；When 本人儲存並重新讀取個人資料；Then profileReady 為 true；And 精確生日只供後端且不出現在他人投影。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-009` **`InterestCatalog_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-009`（AP-AC-011）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 版本化目錄至少涵蓋文創、戶外、美食、影劇動漫、心理測驗；When 本人開啟目錄並儲存合法標籤；Then 使用代碼而非 label 持久化三組興趣資料；And 舊代碼停用後既存資料仍可辨識。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-010` **`CurrentCardProfile_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-010`（AP-AC-012、AP-AC-015）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人已填寫 occupation、生活習慣與價值觀；When 受信任服務以有效同意內容讀取名片；Then 回傳本人當前工作和生活描述；And 不含私人擇偶條件或登入帳號秘密。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-011` **`MatchingInputProjection_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-011`（AP-AC-013、AP-AC-014）
  - **前置／動作／預期**：應用整合（可替身 provider，但 Gemini 真測另列）：Given 本人已保存合法年齡範圍、地區、興趣權重及標籤；When 已授權的 MatchingSessions 服務要求配對輸入；Then 只回傳目前配對演算法必需的欄位；And 不回傳真人照、Email、原型固定候選或他人資料。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-012` **`CandidatePersonaProjection_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-012`（AP-AC-007、AP-AC-008、AP-AC-010）
  - **前置／動作／預期**：應用整合（可替身 provider，但 Gemini 真測另列）：Given 配對服務已對本輪候選完成授權；When 呼叫取得候選人物投影；Then 回傳當前選用化身與有限公開暱稱資訊；And 不含真人照、occupation、生日、Email 或擇偶私有資料。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-013` **`AuthorizedCardPhoto_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-013`（AP-AC-015、AP-AC-016、AP-AC-023）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 同輪雙方已有效同意且互動未終止；When 授權服務請求當前名片與受控照片串流；Then 讀到最新 ready 照片的200KB壓縮版；And 不產生任何名片快照或公開 R2 URL。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-014` **`MyCardPreview_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-014`（AP-AC-020）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人已填入工作、興趣與照片；When 本人開啟我的名片預覽；Then 顯示本人當前可分享的欄位與照片；And 預覽權限不提供另一人讀取授權。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-015` **`GenerateOneAvatar_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-015`（AP-AC-002、AP-AC-003、AP-AC-018）
  - **前置／動作／預期**：以真 D1／私人 R2、受控 provider 故障注入測試：Given 本人已保存至少兩張 ready 真人照並已閱讀產圖頁第三方送照提醒；When 本人按「開始產生第1張」；Then 後端只呼叫本次一張 Gemini 並回傳一張真正可預覽的插畫，不要求一口氣取得四張；And 回傳 attemptId、index=1、producedCount=1 及60分鐘到期資訊。需驗資料及授權、不得只比對 HTTP Mock；真 Gemini 證據另列。

- [x] `AP-IT-016` **`SelectGeneratedAvatar_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-016`（AP-AC-003、AP-AC-006）
  - **前置／動作／預期**：以真 D1／私人 R2、受控 provider 故障注入測試：Given 本人已依序成功產生三張私人 R2 候選且 revision 為最新；When 本人回選第2張、看完採用警語後按「確認採用」；Then 只有所選第2張正式寫入 user_media_assets 並更新目前遊戲化身，本輪隨即關閉；And 其餘已成功兩張不建立正式媒體列，未確認前舊化身維持不變。需驗資料及授權、不得只比對 HTTP Mock；真 Gemini 證據另列。

- [x] `AP-IT-017` **`ReselectGeneratedAvatar_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-017`（AP-AC-003、AP-AC-004）
  - **前置／動作／預期**：應用整合（可替身 provider，但 Gemini 真測另列）：Given 本人擁有先前成功選定且仍為 ready 的 generated_avatar；When 本人切換至該正式 assetId；Then 選用的 generated_avatar 被持久化為目前化身；And 無需重新呼叫生成服務也不須新增圖片。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-018` **`ReusableImageCompression_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-018`（AP-AC-019）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 另一個服務提供符合介面契約的圖片 stream 與 targetBytes；When 該服務呼叫同一 IImageCompressionService；Then 得到正確 MIME、寬高及小於等於目標的壓縮輸出；And 實作未依賴 avatar 名稱、R2 或照片數量規則。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-019` **`GeminiLiveVerification_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-019`（AP-AC-024）
  - **前置／動作／預期**：以真 D1／私人 R2、受控 provider 故障注入測試：Given 測試環境以安全方式配置使用者授權的 Gemini API 憑證與真人照片；When 本人明確要求單張生成，後端啟用真實 Gemini API；Then 每次成功真正產出一張可預覽的3:4插畫並記錄非敏感的模型版本與耗時／用量證據；And 客戶端、Git與日誌均不包含秘密或原始人像，未產出圖片不能假成功。需驗資料及授權、不得只比對 HTTP Mock；真 Gemini 證據另列。

- [x] `AP-IT-020` **`FreeWithoutPhotos_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-020`（AP-AC-001、AP-AC-004）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人沒有任何真人照片；When 本人選取 male-03 或 female-07；Then 可以成功選用免費角色並進入已具備條件的個人資料流程；And 不觸發 Gemini、付費或強制照片欄位。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-021` **`InsufficientSourcePhotos_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-021`（AP-AC-001、AP-AC-018）
  - **前置／動作／預期**：應用整合（可替身 provider，但 Gemini 真測另列）：Given 本人只有0或1張 ready 真人照；When 本人點擊 AI 鎖頭；Then 顯示至少需要兩張已保存真人照的提示；And 不發送 AI provider 請求也不改動目前化身。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-022` **`ReplaceAtPhotoLimit_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-022`（AP-AC-001）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人已持有五張 ready 真人照；When 本人刪除一張後再上傳一張有效照片；Then 新照片可占用釋放的第五個額度；And 已刪照片不能復活或混入當前名片。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-023` **`AbandonGeneratedCandidates_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-023`（AP-AC-003）
  - **前置／動作／預期**：以真 D1／私人 R2、受控 provider 故障注入測試：Given 本人已有當前免費角色與一至三張本輪已成功候選；When 本人暫不採用並離開產圖畫面；Then 目前遊戲化身保持不變且已成功候選在60分鐘效期內仍可由本人依參照安全預覽；And 到期才拒絕讀取／清理，沒有正式資產、付款或自動產下一張。需驗資料及授權、不得只比對 HTTP Mock；真 Gemini 證據另列。

- [x] `AP-IT-024` **`OptionalOccupation_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-024`（AP-AC-005、AP-AC-012）
  - **前置／動作／預期**：應用整合（可替身 provider，但 Gemini 真測另列）：Given 本人已有成年生日、暱稱及合法角色；When 本人將 occupation 設為 null；Then 可成功保存並完成最小設定；And 名片不會憑空顯示虛構職業。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-025` **`RetryExpiredAttempt_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-025`（AP-AC-003）
  - **前置／動作／預期**：以真 D1／私人 R2、受控 provider 故障注入測試：Given 本人的上次 attempt 已超過60分鐘；When 本人在照片足夠時再次主動按「開始產生第1張」；Then 建立新的獨立短效本輪、只請求一張，不恢復舊 provider 執行；And 先前候選已失效且需提示重試可能有供應商成本，但本 MVP 不扣款。需驗資料及授權、不得只比對 HTTP Mock；真 Gemini 證據另列。

- [ ] `AP-IT-026` **`LiveCardRefresh_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-026`（AP-AC-015、AP-AC-023）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 有效名片交換後本人修改 occupation 與照片；When 同輪對方在互動仍有效時重新讀取名片；Then 只顯示新的 occupation 和現存 ready 照片；And 不從配對當時或前次名片讀取快照。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-027` **`PersistAfterRelogin_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-027`（AP-AC-014）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人已儲存偏好及正式選用角色；When 本人重新登入 Web 或原生裝置；Then 讀取同一帳號最新個人資料、照片清單與化身；And 不因 Session family 改變而重新產生使用者資料。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-028` **`RejectOversizePhoto_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-028`（AP-AC-009）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人選擇一張大於8 MiB的照片；When 本人送出照片上傳；Then 回傳413 IMAGE_TOO_LARGE；And R2 不保存原始檔且 D1 不增加 ready 照片。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-029` **`RejectForgedImage_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-029`（AP-AC-009）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 檔名為 .jpg 但內容不是可解碼影像；When 本人嘗試上傳；Then 回傳400 INVALID_IMAGE；And 不得產生可讀的圖片資產或洩漏解碼例外。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-030` **`RejectUncompressibleImage_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-030`（AP-AC-009、AP-AC-019）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 圖片經安全解碼仍無法在畫質限制內壓至200000 bytes；When 本人上傳該圖片；Then 回傳413 COMPRESSED_IMAGE_TOO_LARGE；And 不改存未壓縮原檔，也不破壞已存照片。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-031` **`RejectSixthPhoto_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-031`（AP-AC-001）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人已有五張 pending 或 ready 本人照；When 本人再上傳第六張；Then 回傳409 PHOTO_LIMIT_REACHED；And 資料庫不得新增第六張或殘留可讀 R2 孤兒。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-032` **`RejectForeignMedia_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-032`（AP-AC-007、AP-AC-008）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given A 擁有私人照和正式 AI 圖片，B 已登入但沒有授權；When B 猜出 A 的 assetId 嘗試取得影像；Then 伺服器以本人擁有權驗證拒絕存取；And 不公開圖片存在性、R2 objectKey 或持久 URL。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-033` **`RejectRevokedSession_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-033`（AP-AC-007）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人舊 Session family 已被新登入撤銷；When 舊憑證請求照片或選用化身；Then 回傳401 SESSION_REVOKED；And 不得把舊請求寫入任何帳號的資料。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-034` **`RejectMissingSingleImage_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-034`（AP-AC-003、AP-AC-024）
  - **前置／動作／預期**：以真 D1／私人 R2、受控 provider 故障注入測試：Given 本輪已有兩張有效候選但這次 Gemini 沒有回傳可解碼圖片；When 本人按「產生下一張」要求第3張；Then 本次回傳503 IMAGE_PROVIDER_UNAVAILABLE 或明確失敗，producedCount 保持2；And 既有兩張依舊可預覽／採用，不能刪掉、冒充第3張或自動重送。需驗資料及授權、不得只比對 HTTP Mock；真 Gemini 證據另列。

- [x] `AP-IT-035` **`RejectDuplicateCandidate_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-035`（AP-AC-003、AP-AC-024）
  - **前置／動作／預期**：以真 D1／私人 R2、受控 provider 故障注入測試：Given 本輪已有一張成功候選，provider 回傳 byte-identical 的圖片；When 本人要求產生下一張，後端比對已有候選；Then 這次不產生新的 index，也不增加 producedCount，提示可主動再試；And 先前候選保持可選，禁止複製舊圖冒充新成果。需驗資料及授權、不得只比對 HTTP Mock；真 Gemini 證據另列。

- [x] `AP-IT-036` **`HandleSingleGeminiFailure_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-036`（AP-AC-003、AP-AC-018、AP-AC-024）
  - **前置／動作／預期**：以真 D1／私人 R2、受控 provider 故障注入測試：Given Gemini 不可用、限額不足或本張請求超時，且本輪已有一張成功候選；When 本人要求第二張插畫；Then 明確回傳503 IMAGE_PROVIDER_UNAVAILABLE 或429 RATE_LIMITED；若供應商狀態不確定須顯示不可自動重送；And 第一張候選仍有效、舊化身不變，沒有假圖或自動繼續產生。需驗資料及授權、不得只比對 HTTP Mock；真 Gemini 證據另列。

- [x] `AP-IT-037` **`RejectExpiredCandidate_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-037`（AP-AC-003）
  - **前置／動作／預期**：應用整合（可替身 provider，但 Gemini 真測另列）：Given attemptId 已超過60分鐘；When 本人試圖預覽或選擇過期候選；Then 預覽回410 AVATAR_CANDIDATE_EXPIRED；And 不得新增正式媒體資產或改動目前化身。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-038` **`RejectForeignAvatarSelection_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-038`（AP-AC-003、AP-AC-006）
  - **前置／動作／預期**：應用整合（可替身 provider，但 Gemini 真測另列）：Given B 持有 A 的 attemptId 或 generated assetId；When B 試圖將該圖設為自己的角色；Then 回傳404或400 INVALID_AVATAR_SELECTION；And B 的目前角色及兩個帳號資產均維持原狀。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-039` **`CompensateFailedPhotoStorage_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-039`（AP-AC-001）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 照片在 D1 成功占位但 R2 上傳失敗；When 後端執行失敗補償；Then 本人該筆 pending 標記 deleted 且不可對外顯示；And 不洩漏未壓縮 bytes，重試可正常占用額度。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-040` **`CompensateFailedAvatarSelection_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-040`（AP-AC-003）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 候選圖已複製到正式 R2 但 D1 CAS 失敗；When 後端執行補償；Then 標記失敗的正式媒體列 deleted 並清除 R2 孤兒；And 目前原化身仍有效且其他候選不持久化。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-041` **`RejectInvalidProfilePayload_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-041`（AP-AC-005、AP-AC-013）
  - **前置／動作／預期**：應用整合（可替身 provider，但 Gemini 真測另列）：Given 本人送未知鍵、非法年齡範圍或非法標籤代碼；When 本人更新個人資料；Then 回傳400 INVALID_PROFILE；And revision、JSON 內容及其他資料保持原值。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-042` **`RejectUnderageProfile_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-042`（AP-AC-021）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人輸入未滿18歲的有效生日；When 本人嘗試完成個人資料設定；Then profileReady 為 false 且交友入口被阻擋；And 不得把尚未完成成年驗證當作已成年。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-043` **`RejectUnconsentedCard_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-043`（AP-AC-016、AP-AC-023）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 雙方尚未完成同輪名片交換同意；When B 試圖查閱 A 的名片與私人照；Then 內部受控查詢拒絕；And 即使知道對方 assetId 也不能經本人路由繞過。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-044` **`RejectTerminatedCard_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-044`（AP-AC-016、AP-AC-023）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given A、B 曾同意名片但該輪已終止或 B 換成另一輪；When B 請求 A 的新資料或新照片；Then 授權服務拒絕新讀取；And 先前見過的影像不能因此生成新的永久授權 URL。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-045` **`RejectStaleProfileRevision_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-045`（AP-AC-005）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人同時開啟兩個版本相同的編輯頁；When 第一頁成功更新後第二頁儲存舊 expectedRevision；Then 第二頁回409 PROFILE_VERSION_CONFLICT；And 第一頁更新保留且前端提示重新載入。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-046` **`RejectInvalidPhotoOrder_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-046`（AP-AC-001）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人提供不完整、重複或含其他人的照片排序清單；When 本人送出排序；Then 回傳400 INVALID_PROFILE 或409 PROFILE_VERSION_CONFLICT；And 所有原照片順序和 revision 保持不變。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-047` **`AtomicFifthSixthInsert_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-047`（AP-AC-001）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人已有四張 pending 或 ready 真人照；When 兩個來源同時向同一 D1 執行受控條件 INSERT；Then 最多一筆新增成功且最終有效數量恰為5；And 資料庫不存在 CREATE TRIGGER 且敗者回409 PHOTO_LIMIT_REACHED。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-048` **`PendingReservationCounts_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-048`（AP-AC-001）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人有四張 ready 及一張 pending 真人照；When 另外一個請求嘗試上傳；Then 單一條件 INSERT 不得新增第六筆 pending；And pending 超時由既有清理處理但不能靠清理才限制額度。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-049` **`ImmutableMediaIdentity_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-049`（AP-AC-001、AP-AC-006）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 已存在一筆 deleted 媒體資產；When 呼叫者試圖走受控 command 變更 account_id、kind、object_key 或改回 ready；Then 平台拒絕非法欄位與狀態變化；And 不使用 Trigger 且所有受控入口維持同一不變式。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-050` **`UnicodeAndAgeBoundary_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-050`（AP-AC-005、AP-AC-021）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 測試時鐘固定在臺灣日期並準備邊界生日；When 本人依序輸入剛滿18歲與差一天未滿18歲生日；Then 僅剛滿18歲能使 profileReady 為 true；And 暱稱以 Unicode scalar 計數且拒絕控制字元與孤立 surrogate。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-051` **`JsonPreferenceBoundaries_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-051`（AP-AC-011、AP-AC-013）
  - **前置／動作／預期**：應用整合（可替身 provider，但 Gemini 真測另列）：Given 本人提供各組可達的合法最大選取數（取欄位上限與目前目錄數的較小值；topic 上限仍為8、現有6碼）的 traits、interest、topic、value 與 region 陣列；When 本人儲存並接著測試重複及超上限元素；Then 上限合法資料保存且重複、未知鍵、超限資料被拒絕；And preferredAgeMin/Max 成對且18至120、Min不大於Max。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-052` **`CompressionExactBoundary_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-052`（AP-AC-019）
  - **前置／動作／預期**：應用整合（可替身 provider，但 Gemini 真測另列）：Given 不同影像大小剛好等於200000 bytes並透過分段輸入；When 共用壓縮服務處理輸入；Then 成功輸出小於或等於200000 bytes；And 保留長寬比、方向與五官可辨識，不保留 EXIF/GPS。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-053` **`CandidateIndexBoundary_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-053`（AP-AC-003）
  - **前置／動作／預期**：以真 D1／私人 R2、受控 provider 故障注入測試：Given 本人持有尚未到期、只成功產出索引1與2的 attemptId；When 本人請求索引0、3、5或他人 attemptId；Then 僅實際存在且屬本人的1與2可讀，其餘索引拒絕；And R2 key 從 server CurrentUser.accountId 推導，且最多容許索引4。需驗資料及授權、不得只比對 HTTP Mock；真 Gemini 證據另列。

- [x] `AP-IT-054` **`AvatarSelectionRace_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-054`（AP-AC-003）
  - **前置／動作／預期**：應用整合（可替身 provider，但 Gemini 真測另列）：Given 本人有兩個有效候選且同時送同一 expectedRevision；When 兩個不同選用請求同時提交；Then 只有一個 CAS 成功且 revision 增加1；And 落敗的複製檔案被補償，最終唯一角色仍可讀。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-055` **`CardTerminationRace_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-055`（AP-AC-023）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given B 在同輪授權讀取 A 的照片之同時互動被終止；When 後端準備開啟新的照片串流；Then 必須在開啟時核對有效同意與互動狀態；And 不得因以前有同意就取得新增照片或新內容。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-056` **`SecretExposureBoundary_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-056`（AP-AC-024）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given Gemini server secret 與本人照片已配置於測試環境；When 執行成功與故障生成、產出客戶端 bundle；Then 日誌、API response、bundle、R2 object key 均無明碼秘密或 raw source；And 僅留下去識別的驗證證據。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

### [補強] 2026-11-01 實作前稽核追加 IT 測試（9項）

**來源**：[RiskAudit](../specs/SPEC-001-AvatarAndPreferences-RiskAudit.md) 的 `RG-01`～`RG-14`；使用者已確認 RQ-01=A／RQ-02=A。測試尚未執行。

- [x] `AP-IT-057` **`InsertPhoto_ParallelFifthSixthRequests_OnlyOneSucceeds`**
  - **稽核缺漏**：`RG-02`；**優先級**：高；**BDD**：`AP-BDD-047`；**來源**：RA-03、BDD-047/048
  - **測試位置**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **前置／操作**：真 Miniflare D1 已有4張ready，同帳號兩獨立請求競爭第5／第6張
  - **預期斷言**：兩個獨立客戶端同時入庫，pending／ready 計數確定≤5，失敗不能留可讀 R2。不得以 Mock、Fixture 或單一平台成功冒充要求的真整合與跨平台結果。

- [x] `AP-IT-058` **`InsertPhoto_ConditionalReturningNoRow_MapsToPhotoLimit409`**
  - **稽核缺漏**：`RG-03`；**優先級**：高；**BDD**：`AP-BDD-047`；**來源**：RA-03、BDD-047
  - **測試位置**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **前置／操作**：真 Miniflare D1 已有5張pending+ready，執行單句prepared條件INSERT並讀RETURNING/changing count
  - **預期斷言**：用真 D1 讀 `RETURNING`／`changes` 結果；不能將0列看作成功，無 SQL Trigger。不得以 Mock、Fixture 或單一平台成功冒充要求的真整合與跨平台結果。

- [x] `AP-IT-059` **`MediaCommands_IdentityFieldsAndIllegalTransitions_RejectMutation`**
  - **稽核缺漏**：`RG-04`；**優先級**：高；**BDD**：`AP-BDD-049`；**來源**：RA-03、BDD-049
  - **測試位置**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **前置／操作**：逐一嘗試受控命令修改owner/kind/objectKey、deleted→ready、ready→pending與跨帳號寫入
  - **預期斷言**：列出所有 command 可用更新欄位，禁止改 owner/kind/objectKey、deleted復活、ready倒回pending；同時測命令繞行。不得以 Mock、Fixture 或單一平台成功冒充要求的真整合與跨平台結果。

- [ ] `AP-IT-060` **`OpenAuthorizedCardPhoto_TerminateDuringRead_DeniesNewStreams`**
  - **稽核缺漏**：`RG-05`；**優先級**：高；**BDD**：`AP-BDD-055`；**來源**：RA-04、BDD-055
  - **測試位置**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **前置／操作**：名片有效雙方同意後在讀資料／開照片串流前終止互動或換輪，並驗client偽造授權context
  - **預期斷言**：名片授權 context 不能 client 偽造，互動終止和照片開串流之間重新驗證。不得以 Mock、Fixture 或單一平台成功冒充要求的真整合與跨平台結果。

- [x] `AP-IT-061` **`GenerateAvatar_LiveGeminiSingleImagePerRequestWithBoundedCost`**
  - **稽核缺漏**：`RG-07`；**優先級**：中；**BDD**：`AP-BDD-015`；**來源**：RA-01、AP-BDD-015/034/035/036
  - **測試位置**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **前置／操作**：真Gemini 2～5張已存來源，每張請求僅生成1張，另外注入無圖、重複圖與單張逾時並量測成本。
  - **預期斷言**：真 Gemini 每個請求只回1張真圖、可解碼／安全／互異且成功才計入 producedCount；逐張驗證耗時、費用、R2與同帳號排他，沒有圖片／超時不得假成功或清除先前有效候選。不以Mock、Fixture冒充真測。

- [x] `AP-IT-062` **`CompressPersonalPhoto_FaceRegionAndPortraitOrientation_AcceptsHumanQualityReview`**
  - **稽核缺漏**：`RG-08`；**優先級**：中；**BDD**：`AP-BDD-052`；**來源**：RA-07、AP-BDD-002/052/063
  - **測試位置**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **前置／操作**：以授權真人照通過分段stream壓縮到200000bytes、核對比例/EXIF、人工驗人臉相似度
  - **預期斷言**：200000 bytes來源照的臉部可辨識與比例；生成角色格式獨立，不對其套200KB來源照限制。不得以 Mock、Fixture 或單一平台成功冒充要求的真整合與跨平台結果。

- [x] `AP-IT-063` **`SelectGeneratedAvatar_AfterR2CopyBeforeD1Commit_CompensatesOrphan`**
  - **稽核缺漏**：`RG-10`；**優先級**：中；**BDD**：`AP-BDD-040`；**來源**：RA-09、BDD-040/054
  - **測試位置**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **前置／操作**：真D1/R2完成候選複製但在選用revision CAS前注入失敗與並發
  - **預期斷言**：選中只有一張轉永久；兩個 CAS 同時選、R2已複製但 D1 失敗需補償並保留舊化身。不得以 Mock、Fixture 或單一平台成功冒充要求的真整合與跨平台結果。

- [x] `AP-IT-064` **`AvatarCandidate_At60MinuteExpiry_RefusesReadAndSelection`**
  - **稽核缺漏**：`RG-11`；**優先級**：中；**BDD**：`AP-BDD-037`；**來源**：RA-09、AP-BDD-037/053
  - **測試位置**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **前置／操作**：固定時鐘於候選59:59、60:00、60:01及跨帳號讀取與選用
  - **預期斷言**：候選59:59可用、60:00與之後必不可讀；R2 lifecycle延遲亦不可繞過 metadata 失效。不得以 Mock、Fixture 或單一平台成功冒充要求的真整合與跨平台結果。

- [ ] `AP-IT-065` **`DeletedPersonalPhoto_WithCachedOrGuessedUrl_DeniesFreshRead`**
  - **稽核缺漏**：`RG-13`；**優先級**：中；**BDD**：`AP-BDD-004`；**來源**：RA-11、BDD-004/026
  - **測試位置**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **前置／操作**：合法名片後本人刪照、換照或終止，他方持舊assetId、URL與快取嘗試新增讀取
  - **預期斷言**：刪照後即時名片新讀取不含舊 assetId；持舊URL不能再次新增讀取。不得以 Mock、Fixture 或單一平台成功冒充要求的真整合與跨平台結果。

### 2026-11-02 D-050 逐張生成新增 IT 測試（4項）

以下測試源自已確認 D-050，尚未實作或執行；保留原本測試ID，新增本輪唯一測試ID。

- [x] `AP-IT-066` **`SingleGeneratedCandidate_ConfirmedFirst_PersistsOnlyOne`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-069`（AP-AC-003、AP-AC-018／024；D-050）
  - **前置／動作／預期**：以真 R2／D1 成功產生第1張並立即採用；預期 永久R2及DB僅1張候選，成功後關閉短效本輪、沒有後續 Gemini 請求。

- [x] `AP-IT-067` **`PreviouslySkippedCandidate_StillReadableAndSelectable`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-070`（AP-AC-003、AP-AC-018／024；D-050）
  - **前置／動作／預期**：真私人R2短效有兩張有效候選，第二張產出後回選第一張；預期 效期內第一張可讀並被正式採用；第二張仍不落正式DB，到期由GC清理。

- [x] `AP-IT-068` **`R2ManifestConditionalWrite_AcrossWorkers_EnforcesOneInFlightAndMaxFour`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-071`（AP-AC-003、AP-AC-018／024；D-050）
  - **前置／動作／預期**：真 R2／Worker 不同實例同帳號同時用不同 attemptId 爭搶首次 open attempt，以及同輪並行產第4張；另測重送與過期 inFlight；預期 R2 manifest 條件寫入／CAS嚴格跨 attempt 僅一個 active 指標、同輪僅一個有效 inFlight 占位，絕不發第5張或重複呼叫；未能證實則阻擋硬Gate。

- [x] `AP-IT-069` **`SingleFailure_LeavesValidEarlierCandidatesAndNoGhostIndex`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-072`（AP-AC-003、AP-AC-018／024；D-050）
  - **前置／動作／預期**：真R2已有2張，第3張 provider故障、重複或未知計費而回503；預期 先前2張仍可讀／採用，server成功數不變且不產生假 index，不自動重試。

## 3️⃣ API 端點測試（API Tests）

WebApplicationFactory 與可用的真平台橋接，驗證每條 §7 路由與 Cookie／Bearer／CSRF／ProblemDetails。

**API→SPEC→BDD 追溯對照**：本節各端點的三項 `Success`、`InvalidOrUnauthorized`、`WebNativeBoundary` 均依此表回鏈；其餘單元／整合測試依前節逐場景矩陣回鏈。

**稽核新增 API 追溯**：`AP-API-040`（RG-01）→ `POST /api/v1/me/photos`／`AP-BDD-002`；`AP-API-041`（RG-09）→ `PUT /api/v1/me/dating-profile`／`AP-BDD-007`。它們是原有三類 API 測試外的新增斷言。

| API endpoint | AP-AC | BDD 情境 |
|---|---|---|
| `GET /profile-catalog` | AP-AC-011 | AP-BDD-009、AP-BDD-051 |
| `GET /avatar-catalog` | AP-AC-004、AP-AC-017 | AP-BDD-005、AP-BDD-058 |
| `GET /me/dating-profile` | AP-AC-005、AP-AC-012、AP-AC-013、AP-AC-021 | AP-BDD-007、AP-BDD-008、AP-BDD-065 |
| `PUT /me/dating-profile` | AP-AC-005、AP-AC-012、AP-AC-013、AP-AC-021 | AP-BDD-007、AP-BDD-041、AP-BDD-045、AP-BDD-065 |
| `POST /me/photos` | AP-AC-001、AP-AC-009、AP-AC-019、AP-AC-020 | AP-BDD-001、AP-BDD-002、AP-BDD-028、AP-BDD-029、AP-BDD-030、AP-BDD-031、AP-BDD-047、AP-BDD-048、AP-BDD-059 |
| `GET /me/photos` | AP-AC-001、AP-AC-007 | AP-BDD-002、AP-BDD-003、AP-BDD-032 |
| `PUT /me/photos/order` | AP-AC-001 | AP-BDD-003、AP-BDD-046、AP-BDD-060 |
| `DELETE /me/photos/{assetId}` | AP-AC-001、AP-AC-023 | AP-BDD-004、AP-BDD-022、AP-BDD-060 |
| `GET /me/media/{assetId}` | AP-AC-007、AP-AC-008、AP-AC-016 | AP-BDD-012、AP-BDD-032、AP-BDD-043 |
| `POST /me/avatar/generations` | AP-AC-002、AP-AC-003、AP-AC-018、AP-AC-024 | AP-BDD-015、AP-BDD-021、AP-BDD-034、AP-BDD-035、AP-BDD-061、AP-BDD-062 |
| `GET /me/avatar/candidates/{attemptId}/{index}` | AP-AC-003、AP-AC-007 | AP-BDD-015、AP-BDD-036、AP-BDD-053、AP-BDD-063 |
| `PUT /me/avatar/selection` | AP-AC-003、AP-AC-004、AP-AC-006 | AP-BDD-006、AP-BDD-016、AP-BDD-017、AP-BDD-037、AP-BDD-054、AP-BDD-063 |
| `GET /me/card-preview` | AP-AC-015、AP-AC-020 | AP-BDD-014、AP-BDD-066 |


- [x] `AP-API-001` **`GetProfileCatalog_Success_ReturnsDocumentedResponse`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/profile-catalog`（AP-AC）
  - **前置／動作／預期**：使用本人有效 Web Cookie／native Bearer 呼叫 GET /api/v1/profile-catalog；斷言 200 與 camelCase JSON／對應串流、no-store、預期的完整 DTO。回應包含五類版本化標籤；不依賴登入Email。

- [x] `AP-API-002` **`GetProfileCatalog_InvalidOrUnauthorized_ReturnsProblemDetails`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/profile-catalog`（AP-AC）
  - **前置／動作／預期**：以不合法輸入／撤銷 Session／跨 owner 對 GET /api/v1/profile-catalog 送出請求；惡意 query 依Foundation共通傳輸回400 INVALID_REQUEST，撤銷回401 SESSION_REVOKED，均驗對應ProblemDetails；不得成功寫入或洩漏私人欄位。2026-11-04澄清傳輸錯誤與交友欄位驗證的區別，不改既有Foundation錯誤碼。

- [x] `AP-API-003` **`GetProfileCatalog_WebNativeBoundary_EnforcesTransport`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/profile-catalog`（AP-AC）
  - **前置／動作／預期**：以 Web Origin／clientPlatform 與原生 Bearer 分別呼叫 GET /api/v1/profile-catalog；驗既有同意的 CSRF／Session family 規則、嚴格 body schema 與 Content-Type；圖片串流不得放寬全域 16 KiB JSON 限制。

- [x] `AP-API-004` **`GetAvatarCatalog_Success_ReturnsDocumentedResponse`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/avatar-catalog`（AP-AC）
  - **前置／動作／預期**：使用本人有效 Web Cookie／native Bearer 呼叫 GET /api/v1/avatar-catalog；斷言 200 與 camelCase JSON／對應串流、no-store、預期的完整 DTO。16個正式不同的 male/female 插畫資產、ID有效。

- [x] `AP-API-005` **`GetAvatarCatalog_InvalidOrUnauthorized_ReturnsProblemDetails`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/avatar-catalog`（AP-AC）
  - **前置／動作／預期**：以不合法輸入／撤銷 Session／跨 owner 對 GET /api/v1/avatar-catalog 送出請求；驗 401 SESSION_REVOKED 對應 ProblemDetails；不得成功寫入或洩漏私人欄位。

- [x] `AP-API-006` **`GetAvatarCatalog_WebNativeBoundary_EnforcesTransport`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/avatar-catalog`（AP-AC）
  - **前置／動作／預期**：以 Web Origin／clientPlatform 與原生 Bearer 分別呼叫 GET /api/v1/avatar-catalog；驗既有同意的 CSRF／Session family 規則、嚴格 body schema 與 Content-Type；圖片串流不得放寬全域 16 KiB JSON 限制。

- [x] `AP-API-007` **`GetDatingProfile_Success_ReturnsDocumentedResponse`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/me/dating-profile`（AP-AC）
  - **前置／動作／預期**：使用本人有效 Web Cookie／native Bearer 呼叫 GET /api/v1/me/dating-profile；斷言 200 與 camelCase JSON／對應串流、no-store、預期的完整 DTO。owner以已驗證CurrentUser約束，不接受client傳owner或回傳認證識別；驗revision、profileReady、目前照片metadata，隱藏密鑰。

- [x] `AP-API-008` **`GetDatingProfile_InvalidOrUnauthorized_ReturnsProblemDetails`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/me/dating-profile`（AP-AC）
  - **前置／動作／預期**：以不合法輸入／撤銷 Session／跨 owner 對 GET /api/v1/me/dating-profile 送出請求；驗 401 SESSION_REVOKED 對應 ProblemDetails；不得成功寫入或洩漏私人欄位。

- [x] `AP-API-009` **`GetDatingProfile_WebNativeBoundary_EnforcesTransport`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/me/dating-profile`（AP-AC）
  - **前置／動作／預期**：以 Web Origin／clientPlatform 與原生 Bearer 分別呼叫 GET /api/v1/me/dating-profile；驗既有同意的 CSRF／Session family 規則、嚴格 body schema 與 Content-Type；圖片串流不得放寬全域 16 KiB JSON 限制。

- [x] `AP-API-010` **`PutDatingProfile_Success_ReturnsDocumentedResponse`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 PUT /api/v1/me/dating-profile`（AP-AC）
  - **前置／動作／預期**：使用本人有效 Web Cookie／native Bearer 呼叫 PUT /api/v1/me/dating-profile；斷言 200 與 camelCase JSON／對應串流、no-store、預期的完整 DTO。合法生日、工作、固定 JSON 欄位與 CAS；敗者不覆蓋。

- [x] `AP-API-011` **`PutDatingProfile_InvalidOrUnauthorized_ReturnsProblemDetails`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 PUT /api/v1/me/dating-profile`（AP-AC）
  - **前置／動作／預期**：以不合法輸入／撤銷 Session／跨 owner 對 PUT /api/v1/me/dating-profile 送出請求；驗 409 PROFILE_VERSION_CONFLICT／400 INVALID_PROFILE 對應 ProblemDetails；不得成功寫入或洩漏私人欄位。

- [x] `AP-API-012` **`PutDatingProfile_WebNativeBoundary_EnforcesTransport`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 PUT /api/v1/me/dating-profile`（AP-AC）
  - **前置／動作／預期**：以 Web Origin／clientPlatform 與原生 Bearer 分別呼叫 PUT /api/v1/me/dating-profile；驗既有同意的 CSRF／Session family 規則、嚴格 body schema 與 Content-Type；圖片串流不得放寬全域 16 KiB JSON 限制。

- [x] `AP-API-013` **`PostPersonalPhoto_Success_ReturnsDocumentedResponse`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 POST /api/v1/me/photos`（AP-AC）
  - **前置／動作／預期**：使用本人有效 Web Cookie／native Bearer 呼叫 POST /api/v1/me/photos；斷言 201 與 camelCase JSON／對應串流、no-store、預期的完整 DTO。獨立串流、8 MiB、200000bytes、無 Trigger 的單條件 INSERT。

- [x] `AP-API-014` **`PostPersonalPhoto_InvalidOrUnauthorized_ReturnsProblemDetails`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 POST /api/v1/me/photos`（AP-AC）
  - **前置／動作／預期**：以不合法輸入／撤銷 Session／跨 owner 對 POST /api/v1/me/photos 送出請求；驗 413 IMAGE_TOO_LARGE／409 PHOTO_LIMIT_REACHED／400 INVALID_IMAGE 對應 ProblemDetails；不得成功寫入或洩漏私人欄位。

- [x] `AP-API-015` **`PostPersonalPhoto_WebNativeBoundary_EnforcesTransport`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 POST /api/v1/me/photos`（AP-AC）
  - **前置／動作／預期**：以 Web Origin／clientPlatform 與原生 Bearer 分別呼叫 POST /api/v1/me/photos；驗既有同意的 CSRF／Session family 規則、嚴格 body schema 與 Content-Type；圖片串流不得放寬全域 16 KiB JSON 限制。

- [x] `AP-API-016` **`GetPersonalPhotos_Success_ReturnsDocumentedResponse`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/me/photos`（AP-AC）
  - **前置／動作／預期**：使用本人有效 Web Cookie／native Bearer 呼叫 GET /api/v1/me/photos；斷言 200 與 camelCase JSON／對應串流、no-store、預期的完整 DTO。只本人照片與排序，跨 owner 不洩漏。

- [x] `AP-API-017` **`GetPersonalPhotos_InvalidOrUnauthorized_ReturnsProblemDetails`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/me/photos`（AP-AC）
  - **前置／動作／預期**：以不合法輸入／撤銷 Session／跨 owner 對 GET /api/v1/me/photos 送出請求；驗 401 SESSION_REVOKED 對應 ProblemDetails；不得成功寫入或洩漏私人欄位。

- [x] `AP-API-018` **`GetPersonalPhotos_WebNativeBoundary_EnforcesTransport`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/me/photos`（AP-AC）
  - **前置／動作／預期**：以 Web Origin／clientPlatform 與原生 Bearer 分別呼叫 GET /api/v1/me/photos；驗既有同意的 CSRF／Session family 規則、嚴格 body schema 與 Content-Type；圖片串流不得放寬全域 16 KiB JSON 限制。

- [x] `AP-API-019` **`PutPhotoOrder_Success_ReturnsDocumentedResponse`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 PUT /api/v1/me/photos/order`（AP-AC）
  - **前置／動作／預期**：使用本人有效 Web Cookie／native Bearer 呼叫 PUT /api/v1/me/photos/order；斷言 200 與 camelCase JSON／對應串流、no-store、預期的完整 DTO。完整有效 ID 集合和 revision；同 D1 batch。

- [x] `AP-API-020` **`PutPhotoOrder_InvalidOrUnauthorized_ReturnsProblemDetails`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 PUT /api/v1/me/photos/order`（AP-AC）
  - **前置／動作／預期**：以不合法輸入／撤銷 Session／跨 owner 對 PUT /api/v1/me/photos/order 送出請求；驗 400 INVALID_PROFILE／409 PROFILE_VERSION_CONFLICT 對應 ProblemDetails；不得成功寫入或洩漏私人欄位。

- [x] `AP-API-021` **`PutPhotoOrder_WebNativeBoundary_EnforcesTransport`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 PUT /api/v1/me/photos/order`（AP-AC）
  - **前置／動作／預期**：以 Web Origin／clientPlatform 與原生 Bearer 分別呼叫 PUT /api/v1/me/photos/order；驗既有同意的 CSRF／Session family 規則、嚴格 body schema 與 Content-Type；圖片串流不得放寬全域 16 KiB JSON 限制。

- [x] `AP-API-022` **`DeletePersonalPhoto_Success_ReturnsDocumentedResponse`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 DELETE /api/v1/me/photos/{assetId}`（AP-AC）
  - **前置／動作／預期**：使用本人有效 Web Cookie／native Bearer 呼叫 DELETE /api/v1/me/photos/{assetId}；斷言 204 與 camelCase JSON／對應串流、no-store、預期的完整 DTO。只本人且狀態條件刪除；已刪對方不可新讀。

- [x] `AP-API-023` **`DeletePersonalPhoto_InvalidOrUnauthorized_ReturnsProblemDetails`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 DELETE /api/v1/me/photos/{assetId}`（AP-AC）
  - **前置／動作／預期**：以不合法輸入／撤銷 Session／跨 owner 對 DELETE /api/v1/me/photos/{assetId} 送出請求；驗 404 PHOTO_NOT_FOUND 對應 ProblemDetails；不得成功寫入或洩漏私人欄位。

- [x] `AP-API-024` **`DeletePersonalPhoto_WebNativeBoundary_EnforcesTransport`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 DELETE /api/v1/me/photos/{assetId}`（AP-AC）
  - **前置／動作／預期**：以 Web Origin／clientPlatform 與原生 Bearer 分別呼叫 DELETE /api/v1/me/photos/{assetId}；驗既有同意的 CSRF／Session family 規則、嚴格 body schema 與 Content-Type；圖片串流不得放寬全域 16 KiB JSON 限制。

- [x] `AP-API-025` **`GetPrivateMedia_Success_ReturnsDocumentedResponse`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/me/media/{assetId}`（AP-AC）
  - **前置／動作／預期**：使用本人有效 Web Cookie／native Bearer 呼叫 GET /api/v1/me/media/{assetId}；斷言 200 與 camelCase JSON／對應串流、no-store、預期的完整 DTO。只本人可讀、no-store/nosniff、不回 objectKey。

- [x] `AP-API-026` **`GetPrivateMedia_InvalidOrUnauthorized_ReturnsProblemDetails`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/me/media/{assetId}`（AP-AC）
  - **前置／動作／預期**：以不合法輸入／撤銷 Session／跨 owner 對 GET /api/v1/me/media/{assetId} 送出請求；驗 404 PHOTO_NOT_FOUND／401 SESSION_REVOKED 對應 ProblemDetails；不得成功寫入或洩漏私人欄位。

- [x] `AP-API-027` **`GetPrivateMedia_WebNativeBoundary_EnforcesTransport`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/me/media/{assetId}`（AP-AC）
  - **前置／動作／預期**：以 Web Origin／clientPlatform 與原生 Bearer 分別呼叫 GET /api/v1/me/media/{assetId}；驗既有同意的 CSRF／Session family 規則、嚴格 body schema 與 Content-Type；圖片串流不得放寬全域 16 KiB JSON 限制。

- [x] `AP-API-028` **`PostAvatarGeneration_Success_ReturnsDocumentedResponse`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 POST /api/v1/me/avatar/generations`（AP-AC）
  - **前置／動作／預期**：使用本人有效 Web Cookie／native Bearer 呼叫 POST /api/v1/me/avatar/generations；斷言 200 與 camelCase JSON／對應串流、no-store、預期的完整 DTO。兩至五張已保存照片、每次只真產1張、回傳attemptId/index/producedCount/expiresAt、同輪上限4且不建Job、不建立 job。

- [x] `AP-API-029` **`PostAvatarGeneration_InvalidOrUnauthorized_ReturnsProblemDetails`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 POST /api/v1/me/avatar/generations`（AP-AC）
  - **前置／動作／預期**：以不合法輸入／撤銷 Session／跨 owner 對 POST /api/v1/me/avatar/generations 送出請求；驗 503 IMAGE_PROVIDER_UNAVAILABLE／429 RATE_LIMITED 對應 ProblemDetails；不得成功寫入或洩漏私人欄位。

- [x] `AP-API-030` **`PostAvatarGeneration_WebNativeBoundary_EnforcesTransport`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 POST /api/v1/me/avatar/generations`（AP-AC）
  - **前置／動作／預期**：以 Web Origin／clientPlatform 與原生 Bearer 分別呼叫 POST /api/v1/me/avatar/generations；驗既有同意的 CSRF／Session family 規則、嚴格 body schema 與 Content-Type；圖片串流不得放寬全域 16 KiB JSON 限制。

- [x] `AP-API-031` **`GetAvatarCandidate_Success_ReturnsDocumentedResponse`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/me/avatar/candidates/{attemptId}/{index}`（AP-AC）
  - **前置／動作／預期**：使用本人有效 Web Cookie／native Bearer 呼叫 GET /api/v1/me/avatar/candidates/{attemptId}/{index}；斷言 200 與 camelCase JSON／對應串流、no-store、預期的完整 DTO。R2短效與 owner/key 推導，索引1至4。

- [x] `AP-API-032` **`GetAvatarCandidate_InvalidOrUnauthorized_ReturnsProblemDetails`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/me/avatar/candidates/{attemptId}/{index}`（AP-AC）
  - **前置／動作／預期**：以不合法輸入／撤銷 Session／跨 owner 對 GET /api/v1/me/avatar/candidates/{attemptId}/{index} 送出請求；驗 410 AVATAR_CANDIDATE_EXPIRED／404 AVATAR_CANDIDATE_NOT_FOUND 對應 ProblemDetails；不得成功寫入或洩漏私人欄位。

- [x] `AP-API-033` **`GetAvatarCandidate_WebNativeBoundary_EnforcesTransport`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/me/avatar/candidates/{attemptId}/{index}`（AP-AC）
  - **前置／動作／預期**：以 Web Origin／clientPlatform 與原生 Bearer 分別呼叫 GET /api/v1/me/avatar/candidates/{attemptId}/{index}；驗既有同意的 CSRF／Session family 規則、嚴格 body schema 與 Content-Type；圖片串流不得放寬全域 16 KiB JSON 限制。

- [x] `AP-API-034` **`PutAvatarSelection_Success_ReturnsDocumentedResponse`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 PUT /api/v1/me/avatar/selection`（AP-AC）
  - **前置／動作／預期**：使用本人有效 Web Cookie／native Bearer 呼叫 PUT /api/v1/me/avatar/selection；斷言 200 與 camelCase JSON／對應串流、no-store、預期的完整 DTO。免費與 generated 擇一、舊化身不被不完整請求覆寫。

- [x] `AP-API-035` **`PutAvatarSelection_InvalidOrUnauthorized_ReturnsProblemDetails`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 PUT /api/v1/me/avatar/selection`（AP-AC）
  - **前置／動作／預期**：以不合法輸入／撤銷 Session／跨 owner 對 PUT /api/v1/me/avatar/selection 送出請求；驗 400 INVALID_AVATAR_SELECTION／409 PROFILE_VERSION_CONFLICT 對應 ProblemDetails；不得成功寫入或洩漏私人欄位。

- [x] `AP-API-036` **`PutAvatarSelection_WebNativeBoundary_EnforcesTransport`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 PUT /api/v1/me/avatar/selection`（AP-AC）
  - **前置／動作／預期**：以 Web Origin／clientPlatform 與原生 Bearer 分別呼叫 PUT /api/v1/me/avatar/selection；驗既有同意的 CSRF／Session family 規則、嚴格 body schema 與 Content-Type；圖片串流不得放寬全域 16 KiB JSON 限制。

- [x] `AP-API-037` **`GetCardPreview_Success_ReturnsDocumentedResponse`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/me/card-preview`（AP-AC）
  - **前置／動作／預期**：使用本人有效 Web Cookie／native Bearer 呼叫 GET /api/v1/me/card-preview；斷言 200 與 camelCase JSON／對應串流、no-store、預期的完整 DTO。本人當前名片投影；不表示同意對方讀。

- [x] `AP-API-038` **`GetCardPreview_InvalidOrUnauthorized_ReturnsProblemDetails`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/me/card-preview`（AP-AC）
  - **前置／動作／預期**：以不合法輸入／撤銷 Session／跨 owner 對 GET /api/v1/me/card-preview 送出請求；驗 401 SESSION_REVOKED 對應 ProblemDetails；不得成功寫入或洩漏私人欄位。

- [x] `AP-API-039` **`GetCardPreview_WebNativeBoundary_EnforcesTransport`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/me/card-preview`（AP-AC）
  - **前置／動作／預期**：以 Web Origin／clientPlatform 與原生 Bearer 分別呼叫 GET /api/v1/me/card-preview；驗既有同意的 CSRF／Session family 規則、嚴格 body schema 與 Content-Type；圖片串流不得放寬全域 16 KiB JSON 限制。

### [補強] 2026-11-01 實作前稽核追加 API 測試（2項）

**來源**：[RiskAudit](../specs/SPEC-001-AvatarAndPreferences-RiskAudit.md) 的 `RG-01`～`RG-14`；使用者已確認 RQ-01=A／RQ-02=A。測試尚未執行。

- [x] `AP-API-040` **`UploadMediaStream_WebNativeMultipartAndBinary_EnforcesOriginAnd8MiBLimits`**
  - **稽核缺漏**：`RG-01`；**優先級**：高；**BDD**：`AP-BDD-002`；**來源**：RA-02、§7 POST /me/photos
  - **測試位置**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **前置／操作**：Web Cookie+Origin／Android或iOS Bearer，真二進位圖片串流、>8MiB與偽造Origin的受控上傳
  - **預期斷言**：Web原 Cookie + Origin 必經正確 CSRF；native Bearer；8192原測試儲存路徑不能當生產照片路徑。不得以 Mock、Fixture 或單一平台成功冒充要求的真整合與跨平台結果。

- [x] `AP-API-041` **`PutDatingProfile_TopicTagIdsAndLegacyCodes_RoundTripsExactSchema`**
  - **稽核缺漏**：`RG-09`；**優先級**：中；**BDD**：`AP-BDD-007`；**來源**：RA-08、AP-BDD-007/041/051
  - **測試位置**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **前置／操作**：PUT再GET含interestTagIds/topicTagIds/valueTagIds與preferences九鍵，並輸入未知/重複鍵、停用歷史代碼
  - **預期斷言**：九鍵偏好 JSON、三欄 interests JSON、topicTagIds、未知鍵拒絕、舊目錄代碼可回讀。不得以 Mock、Fixture 或單一平台成功冒充要求的真整合與跨平台結果。

### 2026-11-02 D-050 逐張生成新增 API 測試（3項）

以下測試源自已確認 D-050，尚未實作或執行；保留原本測試ID，新增本輪唯一測試ID。

- [x] `AP-API-042` **`PostAvatarGeneration_FirstCall_ReturnsSingleCandidateEnvelope`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-069`（AP-AC-003、AP-AC-018／024；D-050）
  - **前置／動作／預期**：POST /api/v1/me/avatar/generations帶styleId與clientRequestId，首次無 attemptId；預期 200只包含 index=1、producedCount=1、maxCandidates=4、expiresAt與attemptId，不含其他三張、raw source 或R2 key。

- [x] `AP-API-043` **`PostAvatarGeneration_NextCall_RequiresAttemptAndExpectedCount`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-070`（AP-AC-003、AP-AC-018／024；D-050）
  - **前置／動作／預期**：POST同一路由續帶attemptId、expectedProducedCount與新clientRequestId；預期 每次只增加一張、正確回 index=2；偽造attemptId、style變更或不連續count回400／409。

- [x] `AP-API-044` **`PostAvatarGeneration_ParallelOrDuplicate_ReturnsIdempotentOrConflict`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-071`（AP-AC-003、AP-AC-018／024；D-050）
  - **前置／動作／預期**：兩個分頁同時送不同requestId及相同requestId重送，並測producedCount=4或closed；預期 相同requestId重放回既有結果／受控in-progress；不同競爭409，滿額或closed拒絕，沒有額外Gemini呼叫。

## 4️⃣ E2E／UX 測試（Web、Android、iOS）

每個 @frontend 場景分別在 Web、Android、iOS 保留獨立驗收；iOS 未執行不得由 Web／Android 冒充。

- [x] `AP-E2E-001` **`PhotoScreenEmptyState_Web_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-057`（AP-AC-001、AP-AC-020）
  - **前置／動作／預期**：瀏覽器與鍵盤操作：前置 本人進入沒有任何照片的個人資料頁；操作 畫面完成載入並按新增照片；應驗證 呈現空狀態與完整用途提醒文案，且 圖片選擇取消後不呼叫上傳 API 且不報成功。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [x] `AP-E2E-002` **`PhotoScreenEmptyState_Android_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-057`（AP-AC-001、AP-AC-020）
  - **前置／動作／預期**：原生圖片選取／返回：前置 本人進入沒有任何照片的個人資料頁；操作 畫面完成載入並按新增照片；應驗證 呈現空狀態與完整用途提醒文案，且 圖片選擇取消後不呼叫上傳 API 且不報成功。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [ ] `AP-E2E-003` **`PhotoScreenEmptyState_Ios_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-057`（AP-AC-001、AP-AC-020）
  - **前置／動作／預期**：iOS 圖片權限（D-052暫緩）：前置 本人進入沒有任何照片的個人資料頁；操作 畫面完成載入並按新增照片；應驗證 呈現空狀態與完整用途提醒文案，且 圖片選擇取消後不呼叫上傳 API 且不報成功。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [x] `AP-E2E-004` **`FreeAvatarPickerUi_Web_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-058`（AP-AC-004、AP-AC-017）
  - **前置／動作／預期**：瀏覽器與鍵盤操作：前置 本人進入免費角色清單；操作 瀏覽兩組各八種插畫並選一種；應驗證 可辨識的16張資產完整顯示，且 選中的角色與目前選用狀態正確顯示。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [x] `AP-E2E-005` **`FreeAvatarPickerUi_Android_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-058`（AP-AC-004、AP-AC-017）
  - **前置／動作／預期**：原生圖片選取／返回：前置 本人進入免費角色清單；操作 瀏覽兩組各八種插畫並選一種；應驗證 可辨識的16張資產完整顯示，且 選中的角色與目前選用狀態正確顯示。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [ ] `AP-E2E-006` **`FreeAvatarPickerUi_Ios_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-058`（AP-AC-004、AP-AC-017）
  - **前置／動作／預期**：iOS 圖片權限（D-052暫緩）：前置 本人進入免費角色清單；操作 瀏覽兩組各八種插畫並選一種；應驗證 可辨識的16張資產完整顯示，且 選中的角色與目前選用狀態正確顯示。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [x] `AP-E2E-007` **`PersonalPhotoUploadUi_Web_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-059`（AP-AC-001、AP-AC-009）
  - **前置／動作／預期**：瀏覽器與鍵盤操作：前置 本人在手機或 Web 選擇一張照片；操作 送出有效上傳或使用超額圖片；應驗證 呈現上傳處理狀態與明確成功／失敗回饋，且 失敗不假顯示已成功且可重新選圖。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [x] `AP-E2E-008` **`PersonalPhotoUploadUi_Android_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-059`（AP-AC-001、AP-AC-009）
  - **前置／動作／預期**：原生圖片選取／返回：前置 本人在手機或 Web 選擇一張照片；操作 送出有效上傳或使用超額圖片；應驗證 呈現上傳處理狀態與明確成功／失敗回饋，且 失敗不假顯示已成功且可重新選圖。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [ ] `AP-E2E-009` **`PersonalPhotoUploadUi_Ios_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-059`（AP-AC-001、AP-AC-009）
  - **前置／動作／預期**：iOS 圖片權限（D-052暫緩）：前置 本人在手機或 Web 選擇一張照片；操作 送出有效上傳或使用超額圖片；應驗證 呈現上傳處理狀態與明確成功／失敗回饋，且 失敗不假顯示已成功且可重新選圖。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [x] `AP-E2E-010` **`PhotoOrderDeleteUi_Web_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-060`（AP-AC-001）
  - **前置／動作／預期**：瀏覽器與鍵盤操作：前置 本人已有三張可見照片；操作 拖曳重排或選擇刪除；應驗證 顯示新順序或明確刪除確認結果，且 版本衝突需提示重新整理而非覆蓋新資料。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [x] `AP-E2E-011` **`PhotoOrderDeleteUi_Android_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-060`（AP-AC-001）
  - **前置／動作／預期**：原生圖片選取／返回：前置 本人已有三張可見照片；操作 拖曳重排或選擇刪除；應驗證 顯示新順序或明確刪除確認結果，且 版本衝突需提示重新整理而非覆蓋新資料。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [ ] `AP-E2E-012` **`PhotoOrderDeleteUi_Ios_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-060`（AP-AC-001）
  - **前置／動作／預期**：iOS 圖片權限（D-052暫緩）：前置 本人已有三張可見照片；操作 拖曳重排或選擇刪除；應驗證 顯示新順序或明確刪除確認結果，且 版本衝突需提示重新整理而非覆蓋新資料。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [x] `AP-E2E-013` **`AiLockEntryUi_Web_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-061`（AP-AC-018）
  - **前置／動作／預期**：Web 專屬使用者驗收：Given 本人已存兩張以上 ready 真人照；When 點擊帶鎖頭的 AI 按鈕進入產圖頁；Then 顯示風格選擇及醒目的第三方 Gemini 照片使用提醒，按「開始產生第1張」後才送出一張請求；And 僅開頁不得呼叫 Gemini、無第二個送照同意跳窗、無付款／扣點；每張完成可採用或繼續。本平台未實跑不得以別的平台替代或標已通過。

- [x] `AP-E2E-014` **`AiLockEntryUi_Android_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-061`（AP-AC-018）
  - **前置／動作／預期**：Android 專屬使用者驗收：Given 本人已存兩張以上 ready 真人照；When 點擊帶鎖頭的 AI 按鈕進入產圖頁；Then 顯示風格選擇及醒目的第三方 Gemini 照片使用提醒，按「開始產生第1張」後才送出一張請求；And 僅開頁不得呼叫 Gemini、無第二個送照同意跳窗、無付款／扣點；每張完成可採用或繼續。本平台未實跑不得以別的平台替代或標已通過。

- [ ] `AP-E2E-015` **`AiLockEntryUi_Ios_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-061`（AP-AC-018）
  - **前置／動作／預期**：iOS 專屬使用者驗收：Given 本人已存兩張以上 ready 真人照；When 點擊帶鎖頭的 AI 按鈕進入產圖頁；Then 顯示風格選擇及醒目的第三方 Gemini 照片使用提醒，按「開始產生第1張」後才送出一張請求；And 僅開頁不得呼叫 Gemini、無第二個送照同意跳窗、無付款／扣點；每張完成可採用或繼續。本平台未實跑不得以別的平台替代或標已通過。

- [x] `AP-E2E-016` **`AiGenerateLoadingUi_Web_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-062`（AP-AC-003、AP-AC-018）
  - **前置／動作／預期**：Web 專屬使用者驗收：Given 本人正產生本輪第2張且第1張已成功；When 本人在兩個分頁快速重送同一 clientRequestId 或連點「產生下一張」；Then 介面只顯示一個進行中請求，server 使用短效排他與冪等拒絕額外 Gemini 呼叫；And 產生第二張成功才占下一個 index，出錯保留第1張且不自動重試。本平台未實跑不得以別的平台替代或標已通過。

- [x] `AP-E2E-017` **`AiGenerateLoadingUi_Android_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-062`（AP-AC-003、AP-AC-018）
  - **前置／動作／預期**：Android 專屬使用者驗收：Given 本人正產生本輪第2張且第1張已成功；When 本人在兩個分頁快速重送同一 clientRequestId 或連點「產生下一張」；Then 介面只顯示一個進行中請求，server 使用短效排他與冪等拒絕額外 Gemini 呼叫；And 產生第二張成功才占下一個 index，出錯保留第1張且不自動重試。本平台未實跑不得以別的平台替代或標已通過。

- [ ] `AP-E2E-018` **`AiGenerateLoadingUi_Ios_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-062`（AP-AC-003、AP-AC-018）
  - **前置／動作／預期**：iOS 專屬使用者驗收：Given 本人正產生本輪第2張且第1張已成功；When 本人在兩個分頁快速重送同一 clientRequestId 或連點「產生下一張」；Then 介面只顯示一個進行中請求，server 使用短效排他與冪等拒絕額外 Gemini 呼叫；And 產生第二張成功才占下一個 index，出錯保留第1張且不自動重試。本平台未實跑不得以別的平台替代或標已通過。

- [x] `AP-E2E-019` **`AiFourChoicesUi_Web_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-063`（AP-AC-003、AP-AC-022）
  - **前置／動作／預期**：Web 專屬使用者驗收：Given 本人本輪依序成功取得四張3:4半身至腰部互異插畫候選；When 本人回選第2張、看完採用確認並確定選用；Then 清楚標示候選2並只將此張設為遊戲化身，四張畫框不裁切五官；And 其餘三張不留永久資產，第四張後無法再要求第5張。本平台未實跑不得以別的平台替代或標已通過。

- [x] `AP-E2E-020` **`AiFourChoicesUi_Android_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-063`（AP-AC-003、AP-AC-022）
  - **前置／動作／預期**：Android 專屬使用者驗收：Given 本人本輪依序成功取得四張3:4半身至腰部互異插畫候選；When 本人回選第2張、看完採用確認並確定選用；Then 清楚標示候選2並只將此張設為遊戲化身，四張畫框不裁切五官；And 其餘三張不留永久資產，第四張後無法再要求第5張。本平台未實跑不得以別的平台替代或標已通過。

- [ ] `AP-E2E-021` **`AiFourChoicesUi_Ios_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-063`（AP-AC-003、AP-AC-022）
  - **前置／動作／預期**：iOS 專屬使用者驗收：Given 本人本輪依序成功取得四張3:4半身至腰部互異插畫候選；When 本人回選第2張、看完採用確認並確定選用；Then 清楚標示候選2並只將此張設為遊戲化身，四張畫框不裁切五官；And 其餘三張不留永久資產，第四張後無法再要求第5張。本平台未實跑不得以別的平台替代或標已通過。

- [x] `AP-E2E-022` **`AiFailureRecoveryUi_Web_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-064`（AP-AC-003、AP-AC-024）
  - **前置／動作／預期**：Web 專屬使用者驗收：Given 當次 provider 逾時、回傳錯誤或本輪到期；When 畫面收到503、429、409或410回應；Then 提供可理解的錯誤、保留既有有效候選；不確定供應商成本的逾時不得自動重送；And 不顯示假成功、舊化身不變，已到期候選不得再採用。本平台未實跑不得以別的平台替代或標已通過。

- [x] `AP-E2E-023` **`AiFailureRecoveryUi_Android_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-064`（AP-AC-003、AP-AC-024）
  - **前置／動作／預期**：Android 專屬使用者驗收：Given 當次 provider 逾時、回傳錯誤或本輪到期；When 畫面收到503、429、409或410回應；Then 提供可理解的錯誤、保留既有有效候選；不確定供應商成本的逾時不得自動重送；And 不顯示假成功、舊化身不變，已到期候選不得再採用。本平台未實跑不得以別的平台替代或標已通過。

- [ ] `AP-E2E-024` **`AiFailureRecoveryUi_Ios_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-064`（AP-AC-003、AP-AC-024）
  - **前置／動作／預期**：iOS 專屬使用者驗收：Given 當次 provider 逾時、回傳錯誤或本輪到期；When 畫面收到503、429、409或410回應；Then 提供可理解的錯誤、保留既有有效候選；不確定供應商成本的逾時不得自動重送；And 不顯示假成功、舊化身不變，已到期候選不得再採用。本平台未實跑不得以別的平台替代或標已通過。

- [x] `AP-E2E-025` **`DatingProfileFormUi_Web_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-065`（AP-AC-005、AP-AC-012、AP-AC-013、AP-AC-021）
  - **前置／動作／預期**：瀏覽器與鍵盤操作：前置 本人打開工作與偏好表單；操作 輸入合法工作或空白工作並儲存；應驗證 前端顯示與後端一致的驗證結果和最新 revision，且 未成年、非法年齡偏好和非法標籤具體提示。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [x] `AP-E2E-026` **`DatingProfileFormUi_Android_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-065`（AP-AC-005、AP-AC-012、AP-AC-013、AP-AC-021）
  - **前置／動作／預期**：原生圖片選取／返回：前置 本人打開工作與偏好表單；操作 輸入合法工作或空白工作並儲存；應驗證 前端顯示與後端一致的驗證結果和最新 revision，且 未成年、非法年齡偏好和非法標籤具體提示。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [ ] `AP-E2E-027` **`DatingProfileFormUi_Ios_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-065`（AP-AC-005、AP-AC-012、AP-AC-013、AP-AC-021）
  - **前置／動作／預期**：iOS 圖片權限（D-052暫緩）：前置 本人打開工作與偏好表單；操作 輸入合法工作或空白工作並儲存；應驗證 前端顯示與後端一致的驗證結果和最新 revision，且 未成年、非法年齡偏好和非法標籤具體提示。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [x] `AP-E2E-028` **`MyCardPreviewUi_Web_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-066`（AP-AC-020、AP-AC-015）
  - **前置／動作／預期**：瀏覽器與鍵盤操作：前置 本人有工作與私人照片；操作 點開自己的名片預覽；應驗證 明確列出被同意後可分享的欄位及壓縮版照片，且 不把本人預覽誤認為已授權對方查看。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [x] `AP-E2E-029` **`MyCardPreviewUi_Android_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-066`（AP-AC-020、AP-AC-015）
  - **前置／動作／預期**：原生圖片選取／返回：前置 本人有工作與私人照片；操作 點開自己的名片預覽；應驗證 明確列出被同意後可分享的欄位及壓縮版照片，且 不把本人預覽誤認為已授權對方查看。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [ ] `AP-E2E-030` **`MyCardPreviewUi_Ios_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-066`（AP-AC-020、AP-AC-015）
  - **前置／動作／預期**：iOS 圖片權限（D-052暫緩）：前置 本人有工作與私人照片；操作 點開自己的名片預覽；應驗證 明確列出被同意後可分享的欄位及壓縮版照片，且 不把本人預覽誤認為已授權對方查看。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [x] `AP-E2E-031` **`ConsentGateUi_Web_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-067`（AP-AC-016、AP-AC-023）
  - **前置／動作／預期**：瀏覽器與鍵盤操作：前置 候選配對尚未取得同輪有效雙方同意；操作 使用者嘗試從 UI 或猜 URL 查看對方真人照；應驗證 UI 不提供有效入口且後端回拒絕，且 對方照片不得以公開 R2 圖址洩漏。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [x] `AP-E2E-032` **`ConsentGateUi_Android_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-067`（AP-AC-016、AP-AC-023）
  - **前置／動作／預期**：原生圖片選取／返回：前置 候選配對尚未取得同輪有效雙方同意；操作 使用者嘗試從 UI 或猜 URL 查看對方真人照；應驗證 UI 不提供有效入口且後端回拒絕，且 對方照片不得以公開 R2 圖址洩漏。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [ ] `AP-E2E-033` **`ConsentGateUi_Ios_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-067`（AP-AC-016、AP-AC-023）
  - **前置／動作／預期**：iOS 圖片權限（D-052暫緩）：前置 候選配對尚未取得同輪有效雙方同意；操作 使用者嘗試從 UI 或猜 URL 查看對方真人照；應驗證 UI 不提供有效入口且後端回拒絕，且 對方照片不得以公開 R2 圖址洩漏。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [x] `AP-E2E-034` **`ProfileReloginConsistencyUi_Web_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-068`（AP-AC-001、AP-AC-003、AP-AC-012）
  - **前置／動作／預期**：瀏覽器與鍵盤操作：前置 本人於 iOS、Android 或 Web 使用個人資料與選角；操作 完成表單與選角操作並重新登入；應驗證 表單與照片及化身選擇可操作且資料重讀一致，且 不以原型 Fixture／舊照片快取遮蔽目前值。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [x] `AP-E2E-035` **`ProfileReloginConsistencyUi_Android_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-068`（AP-AC-001、AP-AC-003、AP-AC-012）
  - **前置／動作／預期**：原生圖片選取／返回：前置 本人於 iOS、Android 或 Web 使用個人資料與選角；操作 完成表單與選角操作並重新登入；應驗證 表單與照片及化身選擇可操作且資料重讀一致，且 不以原型 Fixture／舊照片快取遮蔽目前值。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [ ] `AP-E2E-036` **`ProfileReloginConsistencyUi_Ios_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-068`（AP-AC-001、AP-AC-003、AP-AC-012）
  - **前置／動作／預期**：iOS 圖片權限（D-052暫緩）：前置 本人於 iOS、Android 或 Web 使用個人資料與選角；操作 完成表單與選角操作並重新登入；應驗證 表單與照片及化身選擇可操作且資料重讀一致，且 不以原型 Fixture／舊照片快取遮蔽目前值。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

---

### [補強] 2026-11-01 實作前稽核追加 E2E 測試（2項）

**來源**：[RiskAudit](../specs/SPEC-001-AvatarAndPreferences-RiskAudit.md) 的 `RG-01`～`RG-14`；使用者已確認 RQ-01=A／RQ-02=A。測試尚未執行。

- [x] `AP-E2E-037` **`GenerateAvatar_BeforeThirdPartyDisclosure_DoesNotTransmitSourcePhoto`**
  - **稽核缺漏**：`RG-06`；**優先級**：高；**BDD**：`AP-BDD-061`；**來源**：RA-05、BDD-001/061
  - **測試位置**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **前置／操作**：Web／Android／iOS進入鎖頭頁但未按開始就離開、照片不足，及明確按「開始產生第1張」
  - **預期斷言**：使用者未主動觸發 AI 時，Gemini 無外送請求；UI 顯示傳送用途及明確操作。不得以 Mock、Fixture 或單一平台成功冒充要求的真整合與跨平台結果。

- [x] `AP-E2E-038` **`BuiltinAvatarCatalog_SixteenDistinctLicensedImages_ValidatesActualAssets`**
  - **稽核缺漏**：`RG-12`；**優先級**：中；**BDD**：`AP-BDD-005`；**來源**：RA-10、BDD-005/058
  - **測試位置**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **前置／操作**：逐一驗16張獨立正式角色素材授權與視覺差異，於Web/Android/iOS測3:4容器
  - **預期斷言**：逐16個ID辨識、來源授權、實際資產不同，三平台載入與容器裁切。不得以 Mock、Fixture 或單一平台成功冒充要求的真整合與跨平台結果。

### 2026-11-02 D-050 逐張生成新增 E2E 測試（3項）

以下測試源自已確認 D-050，尚未實作或執行；保留原本測試ID，新增本輪唯一測試ID。

- [x] `AP-E2E-039` **`AdoptConfirmation_Web_ShowsFutureChargeNoticeAndCancelPreservesSession`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-073`（AP-AC-003、AP-AC-018／024；D-050）
  - **前置／動作／預期**：Web產圖成功1～4張後按採用，先取消再確認；預期 顯示採用結束本輪／未來正式付費重生依方案收費、目前免費；取消保留本輪，確認才正式採用，不扣款。

- [x] `AP-E2E-040` **`AdoptConfirmation_Android_ShowsFutureChargeNoticeAndCancelPreservesSession`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-073`（AP-AC-003、AP-AC-018／024；D-050）
  - **前置／動作／預期**：Android產圖成功1～4張後按採用，先取消再確認；預期 顯示採用結束本輪／未來正式付費重生依方案收費、目前免費；取消保留本輪，確認才正式採用，不扣款。

- [ ] `AP-E2E-041` **`AdoptConfirmation_Ios_ShowsFutureChargeNoticeAndCancelPreservesSession`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-073`（AP-AC-003、AP-AC-018／024；D-050）
  - **前置／動作／預期**：iOS產圖成功1～4張後按採用，先取消再確認；預期 顯示採用結束本輪／未來正式付費重生依方案收費、目前免費；取消保留本輪，確認才正式採用，不扣款；未實測不得借用他平台證據。

## 🧪 關鍵測試資料與交付限制

| 類別 | 必須提供的真實驗證 |
|---|---|
| D1 原子並發 | 同帳號4張 ready、兩個第5／第6張並發、4 ready+1 pending 並發、單語句回傳0列、owner 不可改、deleted 不可復活、無 CREATE TRIGGER，且查最終有效資產恰5 |
| D1 與 JSON | 兩張表首欄 UUIDv7、外鍵／CHECK／UNIQUE、15＋9欄、固定 JSON 深度與白名單、CAS stale、照片排序完整集合、真 D1 batch 衝突與 rollback |
| 私人圖片 | 8MiB 上傳、≤200000 bytes、錯誤 MIME／惡意解碼／EXIF GPS、分段 stream、R2 pending/ready/deleted、GC、跨帳號拒絕與 response nosniff/no-store |
| 生成及選用 | 2～5張已存來源、首次與後續逐張真正產出1張、本輪成功候選最多4張、前端可回選、60分鐘R2 manifest/CAS/同帳號排他與冪等、採用需確認未來重生費用（目前免費）、僅選中1張永久化、失敗不抹除舊候選／角色 |
| 真人品質 | 需使用者授權提供的照片與 Gemini 真 API，人工逐張比較五官、臉型及髮型；記錄模型／結果數／時間與匿名品質評語，不留原始影像或明碼 secret |
| 名片跨 SPEC | 本份只測讀取投影及拒絕授權的隔離契約；實際25分、邀請、雙方同意、終止狀態的完整 E2E 留待 AffectionAndFeedback／StoryDialogueAndExit 完成才驗 |
| 前端 | 16款真不同插畫、照片用途提示完整文字、AI 鎖頭即用不扣款、圖片四選一、錯誤提示、Loading、Web／Android分平台；iOS暫緩、無障礙不在範圍 |

## 📝 測試清單使用說明

1. 先 Red：寫出符合每一個 TDD ID 的失敗測試，保留有效失敗證據；以 Domain／Application → D1／R2 → HTTP → 前端順序 Green，再重構及回歸。
2. 完整功能結果才可勾選 BDD 對應場景；有單一單元測試通過不等於 UX／平台驗收通過。
3. `API` 列表的每一項成功／拒絕／平台傳輸測試均須與對應 `AP-AC`、`AP-BDD` 回鏈；API 對應以 SPEC §7 明列路由為準，不憑空實作跨使用者名片端點。
4. 使用者已於2026-11-01確認 RQ-01=A、RQ-02=A，14項風險均有處理決議、原14項稽核缺漏並新增18項D-050測試已補回。**Ready for well-done 只代表規劃交接，0/275項測試已通過；不能跳過真D1、真Gemini、素材與分平台驗收。**

## 🔗 相關文件

- [MVP](../requirements/MVP-001-LoveGameDatingApp.md)
- [SPEC](../specs/SPEC-001-AvatarAndPreferences.md)
- [BDD](../bdd/SPEC-001-AvatarAndPreferences-BDD.md)
- [RiskAudit](../specs/SPEC-001-AvatarAndPreferences-RiskAudit.md)

**文件狀態**：RiskAudit已確認、原14項稽核測試＋D-050新增18項皆已補回；**Ready for well-done**，0/275測試通過。

---

## 📝 2026-11-01 實作前風險與缺漏稽核紀錄

**結論**：2026-11-02 D-050 已使風險盤點更新為6高／7中／1低共14項；RQ-01=A、RQ-02=A與逐張上限4／可回選／確認採用皆由使用者同意並回寫。原243項TDD＋14項先前稽核補強＋D-050新增18項＝**275項，0已實測**；73個BDD Scenario、13個@frontend與24條AP-AC追溯完整，原有ID均保留。

## 規劃交接紀錄

**交接狀態**: **Ready for well-done**

**最後確認日期**: 2026-11-02（D-050逐張生成方案經使用者同意，重新完成追溯與交接）
**範圍及順序**: 僅 `SPEC-001-AvatarAndPreferences`（MVP-001第2順位）；既有 `SPEC-001-PlatformFoundation` 實作與證據不受修改。

### 文件包

| 類型 | 路徑 | 狀態 |
|---|---|---|
| MVP | `datinghigh/docs/requirements/MVP-001-LoveGameDatingApp.md` | 已確認 D-036～D-050，20故事／68 AC |
| SPEC | `datinghigh/docs/specs/SPEC-001-AvatarAndPreferences.md` | SDD已確認；24條AP-AC；2表24欄 |
| BDD | `datinghigh/docs/bdd/SPEC-001-AvatarAndPreferences-BDD.md` | 73場景、13個@frontend，0通過 |
| TDD | `datinghigh/docs/tdd/SPEC-001-AvatarAndPreferences-TDD.md` | 275項待測，原243＋14＋18 |
| RiskAudit | `datinghigh/docs/specs/SPEC-001-AvatarAndPreferences-RiskAudit.md` | 14項風險均已決議，RQ-01=A、RQ-02=A |

### 已確認風險

| 風險 ID | 風險 | 使用者確認／文件回寫與開發注意事項 |
|---|---|---|
| `RA-01` | 逐張單次時限、供應商計費及超時結果不確定 | **已補回文件**：D-050、AP-IT-061/069，單次四圖硬門檻被逐張替代；D-050 不再要求同次四圖：每次真產1張成功才算、失敗保留既有圖，供應商超時不能自動重送。逐張真Gemini量測延遲／費率／限流，不能保證失敗零成本。 |
| `RA-02` | 8MiB 上傳與現有 8KiB 私人 R2/16KiB JSON 限制不相容 | **已補回文件**：新增 AP-API-040（RG-01）驗證受控媒體串流、Web/原生授權與 8 MiB 限制；不擴充原 Foundation 8 KiB 入口；既有 object.private.put 對檔案限8192 bytes，前端預設非GET使用 application/json；直接共用會造成照片上傳失敗或繞過原 CSRF 規則。需新增嚴格驗證的串流專用 API／worker handler，保留原認證 API JSON 限制與可信 Origin。 |
| `RA-03` | 取消 Trigger 後，D1 照片名額與媒體不變式的競態 | **已補回文件**：新增 AP-IT-057～059（RG-02～04），驗真 D1 同時上傳、RETURNING 0列與受控 UPDATE，不使用 SQL Trigger；單一 prepared 條件式 INSERT 要以真 D1 驗並發第5/6張、0列、取消／刪除競態；媒體 owner/kind/key 更新必不可由任何受控命令通過，ready→pending／deleted→ready 必須拒絕。更要實測 D1 對 RETURNING 與 changes/result 的回應，避免誤當插入成功。 |
| `RA-04` | 名片授權過期、終止競態和跨輪讀取 | **已補回文件**：AP-IT-060（RG-05），每次名片照片開啟前重驗同輪有效雙方同意／終止；完整跨 SPEC E2E 後續整合驗；只靠前端隱藏名片或僅傳 boolean authorizedContext 不安全。受信任 AffectionAndFeedback 需在每次投影及開照片串流時，核對本輪雙方同意、有效參與及未終止；猜 ID、他輪及已終止皆拒絕。當前 SPEC 僅保護內部資料契約，完整 E2E 要等後續 SPEC。 |
| `RA-05` | 真人照傳送 Gemini 的用途告知與按開始授權（已確認方案 A） | **已補回文件**：使用者明確選 **RQ-01=A／D-048**；產圖頁內嵌用途提醒，按開始才送照；AP-E2E-037（RG-06）覆蓋，沒有額外跳窗；個人照原本也是交換名片用途；如果未醒目告知第三方 AI 會收到照片，使用者可能在不知情下將真人照傳出去。須在首次實際傳送前清楚顯示第三方用途並有本人主動操作，不預設背景傳送。 |
| `RA-06` | 免費與 AI 化身角色構圖一致性（已確認3:4半身方案 A） | **已補回文件**：使用者明確選 **RQ-02=A／D-049**；3:4半身至腰部、五官清楚、背景簡潔；AP-IT-062、AP-E2E-038（RG-08、RG-12）；免費16款與 AI4款若構圖不同，遊戲人物欄位會裁掉臉、看不出相似度，還可能需要重新產圖。建議一致直向3:4的半身／胸腰人物立繪、臉部清楚；背景單純且不預設透明一定可行。 |
| `RA-07` | 200KB來源照未必足夠保留 AI 人臉相似度 | **使用者接受**：200,000 bytes 來源照限制維持；AP-IT-062（RG-08）要求真人品質驗證，未達人臉可辨識不得假稱合格；壓縮服務須在200000 bytes內保留五官、方向、長寬比、色彩、EXIF移除；以使用者授權真人照做人工相似度驗收。AI正式結果不是個人真人照，不得誤套來源照200KB限制而破壞角色品質。 |
| `RA-08` | 固定 JSON 投影與範例欄位尚缺對齊測試 | **已補回文件**：SDD §7 PUT 範例補 topicTagIds，AP-API-041（RG-09）驗固定 JSON 與歷史代碼；SPEC preferences_json 固定9鍵、interests_json含topicTagIds；§7 PUT 示範沒有 topicTagIds，應驗 DTO 的完整／部分資料映射、未知／重複鍵、合法歷史停用標籤、跨版本回讀及禁止敏感資料直列輸出。 |
| `RA-09` | 逐張短效R2候選、選用CAS與回選 | **已補回文件**：AP-IT-063/064/067/068，沿用無D1 Job與無Trigger；短效60分鐘manifest記錄真正成功的索引且允許回選；本輪只一個inFlight，採用後關閉，D1/R2補償不清除其他合法候選。 |
| `RA-10` | 免費16款立繪正式素材及品質驗收 | **已補回文件**：AP-E2E-038（RG-12）驗16張不同正式立繪資產及來源授權，不用假圖，統一3:4構圖；必須是真正16幅不同、可在商品中使用的素材，不能複製同一圖重新命名或使用原型 fixture；需驗視覺差異、授權與手機 UI 裁切、可跨兩組選取。 |
| `RA-11` | 名片照片替換與身分狀態快取可能揭露舊內容 | **已補回文件**：AP-IT-065（RG-13）驗照片刪除、舊 URL、授權終止及 no-store 後不得新增揭露；本人的 ready 刪除後必立刻無法開始新的被授權串流；Cache-Control no-store、過期代理 URL 不應繞過重新授權。曾被對方保存的影像客戶端無法遠端收回，不宣稱可撤回已交付內容。 |
| `RA-12` | 年齡計算、Unicode與標籤目錄跨版本邊界 | **已補回文件**：AP-UT-113（RG-14）驗2/29、18歲與臺灣午夜固定時鐘；固定臺灣時區與時鐘測試足18歲／未足18歲，含2月29日、未來日期、跨年；Unicode scalar、最大陣列／JSON長度與停用代碼須可讀且不得改義。 |

**風險分界**：使用者接受 D-046 無 D1 Job 表、D-050 每次真產一張與最多四張的流程，仍必須由真 R2 條件寫入、同帳號排他、Gemini 單張結果與費率及 200KB 人臉品質實測。規劃確認**不是**所有外部服務已驗收；未達門檻需停止並提交證據，不得降低 Gate。

| `RA-13` | 多頁及跨Worker重送導致第5張、重複Gemini費用 | **已補回文件**：D-050、RG-15/17及相關TDD，不增加D1 Job表；R2原子條件寫入／同帳號active attempt／clientRequestId冪等，限同時一個inFlight及最多4張成功候選；provider狀態未知不自動解鎖並重送。真R2＋Worker並發及崩潰復原必測，失敗即阻擋Gate。 |
| `RA-14` | 採用後重生需付費提示與MVP當下免費政策可能混淆 | **已補回文件**：D-050、RG-16、跨平台E2E；確認視窗只提示**未來正式收費上線後**依方案付費；本MVP不扣款。取消保留候選，確認才關閉本輪與儲存一張；採用確認窗不等同D-048被禁止的第二個送照同意窗。 |

### 已補回缺漏

| 缺漏 ID | 稽核來源 | TDD 補入項目 | 狀態 |
|---|---|---|---|
| `RG-01` | RA-02、§7 POST /me/photos | `AP-API-040` | 已補入，尚未執行 |
| `RG-02` | RA-03、BDD-047/048 | `AP-IT-057` | 已補入，尚未執行 |
| `RG-03` | RA-03、BDD-047 | `AP-IT-058` | 已補入，尚未執行 |
| `RG-04` | RA-03、BDD-049 | `AP-IT-059` | 已補入，尚未執行 |
| `RG-05` | RA-04、BDD-055 | `AP-IT-060` | 已補入，尚未執行 |
| `RG-06` | RA-05、BDD-001/061 | `AP-E2E-037` | 已補入，尚未執行 |
| `RG-07` | RA-01、AP-BDD-015/034/035/036 | `AP-IT-061` | 已補入，尚未執行 |
| `RG-08` | RA-07、AP-BDD-002/052/063 | `AP-IT-062` | 已補入，尚未執行 |
| `RG-09` | RA-08、AP-BDD-007/041/051 | `AP-API-041` | 已補入，尚未執行 |
| `RG-10` | RA-09、BDD-040/054 | `AP-IT-063` | 已補入，尚未執行 |
| `RG-11` | RA-09、AP-BDD-037/053 | `AP-IT-064` | 已補入，尚未執行 |
| `RG-12` | RA-10、BDD-005/058 | `AP-E2E-038` | 已補入，尚未執行 |
| `RG-13` | RA-11、BDD-004/026 | `AP-IT-065` | 已補入，尚未執行 |
| `RG-14` | RA-12、BDD-050 | `AP-UT-113` | 已補入，尚未執行 |

| `RG-15` | RA-13、AP-BDD-071 | `AP-IT-068` | 已補回TDD／未執行 |
| `RG-16` | RA-14、AP-BDD-073 | `AP-E2E-039`～`AP-E2E-041` | 已補回TDD／未執行 |
| `RG-17` | RA-01/13、AP-BDD-069/070/071 | `AP-API-042`～`AP-API-044` | 已補回TDD／未執行 |
| `RG-18` | RA-01/09、AP-BDD-072 | `AP-IT-069` | 已補回TDD／未執行 |

### 實作注意事項

1. **D-048／RQ-01=A**：產圖頁每次醒目顯示「產圖時會將你已上傳的個人照片提供給第三方 AI 服務處理；不會自動公開給其他玩家」。**本人按「開始產生第1張／產生下一張」才可傳送既有照片**；進頁不自動送照、無二次跳窗、無新同意表。
2. **D-049／RQ-02=A**：免費16款與AI四候選均為**直式3:4半身至腰部立繪，清晰五官、簡潔背景**；容器不裁臉或拉伸，須以授權人像人工確認相似度與構圖。
3. **D-045～D-047 Schema**：新表僅 `user_profiles` 15欄及 `user_media_assets` 9欄，**0個SQL Trigger**，不建AI Job／名片快照／免費角色表，不存圖片byte_size／sha256；既有auth/common六表54欄不變。
4. **D1/R2安全**：照片輸入≤8MiB，使用可重用壓縮服務輸出≤200000 bytes存私人R2；第5／第6張並發由單句prepared條件式INSERT（含pending額度）及0列檢查守住；受控UPDATE不可改owner/kind/objectKey、deleted不可復活。真Miniflare D1／R2測試是必要Gate。
5. **傳輸界限**：業務媒體使用獨立受控串流通道，保持Web Origin/Cookie與原生Bearer／Session驗證；不得放寬原平台16KiB JSON限制，或套用Foundation僅8192 bytes的測試物件API。
6. **Gemini真生成（D-050）**：金鑰只由安全server secret供應；使用已保存本人2～5張照，每個明確操作只請求並驗收一張真 Gemini 插畫，成功才增加本輪 producedCount，最多4張、可提前採用與回選。已有候選不因下一張失敗而作廢；超時或供應商計費狀態不確定不得自動重送，依clientRequestId/R2 CAS排他及限流控成本，只確認採用後存正式一張。不建D1 Job或假稱每次必出圖。
7. **跨SPEC名片界線**：本份僅提供目前本人資料／照片的授權內部讀取契約；25分入口、雙方同意、名片新讀取權限與終止整合由MatchingSessions、StoryDialogueAndExit及AffectionAndFeedback後續負責；不得擅增公開他人名片路由／快照表。
8. **證據與平台**：真D1並發、R2補償、真Gemini逐張結果／費用與限流及R2並發、16張真正不同且有合法來源的插畫資產、Web/Android/iOS各平台證據都須如實驗收。沿用既有 iOS／雲端暫緩決策但不得標Passed；歷史Foundation證據不等於本份驗證。
9. **硬性停損**：Gemini單次請求無法在時限內可靠產1張，或R2 CAS不能防重／超額、200KB壓縮難以辨識臉部、D1/R2補償或授權競態未通過時，必須提出實際證據並停止相應Gate，不改規格、不降低標準。

### 不得進入開發的阻斷項

**無（規劃確認階段）**。外部模型、真實圖片、D1/R2及分平台測試屬於開發驗收硬性條件，仍未實測，不能宣稱已通過。

**交接停止點**：本輪 `perfect-plan` Phase 5 完成，後續應由 `well-done datinghigh/docs/tdd/SPEC-001-AvatarAndPreferences-TDD.md` 接續實作；**本次不修改產品程式碼、不建Migration、不呼叫Gemini、不處理其他SPEC**。

