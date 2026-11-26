# SPEC-001-RainBookshopV4 — 設計決策

**來源 MVP／SPEC／BDD／TDD**：[MVP](../../../requirements/MVP-001-LoveGameDatingApp.md)、[SPEC](../../../specs/SPEC-001-RainBookshopV4.md)、[BDD](../../../bdd/SPEC-001-RainBookshopV4-BDD.md)、[TDD](../../../tdd/SPEC-001-RainBookshopV4-TDD.md)、[RiskAudit](../../../specs/SPEC-001-RainBookshopV4-RiskAudit.md)、[作者原稿](../../../requirements/rain-bookshop-v4-draft.json)、[Verification](../../../verification/SPEC-001-RainBookshopV4-Verification.md)
**決策者／AI／模型／批次／日期**：AI 建議，使用者尚未核准 final；ChatGPT GPT-6.2／20261126／2026-11-26
**final 路徑／設計版本／狀態**：`datinghigh/docs/sd/SPEC-001-RainBookshopV4/final/`／0.2.0-draft／**Draft（完整文件結構已建立，尚待逐項設計稽核，禁止開工）**
**來源／程式基準與核准快照**：下列來源 SHA 已重讀核對；產品未提交變更僅本 final 設計文件，MCP 無法取得現行 HEAD SHA，Antigravity 記載 c5add81bfc38045664297b8087c78f5b2e258a44 不冒充本次查核。final 總覽列設計文件指紋；目前無核准快照。

## 候選清冊與基準對齊

| 候選 ID／完整包路徑 | AI／模型／批次／設計版本 | 來源文件版本／指紋 | 程式 commit／未提交改動 | 是否納入及取代依據 |
|---|---|---|---|---|
| [C](../candidates/chatgpt-gpt-6.2/20261125-2221-01/00-overview.md) | ChatGPT GPT-6.2／20261125-2221-01／v2 Draft | 與現行七份來源 SHA 一致 | 原記工具變更、HEAD 未提供 | 納入；無取代證據 |
| [A](../candidates/antigravity-model-unprovided/20261125-2312-01/00-overview.md) | Antigravity／模型未提供／20261125-2312-01／v1.0.0 Awaiting approval（候選自評） | 與現行七份來源 SHA 一致 | 原記 HEAD c5add81bfc38045664297b8087c78f5b2e258a44、產品無改動 | 納入；無取代證據 |

| 來源 | 現行 SHA-256 |
|---|---|
| MVP | `9f1e2d488ddf20d00cb54b3731363cd2d9b62c06660f426f86acb610af75b4a1` |
| SPEC | `78dd9c2202de603070846715454fca6b4cd94cc959fe1eac9937c6654f084843` |
| BDD | `72a0ce6703e94235c3fb8e26b4cd49cec52a6a51c1b8b9a4ef5f55786ab6f2d8` |
| TDD | `edbfc1dd391d724ddd79ffe031b05cd75731553501d0dbfca94ccf7a36676cda` |
| RiskAudit | `987a83f8201cfb20f7756e5226e908bf76d0a39ab8e73f2882d3aaa1c159e577` |
| 作者原稿 | `b5c18f6762c87e25e1e83deb5769d19dc170c94a69bd6c1cdb15fe34b6809d95` |
| Verification | `7f23e9c13a98fffe0c3891a387bc39f1d9cbb6dd3eca911cb64fc53acbda6ffc` |

| 基準差異 | 現況證據與需求影響 | 對齊方式／無法對齊原因 | 使用者決策／回寫位置 | 比較採用基準 |
|---|---|---|---|---|
| 來源一致 | 七份文件 SHA 完全一致；TDD Ready for well-done、337 未驗 | 不改原需求 | RQ-01～04、RA-Q1～04 均 A | 目前來源 |
| 程式路徑與候選不一致 | Application 下三個 Projection；Api 下 StoryPayload；frontend/client/src 下平面既有元件 | 不因 A 候選錯列而新建同名檔或搬移 | 既有 AGENTS／overview 分層 | 實際讀取與 listing |
| 程式版本快照 | 現行變更僅 final 設計文件；未取得現行 HEAD SHA；已重讀關鍵程式與架構檔 | 保留 SHA 指紋；尚需補完整程式基準 | 不改使用者決策 | 現行工作樹，未完成全量 baseline |
| 兩候選完成度不同 | C D 0/7、180 I；A 自評 D30/30、38 S、36 I | 不直接繼承勾選或核准 | final 必須獨立確認 | Draft |

## 決策準則與範圍

已確認劇本、正確性、平台限制優先；其次評估分層、最小改動、耦合、維運、可驗證性。保留 15 AC、58 BDD（42 frontend）、337 TDD（175U/57I/18A/87E）、12風險、16追加案例；原稿不改。排除 iOS、無障礙專項、Puppet 完整化、其餘九場、AffectionAndFeedback。現行 21 表、零新欄、零 Trigger、零新公開 API；真環境失敗必須停止提出最小方案。候選比較不等同產品驗證。

## 逐細項候選比較與採用

候選來源位置以其各自包內 SD／S／F／SYS ID 定位。以下是已辨識的主要設計決策，不是已完成的全量逐項比較或 final 核准快照。

### DEC-01：內容契約與版本分派（AC-002/011/015；BDD-057/058）

| 候選／精確來源位置 | 具體方案 | 優點 | 缺點／風險／限制 | 採用／不採用／修改 |
|---|---|---|---|---|
| Antigravity／SD-001 S01/S03/S04/S06、SYS-001/002 | 新 v3 parser、原稿編譯與有界商狀態驗證；具明確核心設計 | 新增規則集中，保留安全護欄 | 須確定現有讀取器、原稿與正式產物完整性；不得只測 builder | 取捨見下 |
| ChatGPT／SD-001 S56/S57/S58、SYS-01 | 明確包含 scene-event-content.ts 讀取器、原有 policy 分派及逐原稿 scalar | 保留現有讀取責任；指出 V4 路徑未知 | 缺完整 compiler、正式產物與測試值 | 取捨見下 |

**採用結果與白話理由**：採 A 編譯器與 C reader/policy 相容邊界；正式 v3、v2 舊釘選保持，原稿逐 scalar 保留。Graph 抽象只能折疊不影響可達性與結果的狀態；最壞序列維持 50,000／16,384／512KiB／4MiB／8MiB，不可降 guard。

**整合後新增或調整的設計／預定 final 位置**：SD-001／既有 scene-event-content.ts、scene-event-track-content.ts、scene-event-track-graph.ts、scene-event-stage-content.ts、scene-event-presentation-schema.ts、tools/scene-event-*；實際符號及正反例待逐檔稽核。本位置已建 final 分項及細步；尚待逐項完整設計稽核，不代表產品已完成。

**相容性、依賴、成本與回歸影響**：須按來源全量映射及現行程式核對；維持原 21 表、0 新欄、0 Trigger、0 新公開 API 與既有雙端回歸標準。

### DEC-02：素材製作、原稿與權利（AC-002/012/015；BDD-005/048/056；T337）

| 候選／精確來源位置 | 具體方案 | 優點 | 缺點／風險／限制 | 採用／不採用／修改 |
|---|---|---|---|---|
| Antigravity／SD-001 S04/S05、F-08 | 原稿 assetManifestPlan 驅動，45 新圖＋17 新音，18 沿用 | 涵蓋實際新素材建置及合法權利 | 尚需逐資產精確產出路徑、尺寸、視覺一致與權利資料；image-set 不能當單一圖檔 | 取捨見下 |
| ChatGPT／SD-001 素材逐項設計清冊 | 以 80 ID 逐項盤點並由 SD-001 唯一負責 | 製作責任不重複 | 未完成素材實際路徑及製作契約 | 取捨見下 |

**採用結果與白話理由**：不另拆 SD；SD-001 內區分權利核實、原畫／正式素材製作、引用/遮罩/解碼/幾何與 immutable SHA 核驗步驟。依原稿 1 image-set＋58 image＋21 audio，其中新 45 image＋17 audio。18 reuse 指真來源不複製；保持現有四姿態五表情，權利不明停止。

**整合後新增或調整的設計／預定 final 位置**：SD-001／contracts/story-assets/、provenance.json、既有角色套組來源；SD-004/005 使用；SD-006 真雙平台核驗。本位置已建 final 分項及細步；尚待逐項完整設計稽核，不代表產品已完成。

**相容性、依賴、成本與回歸影響**：須按來源全量映射及現行程式核對；維持原 21 表、0 新欄、0 Trigger、0 新公開 API 與既有雙端回歸標準。

### DEC-03：雙 Track、前半互動、見證與破冰（AC-001～006；BDD-001～020）

| 候選／精確來源位置 | 具體方案 | 優點 | 缺點／風險／限制 | 採用／不採用／修改 |
|---|---|---|---|---|
| Antigravity／SD-002 S01～S03、SD-004 S01～S04 | 純領域規則＋分段 UX，依角色區域與 revision | 核心分支較具體 | 一個步驟內有多項可獨立驗收行為；Projection 路徑誤列 Domain | 取捨見下 |
| ChatGPT／SD-002 S01～S20、SD-003、SD-004 同場景步驟 | 按 BDD 逐行為分解 | 可對應盲書、共鳴、見證、拒絕等獨立驗收 | 跨包重複同一場景名稱；尚缺核心邏輯／可執行選擇器 | 取捨見下 |

**採用結果與白話理由**：A 產品核心＋C 逐行為切分；盲書私有、興趣本人、見證前景窗區與版本、同異書、近遠面紙、留白反向主動、婉拒、雙答案揭示各保有獨立結果與停止條件。純 Domain 不移入投影。

**整合後新增或調整的設計／預定 final 位置**：SD-002 Domain、SD-003 Application/Worker、SD-004 前半 UX；既有 SceneEventTrackPolicy/FrameworkPolicies、Application SceneAreaObservation、SceneEventStageProjection/SceneBookProjection/SceneAudioProjection。本位置已建 final 分項及細步；尚待逐項完整設計稽核，不代表產品已完成。

**相容性、依賴、成本與回歸影響**：須按來源全量映射及現行程式核對；維持原 21 表、0 新欄、0 Trigger、0 新公開 API 與既有雙端回歸標準。

### DEC-04：領域分層與實際檔案（全來源）

| 候選／精確來源位置 | 具體方案 | 優點 | 缺點／風險／限制 | 採用／不採用／修改 |
|---|---|---|---|---|
| Antigravity／SD-002 F-01～05、SD-003 F-01～03 | 新增 V4 policy，將投影列在 Domain，StoryPayload 列 Application | V4 條件可集中測試 | 與實際 repo 不符，可能建立同名檔或不必要搬移 | 取捨見下 |
| ChatGPT／SD-002 F-01/F-02、SD-003 F-01～04 | 沿用 SceneEventTrackPolicy/FrameworkPolicies、Application service/projection、Api StoryPayload | 符合既有分層及最小改動 | 仍須逐方法與副作用確認 | 取捨見下 |

**採用結果與白話理由**：採 C 現行路徑基準，A 規則可納入既有 Domain policy 或必要的純 V4 helper（新增理由需具體）。Application 三個投影保持原位；Api StoryPayload/Program 保持 API 邊界；不新增平行投影。

**整合後新增或調整的設計／預定 final 位置**：SD-002/003；backend/src/DatingHigh.Domain/SceneEventTrackPolicy.cs、SceneEventFrameworkPolicies.cs；backend/src/DatingHigh.Application/SceneEvent{FrameworkService,StageProjection}.cs、SceneBookProjection.cs、SceneAudioProjection.cs；backend/src/DatingHigh.Api/StoryPayload.cs。本位置已建 final 分項及細步；尚待逐項完整設計稽核，不代表產品已完成。

**相容性、依賴、成本與回歸影響**：須按來源全量映射及現行程式核對；維持原 21 表、0 新欄、0 Trigger、0 新公開 API 與既有雙端回歸標準。

### DEC-05：D1 交易原子性、毫秒時鐘與系統冪等（AC-008/009；BDD-033/037/046；T187/325/326）

| 候選／精確來源位置 | 具體方案 | 優點 | 缺點／風險／限制 | 採用／不採用／修改 |
|---|---|---|---|---|
| Antigravity／SD-003 S01、C03-2、F-04/F-05 | 同批共同前置 guard、SQL 時鐘、operationIdentity | 承認 zero rows 不自動 rollback，要求真 D1 | 仍寫 meta.changes===0 拋異常使整批回滾，且反覆以已被更新的舊 revision 作共同 guard 會誤拒；clock 驗證太晚 | 取捨見下 |
| ChatGPT／SYS-04、總覽順序、SD-003 | 先確認真 D1 毫秒 guard/rollback，再領域及權威實作 | 可減少架構返工；不以 HTTP time 代替 | 具體 SQL 仍待真環境證明 | 取捨見下 |

**採用結果與白話理由**：沿用現行 guard(condition) SELECT CASE WHEN ... ELSE json('EVENT_STATE_CONFLICT') END；在同一 batch 寫入前檢查活躍 round、actor/權限與預期 revisions，DML 後同批 guard(changes()=1 OR 合法 replay)，不得在 await batch 後拋錯冒充回滾；避免用舊 revision 重驗已修改欄位。clock 以交易內經真 Miniflare 證明之毫秒 UTC 判定，候選 SQL 非已驗；嚴格 deadline 前封箱才 S；NULL actor 以 session/operationIdentity＋CAS；遇失敗停止、不得改 schema 或降標。

**整合後新增或調整的設計／預定 final 位置**：SD-003 技術前置，先於 SD-001～005 依賴實作；cloudflare/src/scene-event-track-commands.ts、scene-event-commands.ts；原 D1 integration tests。本位置已建 final 分項及細步；尚待逐項完整設計稽核，不代表產品已完成。

**相容性、依賴、成本與回歸影響**：須按來源全量映射及現行程式核對；維持原 21 表、0 新欄、0 Trigger、0 新公開 API 與既有雙端回歸標準。

### DEC-06：倒數、暫緩、救書狀態與結算（AC-007～009；BDD-021～037；T322～331）

| 候選／精確來源位置 | 具體方案 | 優點 | 缺點／風險／限制 | 採用／不採用／修改 |
|---|---|---|---|---|
| Antigravity／SD-002 S04/S05、SD-003 S04/S05、SD-005 S02 | 導演 once、雙 ready、兩題組、暫緩、水位及四步救援 | 細節與 RA 決策較完整 | S04/S05 合併不同前置與結果；須與時鐘 guard 相容 | 取捨見下 |
| ChatGPT／SD-002 S21～S36、SD-003 同行為、SD-004 S22～S36 | 分開 director、ready、duration、題組、救書、錯序、暫緩、競態及結算 | 可定位獨立行為 | 測試映射不等於完整實作；跨包依賴需重建 | 取捨見下 |

**採用結果與白話理由**：採 A typed 狀態及 C 行為切分。15s 閒置/斷線、恢復方首次操作只恢復、活動方不用再次操作，保留持物/已救數；錯扣只重置 latchIndex；四位置不強制四 Area；90s 預設可配置且舊 pin 不變；水位依已確認門檻，等於 deadline 結算 A/B；S/A/B 分支及稱號依原稿。

**整合後新增或調整的設計／預定 final 位置**：SD-001 duration/set validation；SD-002 純狀態機；SD-003 權威提交；SD-005 互動；SD-006 E2E。本位置已建 final 分項及細步；尚待逐項完整設計稽核，不代表產品已完成。

**相容性、依賴、成本與回歸影響**：須按來源全量映射及現行程式核對；維持原 21 表、0 新欄、0 Trigger、0 新公開 API 與既有雙端回歸標準。

### DEC-07：DO 排程與雙 Transport（AC-008/009/012；BDD-033/037/046；T335）

| 候選／精確來源位置 | 具體方案 | 優點 | 缺點／風險／限制 | 採用／不採用／修改 |
|---|---|---|---|---|
| Antigravity／SD-003 S05/S06、F-08/F-09 | DO 最早 alarm、多分頁角色聚合、HTTP/WS 共用 service | 防止新 nonce 覆蓋更早到期 | 精確 command dispatch、實際 handler、驗權/失權需校對；不應引入第二權威 | 取捨見下 |
| ChatGPT／SYS-04、SD-003 F-08/F-09、SD-004 | 現有 commands.ts、room-socket.ts、StoryDialogueService、transport 基線 | 可沿用原入口 | 對實際事件 dispatch 與投影尚未完整設計 | 取捨見下 |

**採用結果與白話理由**：DO 只喚醒及重讀 D1，min(deadline,pauseDue)；背景 ping 不算玩家操作，角色聚合、撤權、冷啟、晚 alarm、重送與 HTTP/WS 對稱；保留既有公開 API。私有 system.reconcile 不給玩家任意呼叫。

**整合後新增或調整的設計／預定 final 位置**：SD-003／cloudflare/src/commands.ts、scene-event-track-commands.ts、room-socket.ts、scene-event-authorization.ts、scene-event-read.ts；Application/Api；SD-006 真 DO。本位置已建 final 分項及細步；尚待逐項完整設計稽核，不代表產品已完成。

**相容性、依賴、成本與回歸影響**：須按來源全量映射及現行程式核對；維持原 21 表、0 新欄、0 Trigger、0 新公開 API 與既有雙端回歸標準。

### DEC-08：前端檔案責任及去按鈕化探索（42 frontend BDD）

| 候選／精確來源位置 | 具體方案 | 優點 | 缺點／風險／限制 | 採用／不採用／修改 |
|---|---|---|---|---|
| Antigravity／SD-004 F-01～09、SD-005 F-01～08 | 拆前半探索/破冰與後半救書/收尾，頂層唯一寫入 | 按玩家體驗而非測試層級分工 | types/components/services/screens 為目前不存在的路徑；新增元件須按現行結構；部分既有舞台 helper 缺列 | 取捨見下 |
| ChatGPT／SD-004 F-01～11 | 單包共用 renderer，實際 src 平面路徑、ADVStage/scene-stage | 正確定位既有元件 | 42 個 UI 步驟尚需精確操作與契約；一包較大 | 取捨見下 |

**採用結果與白話理由**：保留 A 前半/後半兩包、C 現有 flat src 與舞台 helper；新增必要元件也置於 src（遵循既有檔案規則），禁止複製出第二套同名畫面。StoryExperienceScreen 唯一由後半包組裝；明確指定 ADVStage/scene-stage/scene-browser-lifecycle 的唯一 owner。

**整合後新增或調整的設計／預定 final 位置**：SD-004/005；frontend/client/src/{scene-event-track.ts,EmbeddedSceneStage.tsx,SceneWorldObjects.tsx,SceneBook.tsx,SceneEventActions.tsx,ADVStage.tsx,scene-stage.ts,SceneStoryMotion.tsx,SceneWeather.tsx,StoryAudio.tsx,StoryExperienceScreen.tsx,RealtimeRoomClient.ts}。本位置已建 final 分項及細步；尚待逐項完整設計稽核，不代表產品已完成。

**相容性、依賴、成本與回歸影響**：須按來源全量映射及現行程式核對；維持原 21 表、0 新欄、0 Trigger、0 新公開 API 與既有雙端回歸標準。

### DEC-09：跨平台手勢、資產與生命週期（BDD-003/004/005/006/022/026～032/048～050）

| 候選／精確來源位置 | 具體方案 | 優點 | 缺點／風險／限制 | 採用／不採用／修改 |
|---|---|---|---|---|
| Antigravity／SD-004 S01/S02、SD-005 S01/S02/S04 | 共用 PanResponder、相機轉換與互動元件 | 具體操作及手勢衝突方向 | 不得假設 RN/Web 同樣事件序，仍需核對實際現行 hitMask 與 lifecycle | 取捨見下 |
| ChatGPT／SD-004 S03～S06、S22/S26～S32/S48～S50 | 逐 BDD 手勢、預覽/權威提交分離，現有舞台定位 | 場景行為分解完整 | 缺實際新增符號與 fixture 具體值 | 取捨見下 |

**採用結果與白話理由**：按既有相機/命中幾何擴充，共用短點/長按/拖放/橫滑互斥、cancel/reconnect 不偷送；失權/背景關閉與釋放；音訊本人啟用、不自動恢復；兩端獨立操作驗證，不以 API 代玩家動作。

**整合後新增或調整的設計／預定 final 位置**：SD-004/005／SceneWorldObjects、EmbeddedSceneStage、ADVStage、scene-stage、SceneBook、StoryAudio、scene-browser-lifecycle；SD-006 雙端。本位置已建 final 分項及細步；尚待逐項完整設計稽核，不代表產品已完成。

**相容性、依賴、成本與回歸影響**：須按來源全量映射及現行程式核對；維持原 21 表、0 新欄、0 Trigger、0 新公開 API 與既有雙端回歸標準。

### DEC-10：書籤、四結局、借閱小票與私密投影（AC-010/011；BDD-038～046）

| 候選／精確來源位置 | 具體方案 | 優點 | 缺點／風險／限制 | 採用／不採用／修改 |
|---|---|---|---|---|
| Antigravity／SD-002 S06、SD-005 S03/S04、CORE-05 | 完整書籤過濾/願望矩陣/結局/小票設計 | 明確安全與輸出 | 投影位置錯；多分支集中在大步驟 | 取捨見下 |
| ChatGPT／SD-002 S38～S45、SD-004 S38～S46、SYS-05 | 按書籤、意願、結局、印章分解 | 可獨立驗收 | 缺精確投影及畫面符號 | 取捨見下 |

**採用結果與白話理由**：保持 0–20 Unicode scalar，拒控制字元/HTML；3×3 意願、四結局、B 直接安全收尾；結局2授權翻閱；X/4 僅同 pair/當前 round/同 V4 版本不同結局，霧窗前景見證才有印章，小票無私密 note/自由輸入/真實個資。分開各前置與結果，維持 Application 白名單投影及 Domain 純計算。

**整合後新增或調整的設計／預定 final 位置**：SD-002/003/005；原 Domain、Application Projection、StoryExperienceScreen、SceneBook；SD-006。本位置已建 final 分項及細步；尚待逐項完整設計稽核，不代表產品已完成。

**相容性、依賴、成本與回歸影響**：須按來源全量映射及現行程式核對；維持原 21 表、0 新欄、0 Trigger、0 新公開 API 與既有雙端回歸標準。

### DEC-11：發布與釘選時序（AC-011/012/015；BDD-057）

| 候選／精確來源位置 | 具體方案 | 優點 | 缺點／風險／限制 | 採用／不採用／修改 |
|---|---|---|---|---|
| Antigravity／SD-001 S06、SD-006 S06 | 不可變發布與正式索引檢查 | 可建立真內容測試 | SD-001 發布措辭與 SPEC『Gate A 完成後升版發布』須區分隔離候選與正式索引 | 取捨見下 |
| ChatGPT／SD-001 S57、總覽 | 先驗內容、原子 index，保留舊 pin | 可維持失敗不切 head | 缺精確正式路徑和 staging/正式分界 | 取捨見下 |

**採用結果與白話理由**：SD-001 在隔離受控真環境建置、發布候選以驗證；SD-006 Gate A 後只切已驗相同精確 SHA 的已知 local 正式索引；Gate B 前保留 V3 舊版讀取及場次釘選，不覆寫舊 SHA；此階段不授權 remote/production。

**整合後新增或調整的設計／預定 final 位置**：SD-001/006／scene-event-publish-policy.mjs、scene-event-content.json、既有 R2/D1 發布；SD-007 Gate B 後清理。本位置已建 final 分項及細步；尚待逐項完整設計稽核，不代表產品已完成。

**相容性、依賴、成本與回歸影響**：須按來源全量映射及現行程式核對；維持原 21 表、0 新欄、0 Trigger、0 新公開 API 與既有雙端回歸標準。

### DEC-12：Gate A/B 與清理後驗收的無循環責任（AC-012～014；T291～309/334/337）

| 候選／精確來源位置 | 具體方案 | 優點 | 缺點／風險／限制 | 採用／不採用／修改 |
|---|---|---|---|---|
| Antigravity／00-overview 完成契約、SD-006 S06、SD-007 S01～S05 | Gate A 核驗器與 Gate B、清理、CleanReplay 分包 | 後段步驟明列人工核准及清理 | 總覽『337/337 通過 Gate A』與 295 本人 Gate B、296–309/334 後段案例矛盾；S01/S02 及測試層級要明確 | 取捨見下 |
| ChatGPT／總覽、SD-005 S51/S55、SD-006 S52～S55、SD-007 | Gate A→Gate B→清理→深度稽核 | 方向正確 | CleanReplay 304–307 分散在前置包，可能形成依賴循環 | 取捨見下 |

**採用結果與白話理由**：全量分母不變 337。Gate A 核對 321 個非後段案例（337−295～309 共15−334 共1），Gate B 唯一人工 T295，T296–309 與 T334 為後段 15 案例；後段單元/隔離整合可先建置/實測但不作 Gate A 的後清理硬條件，具名清理僅 Gate B 後，最終 337/337。每個 ID 單一主責、測試證據需實際 assertion，非測試名稱自動代簽。

**整合後新增或調整的設計／預定 final 位置**：SD-006 Gate A；SD-007 Gate B、cleanup、CleanReplay；前段可提供 runner 但不提前勾驗收。本位置已建 final 分項及細步；尚待逐項完整設計稽核，不代表產品已完成。

**相容性、依賴、成本與回歸影響**：須按來源全量映射及現行程式核對；維持原 21 表、0 新欄、0 Trigger、0 新公開 API 與既有雙端回歸標準。

### DEC-13：清理、保護指紋及最小工具擴充（AC-013/014；BDD-053～055；T334）

| 候選／精確來源位置 | 具體方案 | 優點 | 缺點／風險／限制 | 採用／不採用／修改 |
|---|---|---|---|---|
| Antigravity／SD-007 S01～S05、F-01/F-02 | 新增 V4 cleanup-policy、現有 wrapper、精確 FK/R2 保護 | 具名清理與混合輪停止條件具體 | 與現有 scene-event-local-policy.mjs 重疊，新增檔需證明必要 | 取捨見下 |
| ChatGPT／SD-006 F-01/F-02、SYS-06 | 擴充現有 scene-event-local-policy/local.mjs | 減少工具重複 | 需要更具體拓樸、補償、清單與 fixture | 取捨見下 |

**採用結果與白話理由**：優先沿用現有 scene-event-local-policy.mjs 和 local.mjs；若 V4 需要純 helper 才新增且明確界線。已知 default local、停寫、備份、預覽具名 V1/V2/V3＋具名 V4 驗收 Round；非測試混合/不明引用拒絕；FK、共享 SHA、保護帳號個資照片化身；失敗回復可重試，清理後雙端乾淨重玩，禁止 remote。

**整合後新增或調整的設計／預定 final 位置**：SD-007／tools/scene-event-local-policy.mjs、tools/local.mjs、真 D1/R2 測試、SD-006 runner。本位置已建 final 分項及細步；尚待逐項完整設計稽核，不代表產品已完成。

**相容性、依賴、成本與回歸影響**：須按來源全量映射及現行程式核對；維持原 21 表、0 新欄、0 Trigger、0 新公開 API 與既有雙端回歸標準。

### DEC-14：步驟粒度、深度稽核及文件交付（全來源）

| 候選／精確來源位置 | 具體方案 | 優點 | 缺點／風險／限制 | 採用／不採用／修改 |
|---|---|---|---|---|
| Antigravity／38 S、36 I、30 D；SD-007 S05 | 產品責任導向與較完整測試/命令/判定 | 分項合理，減少機械式 Todo | 數個 S 混合多個獨立行為，且部分計數自評不能繼承 | 取捨見下 |
| ChatGPT／180 S/I、7 D；SD-007 | 逐 BDD 拆解，獨立深度稽核與交付 | 便於檢查未漏行為 | 同一 BDD 機械跨層重複，部分只有測試設計或泛化 Green | 取捨見下 |

**採用結果與白話理由**：採 A 七個產品責任分項、C 可觀察行為切分及獨立深度稽核子階段。重建 S/I 順序而非拼接兩個候選；每 S 一個可觀察成果、唯一 I、實際產品 F/符號/核心分支、命令及停止條件。全部 15 AC/58 BDD/337 TDD 逐項核對，來源 checkbox 保留 0。

**整合後新增或調整的設計／預定 final 位置**：全包、SD-007 最終深度稽核；已建全量 ID 與細步映射，完整設計稽核仍待完成。本位置已建 final 分項及細步；尚待逐項完整設計稽核，不代表產品已完成。

**相容性、依賴、成本與回歸影響**：須按來源全量映射及現行程式核對；維持原 21 表、0 新欄、0 Trigger、0 新公開 API 與既有雙端回歸標準。

## 整合一致性檢查

| 面向 | 組合風險／衝突 | final 處理與責任 | 查核證據／尚待決策 |
|---|---|---|---|
| 契約、版本、資料權威／流向、不變條件 | 原稿、時鐘、D1 guard、既有釘選、私密投影 | DEC-01/03/05/06/07/10/11 | 原稿 SHA、SPEC §3.5–3.7、現行 track commands guard；尚未真 D1 驗證 |
| 依賴、檔案寫入責任、共用環境、整合 | 錯路徑、同名重建、時鐘 probe 過晚 | DEC-04/05/08/13/14 | 實際檔案與 overview module map；已建反向追溯表，待逐檔深度稽核 |
| UX、平台、驗證相容性與回歸 | 42 frontend BDD 的各條件、手勢與狀態不可簡化 | DEC-02/03/08/09/10/12 | 兩候選結構映射已盤點；逐畫面與斷言尚待完成 |
| 步驟順序／前置、案例／斷言、命令及通過／停止條件 | 180 步過度重複、38 步部分太大；Gate A 分母造成循環 | DEC-05/12/14 | 先 D1 probe、內容、領域/前半 UX、權威/後半 UX、Gate A、本人 Gate B、清理、乾淨回歸與深度稽核；已建 S/I/F/V 結構映射，待完整可執行性稽核 |

## 候選到 final 的步驟對照

以下將兩候選原有 218 個步驟全部映射至 final。A 原 38 個群組保留具體核心、fixture、指令與整合關卡，必要時拆成獨立行為細步；C 原 180 步逐步比較其 Green 實作意圖及既有程式責任，未盲目照搬 F 編號。映射對照是結構查核，不能代替對每個 final 細步的精確符號、依賴、實際產品行為與可執行性桌面稽核。候選原文的 F 編號屬各自候選，不是 final 的 F 編號。

### Antigravity（A）38 個步驟

| 候選步驟 | final 群組／細步 | 唯一 I | 採用／拆分理由 |
|---|---|---|---|
| A／SD-001-S01 | SD-001-S01 群組契約及整合關卡；SD-001-S157 | SD-001-I01 | 保留具體核心規則、fixture、F/V 與驗收；按來源行為細分，群組不重複實作，修正 DEC-01～14 對應的分層、時鐘、Gate 與檔案責任。 |
| A／SD-001-S02 | SD-001-S02 群組契約及整合關卡；SD-001-S224、SD-001-S225 | SD-001-I01 | 保留具體核心規則、fixture、F/V 與驗收；按來源行為細分，群組不重複實作，修正 DEC-01～14 對應的分層、時鐘、Gate 與檔案責任。 |
| A／SD-001-S03 | SD-001-S03 群組契約及整合關卡；SD-001-S358 | SD-001-I02 | 保留具體核心規則、fixture、F/V 與驗收；按來源行為細分，群組不重複實作，修正 DEC-01～14 對應的分層、時鐘、Gate 與檔案責任。 |
| A／SD-001-S04 | SD-001-S04 群組契約及整合關卡；SD-001-S456 | SD-001-I03 | 保留具體核心規則、fixture、F/V 與驗收；按來源行為細分，群組不重複實作，修正 DEC-01～14 對應的分層、時鐘、Gate 與檔案責任。 |
| A／SD-001-S05 | SD-001-S05 群組契約及整合關卡；SD-001-S505、SD-001-S548 | SD-001-I04 | 保留具體核心規則、fixture、F/V 與驗收；按來源行為細分，群組不重複實作，修正 DEC-01～14 對應的分層、時鐘、Gate 與檔案責任。 |
| A／SD-001-S06 | SD-001-S06 群組契約及整合關卡；SD-001-S624、SD-001-S656、SD-001-S657、SD-001-S658 | SD-001-I05 | 保留具體核心規則、fixture、F/V 與驗收；按來源行為細分，群組不重複實作，修正 DEC-01～14 對應的分層、時鐘、Gate 與檔案責任。 |
| A／SD-002-S01 | SD-002-S01 群組契約及整合關卡；SD-002-S101、SD-002-S102、SD-002-S105、SD-002-S106、SD-002-S107、SD-002-S108 | SD-002-I01 | 保留具體核心規則、fixture、F/V 與驗收；按來源行為細分，群組不重複實作，修正 DEC-01～14 對應的分層、時鐘、Gate 與檔案責任。 |
| A／SD-002-S02 | SD-002-S02 群組契約及整合關卡；SD-002-S209、SD-002-S210、SD-002-S211、SD-002-S212 | SD-002-I02 | 保留具體核心規則、fixture、F/V 與驗收；按來源行為細分，群組不重複實作，修正 DEC-01～14 對應的分層、時鐘、Gate 與檔案責任。 |
| A／SD-002-S03 | SD-002-S03 群組契約及整合關卡；SD-002-S313、SD-002-S314、SD-002-S315、SD-002-S316、SD-002-S317、SD-002-S318、SD-002-S320 | SD-002-I03 | 保留具體核心規則、fixture、F/V 與驗收；按來源行為細分，群組不重複實作，修正 DEC-01～14 對應的分層、時鐘、Gate 與檔案責任。 |
| A／SD-002-S04 | SD-002-S04 群組契約及整合關卡；SD-002-S421、SD-002-S423、SD-002-S424、SD-002-S425、SD-002-S431、SD-002-S432、SD-002-S433 | SD-002-I04 | 保留具體核心規則、fixture、F/V 與驗收；按來源行為細分，群組不重複實作，修正 DEC-01～14 對應的分層、時鐘、Gate 與檔案責任。 |
| A／SD-002-S05 | SD-002-S05 群組契約及整合關卡；SD-002-S526、SD-002-S527、SD-002-S528、SD-002-S529、SD-002-S530、SD-002-S534、SD-002-S535、SD-002-S536 | SD-002-I05 | 保留具體核心規則、fixture、F/V 與驗收；按來源行為細分，群組不重複實作，修正 DEC-01～14 對應的分層、時鐘、Gate 與檔案責任。 |
| A／SD-002-S06 | SD-002-S06 群組契約及整合關卡；SD-002-S638、SD-002-S639、SD-002-S640、SD-002-S642、SD-002-S643、SD-002-S644、SD-002-S645 | SD-002-I06 | 保留具體核心規則、fixture、F/V 與驗收；按來源行為細分，群組不重複實作，修正 DEC-01～14 對應的分層、時鐘、Gate 與檔案責任。 |
| A／SD-003-S01 | SD-003-S01 群組契約及整合關卡；SD-003-S133、SD-003-S137；另提前 S00 技術 probe | SD-003-I03 | 保留具體核心規則、fixture、F/V 與驗收；按來源行為細分，群組不重複實作，修正 DEC-01～14 對應的分層、時鐘、Gate 與檔案責任。 |
| A／SD-003-S02 | SD-003-S02 群組契約及整合關卡；SD-003-S237、SD-003-S245、SD-003-S246、SD-003-S247、SD-003-S248、SD-003-S250 | SD-003-I01 | 保留具體核心規則、fixture、F/V 與驗收；按來源行為細分，群組不重複實作，修正 DEC-01～14 對應的分層、時鐘、Gate 與檔案責任。 |
| A／SD-003-S03 | SD-003-S03 群組契約及整合關卡；SD-003-S301、SD-003-S302、SD-003-S306、SD-003-S307、SD-003-S308、SD-003-S309、SD-003-S310、SD-003-S311、SD-003-S312、SD-003-S313、SD-003-S314、SD-003-S315、SD-003-S316、SD-003-S317、SD-003-S318、SD-003-S319、SD-003-S320、SD-003-S338、SD-003-S339、SD-003-S340、SD-003-S341、SD-003-S342、SD-003-S343、SD-003-S344、SD-003-S345、SD-003-S347、SD-003-S348、SD-003-S349 | SD-003-I02 | 保留具體核心規則、fixture、F/V 與驗收；按來源行為細分，群組不重複實作，修正 DEC-01～14 對應的分層、時鐘、Gate 與檔案責任。 |
| A／SD-003-S04 | SD-003-S04 群組契約及整合關卡；SD-003-S421、SD-003-S422、SD-003-S423、SD-003-S425、SD-003-S426、SD-003-S427、SD-003-S428、SD-003-S429、SD-003-S430、SD-003-S431、SD-003-S432、SD-003-S434、SD-003-S435、SD-003-S436、SD-003-S446 | SD-003-I03 | 保留具體核心規則、fixture、F/V 與驗收；按來源行為細分，群組不重複實作，修正 DEC-01～14 對應的分層、時鐘、Gate 與檔案責任。 |
| A／SD-003-S05 | SD-003-S05 群組契約及整合關卡；SD-003-S532、SD-003-S537 | SD-003-I04 | 保留具體核心規則、fixture、F/V 與驗收；按來源行為細分，群組不重複實作，修正 DEC-01～14 對應的分層、時鐘、Gate 與檔案責任。 |
| A／SD-003-S06 | SD-003-S06 群組契約及整合關卡；SD-003-S618、SD-003-S621、SD-003-S623、SD-003-S624、SD-003-S625、SD-003-S632、SD-003-S633、SD-003-S637、SD-003-S638、SD-003-S639、SD-003-S643、SD-003-S645、SD-003-S646 | SD-003-I05 | 保留具體核心規則、fixture、F/V 與驗收；按來源行為細分，群組不重複實作，修正 DEC-01～14 對應的分層、時鐘、Gate 與檔案責任。 |
| A／SD-003-S07 | SD-003-S07 群組契約及整合關卡；SD-003-S707、SD-003-S712、SD-003-S747、SD-003-S748 | SD-003-I06 | 保留具體核心規則、fixture、F/V 與驗收；按來源行為細分，群組不重複實作，修正 DEC-01～14 對應的分層、時鐘、Gate 與檔案責任。 |
| A／SD-004-S01 | SD-004-S01 群組契約及整合關卡；SD-004-S101、SD-004-S102、SD-004-S103、SD-004-S104 | SD-004-I01 | 保留具體核心規則、fixture、F/V 與驗收；按來源行為細分，群組不重複實作，修正 DEC-01～14 對應的分層、時鐘、Gate 與檔案責任。 |
| A／SD-004-S02 | SD-004-S02 群組契約及整合關卡；SD-004-S205、SD-004-S206、SD-004-S207、SD-004-S208 | SD-004-I02 | 保留具體核心規則、fixture、F/V 與驗收；按來源行為細分，群組不重複實作，修正 DEC-01～14 對應的分層、時鐘、Gate 與檔案責任。 |
| A／SD-004-S03 | SD-004-S03 群組契約及整合關卡；SD-004-S309、SD-004-S310、SD-004-S311、SD-004-S312、SD-004-S320 | SD-004-I03 | 保留具體核心規則、fixture、F/V 與驗收；按來源行為細分，群組不重複實作，修正 DEC-01～14 對應的分層、時鐘、Gate 與檔案責任。 |
| A／SD-004-S04 | SD-004-S04 群組契約及整合關卡；SD-004-S413、SD-004-S414、SD-004-S415、SD-004-S416、SD-004-S417、SD-004-S419 | SD-004-I04 | 保留具體核心規則、fixture、F/V 與驗收；按來源行為細分，群組不重複實作，修正 DEC-01～14 對應的分層、時鐘、Gate 與檔案責任。 |
| A／SD-005-S01 | SD-005-S01 群組契約及整合關卡；SD-005-S122 | SD-005-I01 | 保留具體核心規則、fixture、F/V 與驗收；按來源行為細分，群組不重複實作，修正 DEC-01～14 對應的分層、時鐘、Gate 與檔案責任。 |
| A／SD-005-S02 | SD-005-S02 群組契約及整合關卡；SD-005-S223、SD-005-S226、SD-005-S227、SD-005-S228、SD-005-S229、SD-005-S230、SD-005-S231、SD-005-S232、SD-005-S234、SD-005-S235、SD-005-S236 | SD-005-I02 | 保留具體核心規則、fixture、F/V 與驗收；按來源行為細分，群組不重複實作，修正 DEC-01～14 對應的分層、時鐘、Gate 與檔案責任。 |
| A／SD-005-S03 | SD-005-S03 群組契約及整合關卡；SD-005-S338、SD-005-S340、SD-005-S341、SD-005-S342、SD-005-S344 | SD-005-I03 | 保留具體核心規則、fixture、F/V 與驗收；按來源行為細分，群組不重複實作，修正 DEC-01～14 對應的分層、時鐘、Gate 與檔案責任。 |
| A／SD-005-S04 | SD-005-S04 群組契約及整合關卡；SD-005-S445、SD-005-S446、SD-005-S448、SD-005-S449、SD-005-S450 | SD-005-I04 | 保留具體核心規則、fixture、F/V 與驗收；按來源行為細分，群組不重複實作，修正 DEC-01～14 對應的分層、時鐘、Gate 與檔案責任。 |
| A／SD-006-S01 | SD-006-S01 群組契約及整合關卡；SD-006-S151 | SD-006-I01 | 保留具體核心規則、fixture、F/V 與驗收；按來源行為細分，群組不重複實作，修正 DEC-01～14 對應的分層、時鐘、Gate 與檔案責任。 |
| A／SD-006-S02 | SD-006-S02 群組契約及整合關卡；SD-006-S250、SD-006-S251 | SD-006-I02 | 保留具體核心規則、fixture、F/V 與驗收；按來源行為細分，群組不重複實作，修正 DEC-01～14 對應的分層、時鐘、Gate 與檔案責任。 |
| A／SD-006-S03 | SD-006-S03 群組契約及整合關卡；SD-006-S301、SD-006-S302、SD-006-S303、SD-006-S304、SD-006-S305、SD-006-S306、SD-006-S307、SD-006-S308、SD-006-S309、SD-006-S310、SD-006-S311、SD-006-S312、SD-006-S313、SD-006-S314、SD-006-S315、SD-006-S316、SD-006-S317、SD-006-S319、SD-006-S320 | SD-006-I03 | 保留具體核心規則、fixture、F/V 與驗收；按來源行為細分，群組不重複實作，修正 DEC-01～14 對應的分層、時鐘、Gate 與檔案責任。 |
| A／SD-006-S04 | SD-006-S04 群組契約及整合關卡；SD-006-S422、SD-006-S423、SD-006-S426、SD-006-S427、SD-006-S428、SD-006-S429、SD-006-S430、SD-006-S431、SD-006-S432、SD-006-S434、SD-006-S435、SD-006-S436、SD-006-S438、SD-006-S440、SD-006-S441、SD-006-S442、SD-006-S444、SD-006-S445、SD-006-S446、SD-006-S448、SD-006-S449、SD-006-S450 | SD-006-I04 | 保留具體核心規則、fixture、F/V 與驗收；按來源行為細分，群組不重複實作，修正 DEC-01～14 對應的分層、時鐘、Gate 與檔案責任。 |
| A／SD-006-S05 | SD-006-S05 群組契約及整合關卡；SD-006-S501、SD-006-S502、SD-006-S503、SD-006-S504、SD-006-S505、SD-006-S506、SD-006-S507、SD-006-S508、SD-006-S509、SD-006-S510、SD-006-S511、SD-006-S512、SD-006-S513、SD-006-S514、SD-006-S515、SD-006-S516、SD-006-S517、SD-006-S519、SD-006-S520、SD-006-S522、SD-006-S523、SD-006-S526、SD-006-S527、SD-006-S528、SD-006-S529、SD-006-S530、SD-006-S531、SD-006-S532、SD-006-S534、SD-006-S535、SD-006-S536、SD-006-S538、SD-006-S540、SD-006-S541、SD-006-S542、SD-006-S544、SD-006-S545、SD-006-S546、SD-006-S548、SD-006-S549、SD-006-S550 | SD-006-I05 | 保留具體核心規則、fixture、F/V 與驗收；按來源行為細分，群組不重複實作，修正 DEC-01～14 對應的分層、時鐘、Gate 與檔案責任。 |
| A／SD-006-S06 | SD-006-S06 群組契約及整合關卡；SD-006-S651 | SD-006-I06 | 保留具體核心規則、fixture、F/V 與驗收；按來源行為細分，群組不重複實作，修正 DEC-01～14 對應的分層、時鐘、Gate 與檔案責任。 |
| A／SD-007-S01 | SD-007-S01 群組契約及整合關卡；SD-007-S153、SD-007-S154、SD-007-S155 | SD-007-I01 | 保留具體核心規則、fixture、F/V 與驗收；按來源行為細分，群組不重複實作，修正 DEC-01～14 對應的分層、時鐘、Gate 與檔案責任。 |
| A／SD-007-S02 | SD-007-S02 群組契約及整合關卡；SD-007-S253、SD-007-S254、SD-007-S255 | SD-007-I02 | 保留具體核心規則、fixture、F/V 與驗收；按來源行為細分，群組不重複實作，修正 DEC-01～14 對應的分層、時鐘、Gate 與檔案責任。 |
| A／SD-007-S03 | SD-007-S03 群組契約及整合關卡；SD-007-S352 | SD-007-I03 | 保留具體核心規則、fixture、F/V 與驗收；按來源行為細分，群組不重複實作，修正 DEC-01～14 對應的分層、時鐘、Gate 與檔案責任。 |
| A／SD-007-S04 | SD-007-S04 群組契約及整合關卡；SD-007-S455 | SD-007-I04 | 保留具體核心規則、fixture、F/V 與驗收；按來源行為細分，群組不重複實作，修正 DEC-01～14 對應的分層、時鐘、Gate 與檔案責任。 |
| A／SD-007-S05 | SD-007-S05 群組契約及整合關卡；SD-007-S551、SD-007-S552、SD-007-S553 | SD-007-I05 | 保留具體核心規則、fixture、F/V 與驗收；按來源行為細分，群組不重複實作，修正 DEC-01～14 對應的分層、時鐘、Gate 與檔案責任。 |

### ChatGPT（C）180 個步驟

| 候選步驟 | 候選具體方案（Green 意圖，F 編號屬原候選） | final 步驟／責任 | I | 取捨 |
|---|---|---|---|---|
| C／SD-001-S24 DurationConfig | F-01 `trackDefinitionSchema`／`validateTrackContent`、F-05 `buildSceneEventTrackBundle`、F-06 `validateFormalSceneEventBundles`：嚴格讀 pinned durationSeconds、各門檻及文案數字；拒非正整數、溢位、缺欄、門檻不在時長內；將設定及其 SHA 納入輸出，不能覆蓋舊 pin。 | SD-001-S224、SD-001-S624 | SD-001-I01、SD-001-I05 | 採內容／原稿／素材與發布責任，整合 A 編譯契約與原有 reader；不額外拆素材 SD。 |
| C／SD-001-S25 RescueSetPin | F-01 `validateTrackContent`、F-05 `buildSceneEventTrackBundle`：從兩組原始 targetSets 建立有限 ID/position/role/slot mapping，每組四個不同位置；set A 兩本 shelves 不另造 Area；內容保留原字串，執行選取由 SD-002。 | SD-001-S225 | SD-001-I01 | 採內容／原稿／素材與發布責任，整合 A 編譯契約與原有 reader；不額外拆素材 SD。 |
| C／SD-001-S56 AuthorIntegrity | F-05 `buildSceneEventTrackBundle`、F-07 `validateFirstStoryAuthoring`、F-01 `validateTrackContent`、F-04 `validateStageReferences`：建立 author JSON path→正式 ID/原文清冊；逐 scalar 比對每本、28 node、9 binding、所有 sharedModule/ending/uiCopy，缺字、標點、unknown op/placeholder fail closed；原稿 SHA 不寫。 | SD-001-S456、SD-001-S656 | SD-001-I03、SD-001-I05 | 採內容／原稿／素材與發布責任，整合 A 編譯契約與原有 reader；不額外拆素材 SD。 |
| C／SD-001-S57 PublisherVersion | F-03 `readPinnedSceneEventContent`、F-06 `publishSceneEventBundles`、F-07 `validateFirstStoryAuthoring`、F-08 正式索引、F-09 舊 bundle 沿用保護：按 schema/version 分派 v2/v3，先驗 bytes/SHA/asset/rights/graph，再 immutable publish 與原子 index；失敗不切 head，既有 V3 pin 仍讀原 SHA；V4 精確產物路徑仍待確認。 | SD-001-S157、SD-001-S657 | SD-001-I01、SD-001-I05 | 採內容／原稿／素材與發布責任，整合 A 編譯契約與原有 reader；不額外拆素材 SD。 |
| C／SD-001-S58 Reachability | F-02 `validateTrackReachability`、F-01 `validateTrackContent`：以 role node/area、有限共享狀態、兩題組/step/holder/slot/latch/grade/wish 建 canonical signature，排除不影響合法轉移的重複歷史；遍歷全部 28 nodes、四 ending、正常/拒絕/逾時；維持 50k graph/16384 JSON guard，超限停止提出最小方案。 | SD-001-S358、SD-001-S658 | SD-001-I02、SD-001-I05 | 採內容／原稿／素材與發布責任，整合 A 編譯契約與原有 reader；不額外拆素材 SD。 |
| C／SD-002-S01 EnterStore | F-01 `Compile`／`Apply`／`Available`：本人 entry node、角色與 actor allowed binding 三者匹配才移本人 Track；回傳 transition 与 doorbell cue，對方 node/revision 不變。 | SD-002-S101 | SD-002-I01 | 採純領域規則的逐行為切分；既有 Application Projection 保持原層，權威交易另由 SD-003。 |
| C／SD-002-S02 NavigateAreas | F-01 `Available`／`Apply`：以本人 Area、pinned adjacency、phase/safe-zone 判合法移動，返回新 Area/shot 與本人可探索 hint；非法無狀態變更。 | SD-002-S102 | SD-002-I01 | 採純領域規則的逐行為切分；既有 Application Projection 保持原層，權威交易另由 SD-003。 |
| C／SD-002-S06 BlindBook | F-01 `Evaluate`／`Apply`：以 role+book ID 驗封條操作，合法一次揭封只更新 actor module fact；取消不進 policy，重送由 receipt 層去重；不輸出他人私密 fact。 | SD-002-S106 | SD-002-I01 | 採純領域規則的逐行為切分；既有 Application Projection 保持原層，權威交易另由 SD-003。 |
| C／SD-002-S08 Resonance | F-01 `Available`／`Apply`：已選 bookId 且 optionId 屬三原稿選項才寫本人 resonance fact，輸出本人的原文 cue，preview 不走 Apply。 | SD-002-S108 | SD-002-I01 | 採純領域規則的逐行為切分；既有 Application Projection 保持原層，權威交易另由 SD-003。 |
| C／SD-002-S09 VinylSync | F-01 `Apply`：只允許三個原稿 record ID，切換共享 currentTrack，實際變更才產出 stamp fact；不保存本地音量。 | SD-002-S209 | SD-002-I02 | 採純領域規則的逐行為切分；既有 Application Projection 保持原層，權威交易另由 SD-003。 |
| C／SD-002-S10 AmbientExplore | F-01 `Evaluate`／`Available`／`Apply`：ambient binding 依 area/phase/角色可用，僅寫本人 explored 或合法 shared fact，不改另一方 progress，不成導演 prerequisite。 | SD-002-S210 | SD-002-I02 | 採純領域規則的逐行為切分；既有 Application Projection 保持原層，權威交易另由 SD-003。 |
| C／SD-002-S11 FogWindow | F-01 `Apply`／`Available`：擦霧純 client，不更新 domain；合法四符號選擇取目前 symbol version +1，替換舊可見符號，已取得 witness fact 不撤銷。 | SD-002-S211 | SD-002-I02 | 採純領域規則的逐行為切分；既有 Application Projection 保持原層，權威交易另由 SD-003。 |
| C／SD-002-S13 SameDifferentBook | F-01 `Evaluate`／`Apply`：兩人已各提交選書才比較 canonical book ID，選 iv4-04-same/diff；單方未完成保持等待且不生成另一人選擇。 | SD-002-S313 | SD-002-I03 | 採純領域規則的逐行為切分；既有 Application Projection 保持原層，權威交易另由 SD-003。 |
| C／SD-002-S14 TissueDistance | F-01 `Available`／`Apply`：以當前合法近/遠 slot ID 驗 I 的 tissue action，記距離及 cue；A 的 accept/decline 為獨立 action，不等同 chat intent。 | SD-002-S314 | SD-002-I03 | 採純領域規則的逐行為切分；既有 Application Projection 保持原層，權威交易另由 SD-003。 |
| C／SD-002-S15 GiveSpaceReverse | F-01 `Evaluate`／`Apply`：I 留白轉 respect，保留 A 的聊書/音樂/安靜獨立 binding，A 選擇後才轉自己的節點；不代提交。 | SD-002-S315 | SD-002-I03 | 採純領域規則的逐行為切分；既有 Application Projection 保持原層，權威交易另由 SD-003。 |
| C／SD-002-S16 DeclineApproach | F-01 `Apply`／`Available`：依 pinned open-up/books-only/decline route 更新 A 與必要 shared 分支，拒絕不產 chat effect，quiet 仍可到導演。 | SD-002-S316 | SD-002-I03 | 採純領域規則的逐行為切分；既有 Application Projection 保持原層，權威交易另由 SD-003。 |
| C／SD-002-S17 QuestionCard | F-01 `Activate`／`Apply`／`Available`：warm 前置才由場次 deterministic seed 釘選四題之一；保存兩份 private option，第二次合法提交後才產 reveal 與雙 warm transition。 | SD-002-S317 | SD-002-I03 | 採純領域規則的逐行為切分；既有 Application Projection 保持原層，權威交易另由 SD-003。 |
| C／SD-002-S18 QuestionCardGuard | F-01 `Evaluate`／`Apply`：quiet 不需 question；驗 role、pinned question、option、revision，非法/重送不增加提交；同ID receipt 在 SD-003，禁止先揭。 | SD-002-S318 | SD-002-I03 | 採純領域規則的逐行為切分；既有 Application Projection 保持原層，權威交易另由 SD-003。 |
| C／SD-002-S20 ClerkPersona | F-01 `Evaluate`／`Available`：以 actor role、node、grade、warm/quiet 選原稿招呼/話題/四組 aftermath；NPC cue 不產真人 message。 | SD-002-S320 | SD-002-I03 | 採純領域規則的逐行為切分；既有 Application Projection 保持原層，權威交易另由 SD-003。 |
| C／SD-002-S21 DirectorTrigger | F-01 `Evaluate`／`Apply`／`Activate`：兩邊節奏條件 I warm/respect、A warm/quiet 且 warm 已 reveal，才輸出一次 director+ready effect；非主線彩蛋不參與 gate。 | SD-002-S421 | SD-002-I04 | 採純領域規則的逐行為切分；既有 Application Projection 保持原層，權威交易另由 SD-003。 |
| C／SD-002-S23 ReadyGate | F-01 `Apply`／`Activate`：ready role mask 只從0→1；首次 mask=雙人時以 authority time 建 deadline、pinned setId；重複 ready no-op，等待不扣時。 | SD-002-S423 | SD-002-I04 | 採純領域規則的逐行為切分；既有 Application Projection 保持原層，權威交易另由 SD-003。 |
| C／SD-002-S24 DurationConfig | F-01 `Compile`／`Initial`／`Activate`：使用 pinned durationSeconds、threshold 與原文設定而非常數，90/120 分版；validate 不允許缺設定；既有 running/paused 不重新讀新版本。 | SD-002-S424 | SD-002-I04 | 採純領域規則的逐行為切分；既有 Application Projection 保持原層，權威交易另由 SD-003。 |
| C／SD-002-S25 RescueSetPin | F-01 `Activate`／`Initial`：以場次固定 seed 從原兩個 setId 選一，保存 ID；每步按 pinned positionId 與 areaId，不要求四 Area；初始投影只授權角色。 | SD-002-S425 | SD-002-I04 | 採純領域規則的逐行為切分；既有 Application Projection 保持原層，權威交易另由 SD-003。 |
| C／SD-002-S26 RescueSteps | F-01 `Available`／`Apply`：step1/2 依 share→pick→pass→store 有限狀態；驗 actor/area/book/holder/slot/phase/revision，每次只一 transition，合法 store 才 count+1；無危險 Area 行為。 | SD-002-S526 | SD-002-I05 | 採純領域規則的逐行為切分；既有 Application Projection 保持原層，權威交易另由 SD-003。 |
| C／SD-002-S27 ReverseClues | F-01 `Apply`／`Available`：step3/4 I pickup/share reverse clue，A 底層/上層；第四本依 left/right/seal 的 latchIndex 0..3，seal 成立才 count+1；未分享 clue 不輸出。 | SD-002-S527 | SD-002-I05 | 採純領域規則的逐行為切分；既有 Application Projection 保持原層，權威交易另由 SD-003。 |
| C／SD-002-S28 WrongRescue | F-01 `Apply`：錯書、slot、role、area 不改 holder/count；錯鎖扣以合法錯序 action 重置 latchIndex=0 並原文 feedback，已放書及 rescuedCount 保留，不修改 deadline；可重試。 | SD-002-S528 | SD-002-I05 | 採純領域規則的逐行為切分；既有 Application Projection 保持原層，權威交易另由 SD-003。 |
| C／SD-002-S29 QuickCallouts | F-01 `Available`／`Apply`：按 role 白名單各6 callout ID，輸出 cue effect，不寫 message；禁止任意 text/他方 ID。 | SD-002-S529 | SD-002-I05 | 採純領域規則的逐行為切分；既有 Application Projection 保持原層，權威交易另由 SD-003。 |
| C／SD-002-S30 WaterStages | F-01 `Apply`（新增受控 system transition）：依 pinned thresholds、authority now 算最新 waterStage，遲到跨多階只輸出最新 cue，不重播；paused 固定 remaining。 | SD-002-S530 | SD-002-I05 | 採純領域規則的逐行為切分；既有 Application Projection 保持原層，權威交易另由 SD-003。 |
| C／SD-002-S31 PauseIdle | F-01 `Apply`（系統 transition）：I=min eligible role activity/disconnect+15000；I<D 且 now≥I 則 pausedRemainingMs=D-I；D≤I 且 now≥D 先結算；ping 不算 activity。 | SD-002-S431 | SD-002-I04 | 採純領域規則的逐行為切分；既有 Application Projection 保持原層，權威交易另由 SD-003。 |
| C／SD-002-S32 PauseReconnect | F-01 `Apply`：按 pauseRequiredRole mask 判 idle 真操作/斷線回可操作畫面，首恢復只更新 mask/activity；必要人全恢復時 deadline=authority now+remaining；不變 holder/slot/latch/count，無次數限制。 | SD-002-S432 | SD-002-I04 | 採純領域規則的逐行為切分；既有 Application Projection 保持原層，權威交易另由 SD-003。 |
| C／SD-002-S33 DeadlineRace | F-01 `Apply`：若 now≥deadline 先依 count A/B settle 拒計；now<deadline 且合法最後 seal 才 S；輸出互斥 effect 交 SD-003 原子 CAS，以真 D1 驗線性化時間。 | SD-002-S433 | SD-002-I04 | 採純領域規則的逐行為切分；既有 Application Projection 保持原層，權威交易另由 SD-003。 |
| C／SD-002-S34 GradeS | F-01 `Apply`：合法最後 seal 在 deadline 前 count=4 即 settle S，保存 remainingMs/grade/title fact，走書籤意願 gate，不等 timeout。 | SD-002-S534 | SD-002-I05 | 採純領域規則的逐行為切分；既有 Application Projection 保持原層，權威交易另由 SD-003。 |
| C／SD-002-S35 GradeA | F-01 `Apply`（system timeout）：到期 count∈{2,3} 只 settle A 一次，禁後續 rescue，輸出高處/拿鐵/毛巾 cue 與 bookmark phase。 | SD-002-S535 | SD-002-I05 | 採純領域規則的逐行為切分；既有 Application Projection 保持原層，權威交易另由 SD-003。 |
| C／SD-002-S36 GradeB | F-01 `Apply`（system timeout）：到期 count∈{0,1} settle B，直接 ev4-04 與安全區；禁 rescue、bookmark、wish 及危險區移動。 | SD-002-S536 | SD-002-I05 | 採純領域規則的逐行為切分；既有 Application Projection 保持原層，權威交易另由 SD-003。 |
| C／SD-002-S38 Bookmark | F-01 `Available`／`Apply`：S/A 且本人合法選書才允許三句選項及 0–20 scalar optional note；保存 private actor fact，只有合法 ending disclosure 才釋出。 | SD-002-S638 | SD-002-I06 | 採純領域規則的逐行為切分；既有 Application Projection 保持原層，權威交易另由 SD-003。 |
| C／SD-002-S39 BookmarkValidation | F-01 `Apply`：只 bookmark note 可為自由文字，逐 scalar 計數、拒孤立 surrogate/控制字元/HTML/非法書或他人身份；其他 params 仍固定 ID；錯誤不產 effect。 | SD-002-S639 | SD-002-I06 | 採純領域規則的逐行為切分；既有 Application Projection 保持原層，權威交易另由 SD-003。 |
| C／SD-002-S40 WishMatrix | F-01 `Apply`／`Evaluate`：兩人 bookmark 完成後各自保存 wish；兩份完成才選 ending：任一 quiet→03，兩 keep→01，其他 share→02；B bypass→04。 | SD-002-S640 | SD-002-I06 | 採純領域規則的逐行為切分；既有 Application Projection 保持原層，權威交易另由 SD-003。 |
| C／SD-002-S42 ReceiptTitle | F-01 `Apply`：結算時依 authority remaining >= pinned 30000 選 S_fast，其餘 S_normal，A/B 依 grade；輸出安全 fact ID，不含 note/free text。 | SD-002-S642 | SD-002-I06 | 採純領域規則的逐行為切分；既有 Application Projection 保持原層，權威交易另由 SD-003。 |
| C／SD-002-S44 ReceiptBadges | F-01 `Apply`／`Evaluate`：same book、實際切曲、合法 partner witness、quiet+S/A 四獨立 fact；按原稿成立才輸出 badge ID，集合去重，無個資。 | SD-002-S644 | SD-002-I06 | 採純領域規則的逐行為切分；既有 Application Projection 保持原層，權威交易另由 SD-003。 |
| C／SD-002-S45 NaturalCompletion | F-01 `Apply`／F-02 `PlaythroughLifecyclePolicy`（沿用已確認的 next consent guard）：ending 合法完成產 Session completed，Round active；單方 consent/撤回不建場，雙方成立才走既有選場。 | SD-002-S645 | SD-002-I06 | 採純領域規則的逐行為切分；既有 Application Projection 保持原層，權威交易另由 SD-003。 |
| C／SD-003-S01 EnterStore | F-01 `CommandAsync`／F-05 `planTrackAction`、`executeTrackAction`：驗本人 entry action，CAS 本人 progress/event；F-02 `Project` 回本人下一 node/shot，不推對方。 | SD-003-S301 | SD-003-I02 | 採現行 service/Worker/guard 與 actor-scoped 投影分工；每項須證明權威寫入或唯讀／重送護欄。 |
| C／SD-003-S02 NavigateAreas | F-01 `CommandAsync`／F-05 `planTrackAction`：驗 actor/Area adjacency/phase，CAS 合法 move；F-02 `Project` 只回合法地圖與 hints。 | SD-003-S302 | SD-003-I02 | 採現行 service/Worker/guard 與 actor-scoped 投影分工；每項須證明權威寫入或唯讀／重送護欄。 |
| C／SD-003-S06 BlindBook | F-01 `CommandAsync`／F-05 `executeTrackAction` 封條 fact CAS；F-02 `Project`、F-07 `readAuthorizedSceneEventContent` 依 actor reveal fact 裁切 title/text/asset，未解鎖不能經歷史/WS/R2 取得。 | SD-003-S306 | SD-003-I02 | 採現行 service/Worker/guard 與 actor-scoped 投影分工；每項須證明權威寫入或唯讀／重送護欄。 |
| C／SD-003-S07 InterestBadge | F-02 `Project`／F-07 `readAuthorizedSceneEventContent`：本人 identity 讀本人已儲存 interest，輸出推薦 badge ID；不回 tags 或他方 metadata，F-06 `assertFrameworkMember` 阻偽 owner。 | SD-003-S307、SD-003-S707 | SD-003-I02、SD-003-I06 | 採現行 service/Worker/guard 與 actor-scoped 投影分工；每項須證明權威寫入或唯讀／重送護欄。 |
| C／SD-003-S08 Resonance | F-01 `CommandAsync`／F-05 `executeTrackAction` 寫本人 book/option fact；F-02 `Project` 只投本人獨白，對方與 event replay 不含 private。 | SD-003-S308 | SD-003-I02 | 採現行 service/Worker/guard 與 actor-scoped 投影分工；每項須證明權威寫入或唯讀／重送護欄。 |
| C／SD-003-S09 VinylSync | F-05 `executeTrackAction` CAS shared music ID 與 change fact；F-02 `Project` 返回目前合法曲與 cue，F-01 notifier 僅 hint，不同本地播放偏好不持久化到 shared state。 | SD-003-S309 | SD-003-I02 | 採現行 service/Worker/guard 與 actor-scoped 投影分工；每項須證明權威寫入或唯讀／重送護欄。 |
| C／SD-003-S10 AmbientExplore | F-01 `CommandAsync`／F-05 `executeTrackAction` 限本人 ambient facts，必要 shared cue 單次；F-02 `Project` 按 Area 回原稿合法內容，不將探索作 gate。 | SD-003-S310 | SD-003-I02 | 採現行 service/Worker/guard 與 actor-scoped 投影分工；每項須證明權威寫入或唯讀／重送護欄。 |
| C／SD-003-S11 FogWindow | F-05 `executeTrackAction` CAS current symbol/version；F-02 `Project` 依當前 area、phase、符號生命週期裁切；preview 無 API，替換／導演清 visible symbol。 | SD-003-S311 | SD-003-I02 | 採現行 service/Worker/guard 與 actor-scoped 投影分工；每項須證明權威寫入或唯讀／重送護欄。 |
| C／SD-003-S12 FogWitness | F-01 `CommandAsync`／F-05 `planTrackAction`：驗 actor 非作者、目前 symbol version、window、foreground witness action 與 active session；CAS 見證 fact；GET 不寫見證，F-02 `Project` 不暴露未授權符號。 | SD-003-S312、SD-003-S712 | SD-003-I02、SD-003-I06 | 採現行 service/Worker/guard 與 actor-scoped 投影分工；每項須證明權威寫入或唯讀／重送護欄。 |
| C／SD-003-S13 SameDifferentBook | F-01 `CommandAsync`／F-05 `executeTrackAction`：第二份選書才在同批 guard 雙 progress 與 state，提交唯一 same/diff transition；F-02 `Project` 未完成前只投本人。 | SD-003-S313 | SD-003-I02 | 採現行 service/Worker/guard 與 actor-scoped 投影分工；每項須證明權威寫入或唯讀／重送護欄。 |
| C／SD-003-S14 TissueDistance | F-01 `CommandAsync`／F-04 `ReadAsync`：只收白名單 slot ID、角色與合法 action，F-05 `executeTrackAction` guard holder/area/revision，距離 cue 與接不接獨立，拒未授權位置。 | SD-003-S314 | SD-003-I02 | 採現行 service/Worker/guard 與 actor-scoped 投影分工；每項須證明權威寫入或唯讀／重送護欄。 |
| C／SD-003-S15 GiveSpaceReverse | F-01 `CommandAsync`／F-05 `executeTrackAction` 分角色 CAS 留白/主動/安靜，F-02 `Project` 只顯本人可用選項與退讓 cue。 | SD-003-S315 | SD-003-I02 | 採現行 service/Worker/guard 與 actor-scoped 投影分工；每項須證明權威寫入或唯讀／重送護欄。 |
| C／SD-003-S16 DeclineApproach | F-01 `CommandAsync`／F-05 `executeTrackAction`：保存合法 route，F-03 `CommandAsync` 不生成 message.send，F-02 `Project` 顯原文不偽造對方。 | SD-003-S316 | SD-003-I02 | 採現行 service/Worker/guard 與 actor-scoped 投影分工；每項須證明權威寫入或唯讀／重送護欄。 |
| C／SD-003-S17 QuestionCard | F-05 `executeTrackAction`：pinned question instance CAS、兩私密答案同批 reveal；F-02 `Project`、F-03 `EventsAsync`、F-07 授權內容按角色過濾，未揭曉資料不入公共 world。 | SD-003-S317 | SD-003-I02 | 採現行 service/Worker/guard 與 actor-scoped 投影分工；每項須證明權威寫入或唯讀／重送護欄。 |
| C／SD-003-S18 QuestionCardGuard | F-04 `ReadAsync`／F-01 `CommandAsync`／F-05 `executeTrackAction`：strict question/role/option/revision；同 requestId/payload 回原 receipt，改 payload 409；quiet 走既有非問答 route。 | SD-003-S318、SD-003-S618 | SD-003-I02、SD-003-I05 | 採現行 service/Worker/guard 與 actor-scoped 投影分工；每項須證明權威寫入或唯讀／重送護欄。 |
| C／SD-003-S19 ChatSuggestions | F-01 `Project`：替換靜態 suggestions 為依權威情境篩選的三原句；F-03 `CommandAsync` 聊天仍需真人 message.send，不把 suggestions/NPC 當事件發送。 | SD-003-S319 | SD-003-I02 | 採現行 service/Worker/guard 與 actor-scoped 投影分工；每項須證明權威寫入或唯讀／重送護欄。 |
| C／SD-003-S20 ClerkPersona | F-01 `Project`／F-02 `Project`：按角色、phase、grade×route 選 pinned NPC lines/actor cue，F-03 `EventsAsync` 不把 NPC 當真人 chat。 | SD-003-S320 | SD-003-I02 | 採現行 service/Worker/guard 與 actor-scoped 投影分工；每項須證明權威寫入或唯讀／重送護欄。 |
| C／SD-003-S21 DirectorTrigger | F-05 `planTrackAction`／`executeTrackAction`：同批 CAS 雙 progress/必要 instance/shared world；兩節奏條件成立才唯一 director+ready event，競爭敗方 rollback；F-01 notifier 發一次 hint。 | SD-003-S421、SD-003-S621 | SD-003-I03、SD-003-I05 | 採現行 service/Worker/guard 與 actor-scoped 投影分工；每項須證明權威寫入或唯讀／重送護欄。 |
| C／SD-003-S22 StormPresentation | F-02 `Project`、F-01 `ExperienceAsync`、F-03 `EventsAsync`：以 eventSeq/phase/current shot 投合法七步 cue，重連快照只還原 current world，歷史只回安全允許 event；不重播舊 cue。 | SD-003-S422 | SD-003-I03 | 採現行 service/Worker/guard 與 actor-scoped 投影分工；每項須證明權威寫入或唯讀／重送護欄。 |
| C／SD-003-S23 ReadyGate | F-05 `executeTrackAction`：同批 ready mask CAS，第二份提交原子建立 deadline/set/receipt，使用真 D1 交易時鐘；F-02 `Project` 單方等待、雙 ready 同一 authority deadline。 | SD-003-S423、SD-003-S623 | SD-003-I03、SD-003-I05 | 採現行 service/Worker/guard 與 actor-scoped 投影分工；每項須證明權威寫入或唯讀／重送護欄。 |
| C／SD-003-S24 DurationConfig | F-01 `Content`／`State` 讀 pinned 版本，F-05 `executeTrackActivation` 從 pinned config 取 duration/threshold；禁止用當前 index 替換舊 session，paused resume 不重設。 | SD-003-S624 | SD-003-I05 | 採現行 service/Worker/guard 與 actor-scoped 投影分工；每項須證明權威寫入或唯讀／重送護欄。 |
| C／SD-003-S25 RescueSetPin | F-05 `executeTrackActivation` pin setId 一次，F-01 `Content` 取原兩組 position；F-02 `Project` 只裁出目前 role/step 可分享線索，不傳完整答案。 | SD-003-S425、SD-003-S625 | SD-003-I03、SD-003-I05 | 採現行 service/Worker/guard 與 actor-scoped 投影分工；每項須證明權威寫入或唯讀／重送護欄。 |
| C／SD-003-S26 RescueSteps | F-05 `planTrackAction`／`executeTrackAction`：預期 phase/step/holder/slot/revision/actor/Area 與真時鐘同批檢查，update state、world、receipt；只有合法 store count+1，敗方無副作用。 | SD-003-S426 | SD-003-I03 | 採現行 service/Worker/guard 與 actor-scoped 投影分工；每項須證明權威寫入或唯讀／重送護欄。 |
| C／SD-003-S27 ReverseClues | F-05 `executeTrackAction`：reverse clue share、bottom/top slot、latch index 逐次 CAS；F-02 `Project` 未分享 clue 不下發，最後 seal 才 count+1。 | SD-003-S427 | SD-003-I03 | 採現行 service/Worker/guard 與 actor-scoped 投影分工；每項須證明權威寫入或唯讀／重送護欄。 |
| C／SD-003-S28 WrongRescue | F-05 `executeTrackAction` 錯扣只持久 latchIndex=0 與安全 feedback，count/holder/placed/deadline 原值；其他非法不提交；F-02 `Project` 還原權威。 | SD-003-S428 | SD-003-I03 | 採現行 service/Worker/guard 與 actor-scoped 投影分工；每項須證明權威寫入或唯讀／重送護欄。 |
| C／SD-003-S29 QuickCallouts | F-04 `ReadAsync`／F-05 `executeTrackAction` 只受控 callout ID、actor/phase guard，event payload 僅安全 cue；F-03 `CommandAsync` 不寫聊天。 | SD-003-S429 | SD-003-I03 | 採現行 service/Worker/guard 與 actor-scoped 投影分工；每項須證明權威寫入或唯讀／重送護欄。 |
| C／SD-003-S30 WaterStages | F-09 `GameRoomSocket.alarm`／F-08 private registry／F-05 system reconcile（提案）：按 D1 authority 更新最新 water stage，F-02 `Project` 給 serverNow/phase/deadline/seq；重連不補發過期 cue。 | SD-003-S430 | SD-003-I03 | 採現行 service/Worker/guard 與 actor-scoped 投影分工；每項須證明權威寫入或唯讀／重送護欄。 |
| C／SD-003-S31 PauseIdle | F-09 `GameRoomSocket.alarm`、F-05 system reconcile（提案）：以有效角色活動/連線門檻與 deadline 的先後作真交易 guard；晚到仍按應暫緩時間算 remaining；F-02 `Project` 暫緩提示。 | SD-003-S431 | SD-003-I03 | 採現行 service/Worker/guard 與 actor-scoped 投影分工；每項須證明權威寫入或唯讀／重送護欄。 |
| C／SD-003-S32 PauseReconnect | F-01 `CommandAsync`／F-05 `executeTrackAction`：驗必要 role 的 resume 意圖或已授權可操作回報，CAS pause mask；首操作不計，最後必要 role 恢復以 D1 now+remaining；F-02 保留 holder/slot/latch。 | SD-003-S432、SD-003-S532、SD-003-S632 | SD-003-I03、SD-003-I04、SD-003-I05 | 採現行 service/Worker/guard 與 actor-scoped 投影分工；每項須證明權威寫入或唯讀／重送護欄。 |
| C／SD-003-S33 DeadlineRace | F-05 `executeTrackAction`／新增受控 system reconcile：先真 D1 毫秒探針，再以同批 deadline/phase/active round/revision guard 仲裁最後 seal、timeout、退出；事件/receipt 同批，失敗 rollback。F-09 只喚醒。 | SD-003-S133、SD-003-S633 | SD-003-I03、SD-003-I05 | 採現行 service/Worker/guard 與 actor-scoped 投影分工；每項須證明權威寫入或唯讀／重送護欄。 |
| C／SD-003-S34 GradeS | F-05 `executeTrackAction`：最後合法 seal 與 S grade、剩餘毫秒、ending phase 同批；F-02 `Project` 取消救援投影、布丁/書籤；F-09 後續 alarm 讀 settled no-op。 | SD-003-S434 | SD-003-I03 | 採現行 service/Worker/guard 與 actor-scoped 投影分工；每項須證明權威寫入或唯讀／重送護欄。 |
| C／SD-003-S35 GradeA | F-05 system reconcile（提案）／F-09 `alarm`／F-01 `ExperienceAsync`：deadline 到期 2/3 本原子 settle A；F-02 `Project` 回安全高處與合法書籤，拒後續救書。 | SD-003-S435 | SD-003-I03 | 採現行 service/Worker/guard 與 actor-scoped 投影分工；每項須證明權威寫入或唯讀／重送護欄。 |
| C／SD-003-S36 GradeB | F-05 system reconcile（提案）：0/1 本到期 atomically settle B、ending/Session complete；F-02 `Project` 屋簷且去除危險 area/救援/wish/bookmark；F-06 不允許舊私有 action。 | SD-003-S436 | SD-003-I03 | 採現行 service/Worker/guard 與 actor-scoped 投影分工；每項須證明權威寫入或唯讀／重送護欄。 |
| C／SD-003-S37 AlarmRecovery | F-09 `GameRoomSocket.alarm`：nonce GC 與 deadline/idle 取 min，重啟讀 D1；F-08 private registry／F-05 reconcile 驗 active round/session/generation/phase/revision，NULL actor 固定 operation identity CAS，不靠 NULL UNIQUE；F-01 GET 補償僅時間狀態，503 保留 D1。 | SD-003-S137、SD-003-S237、SD-003-S537、SD-003-S637 | SD-003-I03、SD-003-I01、SD-003-I04、SD-003-I05 | 採現行 service/Worker/guard 與 actor-scoped 投影分工；每項須證明權威寫入或唯讀／重送護欄。 |
| C／SD-003-S38 Bookmark | F-04 `ReadAsync`／F-01 `CommandAsync`／F-05 `executeTrackAction`：驗選書及 bookmark note 專用 schema，私密 instance CAS；F-02 `Project`／F-07 `readAuthorizedSceneEventContent`／F-03 `EventsAsync` 僅合法公開後投 note。 | SD-003-S338、SD-003-S638 | SD-003-I02、SD-003-I05 | 採現行 service/Worker/guard 與 actor-scoped 投影分工；每項須證明權威寫入或唯讀／重送護欄。 |
| C／SD-003-S39 BookmarkValidation | F-04 `ReadAsync`／F-05 `planTrackAction` strict params，Domain 文本 guard 0..20 scalar，拒 21/HTML/control/surrogate/非法 ID；不寫資料、不放寬其他 action；HTTP/WS 同契約。 | SD-003-S339、SD-003-S639 | SD-003-I02、SD-003-I05 | 採現行 service/Worker/guard 與 actor-scoped 投影分工；每項須證明權威寫入或唯讀／重送護欄。 |
| C／SD-003-S40 WishMatrix | F-05 `executeTrackAction`：兩份 private wish 同 instance CAS，第二份在同批產唯一 ending；F-02 `Project`、F-03 `EventsAsync` 第一份不揭露，B 直接結局。 | SD-003-S340 | SD-003-I02 | 採現行 service/Worker/guard 與 actor-scoped 投影分工；每項須證明權威寫入或唯讀／重送護欄。 |
| C／SD-003-S41 EndingArt | F-02 `Project`／F-01 `ExperienceAsync`：只讀權威 completed ending shot、合法書籤與公開 cue，重連不退回，F-07 只給 authorized assets。 | SD-003-S341 | SD-003-I02 | 採現行 service/Worker/guard 與 actor-scoped 投影分工；每項須證明權威寫入或唯讀／重送護欄。 |
| C／SD-003-S42 ReceiptTitle | F-05 `executeTrackAction`/system reconcile 持久 authority grade/title facts，F-02 `Project` 由 facts 生成安全 receipt，禁 free text；S 門檻取 pinned config。 | SD-003-S342 | SD-003-I02 | 採現行 service/Worker/guard 與 actor-scoped 投影分工；每項須證明權威寫入或唯讀／重送護欄。 |
| C／SD-003-S43 ReceiptCollection | F-01 `Project`／F-02 `Project`：查目前 round/pair/pinned V4 version 已 completed Session distinct endingId（含本場），排除其他 round/version/未完成，0..4；不新建累計表。 | SD-003-S343、SD-003-S643 | SD-003-I02、SD-003-I05 | 採現行 service/Worker/guard 與 actor-scoped 投影分工；每項須證明權威寫入或唯讀／重送護欄。 |
| C／SD-003-S44 ReceiptBadges | F-02 `Project`：四 stamp ID 僅由已提交事實構成，集合去重，不讀 private Profile/note；F-05 witness/music fact 受 CAS，歷史回放亦裁切。 | SD-003-S344 | SD-003-I02 | 採現行 service/Worker/guard 與 actor-scoped 投影分工；每項須證明權威寫入或唯讀／重送護欄。 |
| C／SD-003-S45 NaturalCompletion | F-03 `ExperienceAsync`／`CommandAsync`：沿用 Round active/Session completed、chat、雙 consent/撤回，F-01 新場 content pin 並清舊投影；單方不新建。 | SD-003-S245、SD-003-S345、SD-003-S645 | SD-003-I01、SD-003-I02、SD-003-I05 | 採現行 service/Worker/guard 與 actor-scoped 投影分工；每項須證明權威寫入或唯讀／重送護欄。 |
| C／SD-003-S46 SafeExit | F-03 `EndAsync`／F-06 `assertFrameworkMember`／F-05 `executeTrackAction`、reconcile：退出與救書 CAS 互斥，原 claim/pair 排除一次，舊會話、ticket、事件/asset 立即拒；不依素材或倒數。 | SD-003-S246、SD-003-S446、SD-003-S646 | SD-003-I01、SD-003-I03、SD-003-I05 | 採現行 service/Worker/guard 與 actor-scoped 投影分工；每項須證明權威寫入或唯讀／重送護欄。 |
| C／SD-003-S47 StrictTransport | F-04 `ReadAsync`／F-03 `CommandAsync`／F-08 `parseCommand`／F-06 `assertFrameworkMember`／F-07 `readAuthorizedSceneEventContent`：HTTP/WS 同 payload guard/receipt/status，拒偽 role/time/result/private system/raw R2；F-02/EventsAsync 裁切歷史。 | SD-003-S247、SD-003-S347、SD-003-S747 | SD-003-I01、SD-003-I02、SD-003-I06 | 採現行 service/Worker/guard 與 actor-scoped 投影分工；每項須證明權威寫入或唯讀／重送護欄。 |
| C／SD-003-S48 AssetReadiness | F-01 `Content`／`ExperienceAsync`／F-07 `readAuthorizedSceneEventContent`：pin/SHA/required asset/ready avatar 缺失 fail closed，503 不改 state；保留 chat/end，合法重讀同 pin。 | SD-003-S248、SD-003-S348、SD-003-S748 | SD-003-I01、SD-003-I02、SD-003-I06 | 採現行 service/Worker/guard 與 actor-scoped 投影分工；每項須證明權威寫入或唯讀／重送護欄。 |
| C／SD-003-S49 AvatarReuse | F-03 `AvatarReady`／`ExperienceAsync`／F-02 `Project`：沿用已採用 ready static package，按角色及授權取資產，不呼 provider；失權拒後續 private asset。 | SD-003-S349 | SD-003-I02 | 採現行 service/Worker/guard 與 actor-scoped 投影分工；每項須證明權威寫入或唯讀／重送護欄。 |
| C／SD-003-S50 PlatformPerformance | F-01 `ExperienceAsync`／F-02 `Project`／F-07 授權讀取：有界投影與必要素材，不回全 raw content；以真環境測 latency/memory，不自行設定新門檻。 | SD-003-S250 | SD-003-I01 | 採現行 service/Worker/guard 與 actor-scoped 投影分工；每項須證明權威寫入或唯讀／重送護欄。 |
| C／SD-003-S51 GateA | 純整合驗證：F-01～F-09 已設計的實際產品入口逐項核對（同號前置成果），真 D1/R2/DO、HTTP/WS、平台及權利證據由 SD-005 Gate A；不再新增業務改動。 | SD-006-S151、SD-006-S251、SD-006-S651 | SD-006-I01、SD-006-I02、SD-006-I06 | 不重複建立 Gate A；服務與交易證據由 SD-003 提供，SD-006 唯一總驗。 |
| C／SD-003-S55 CleanReplay | 純清理後整合驗證：沿用 F-01 `ExperienceAsync`、F-03 `CommandAsync`／`EndAsync`、F-07 `readAuthorizedSceneEventContent`，核對 V4-only pin 及舊 SHA 拒絕，SD-006 清理後才可執行。 | SD-007-S155、SD-007-S255、SD-007-S455 | SD-007-I01、SD-007-I02、SD-007-I04 | 改為後段獨立 Gate B 後乾淨重玩；既有 runner 由 SD-006 建立，SD-007 唯一實測。 |
| C／SD-004-S01 EnterStore | 依候選該步實作／驗收內容；詳精確來源位置 | SD-004-S101 | SD-004-I01 | 採逐行為及現行 flat src 路徑，依前半/後半 UX 分項；跨包只讀契約。 |
| C／SD-004-S02 NavigateAreas | 依候選該步實作／驗收內容；詳精確來源位置 | SD-004-S102 | SD-004-I01 | 採逐行為及現行 flat src 路徑，依前半/後半 UX 分項；跨包只讀契約。 |
| C／SD-004-S03 DiscoverObjects | 依候選該步實作／驗收內容；詳精確來源位置 | SD-004-S103 | SD-004-I01 | 採逐行為及現行 flat src 路徑，依前半/後半 UX 分項；跨包只讀契約。 |
| C／SD-004-S04 GestureFence | 依候選該步實作／驗收內容；詳精確來源位置 | SD-004-S104 | SD-004-I01 | 採逐行為及現行 flat src 路徑，依前半/後半 UX 分項；跨包只讀契約。 |
| C／SD-004-S05 BookCatalog | 依候選該步實作／驗收內容；詳精確來源位置 | SD-004-S205 | SD-004-I02 | 採逐行為及現行 flat src 路徑，依前半/後半 UX 分項；跨包只讀契約。 |
| C／SD-004-S06 BlindBook | 依候選該步實作／驗收內容；詳精確來源位置 | SD-004-S206 | SD-004-I02 | 採逐行為及現行 flat src 路徑，依前半/後半 UX 分項；跨包只讀契約。 |
| C／SD-004-S07 InterestBadge | 依候選該步實作／驗收內容；詳精確來源位置 | SD-004-S207 | SD-004-I02 | 採逐行為及現行 flat src 路徑，依前半/後半 UX 分項；跨包只讀契約。 |
| C／SD-004-S08 Resonance | 依候選該步實作／驗收內容；詳精確來源位置 | SD-004-S208 | SD-004-I02 | 採逐行為及現行 flat src 路徑，依前半/後半 UX 分項；跨包只讀契約。 |
| C／SD-004-S09 VinylSync | 依候選該步實作／驗收內容；詳精確來源位置 | SD-004-S309 | SD-004-I03 | 採逐行為及現行 flat src 路徑，依前半/後半 UX 分項；跨包只讀契約。 |
| C／SD-004-S10 AmbientExplore | 依候選該步實作／驗收內容；詳精確來源位置 | SD-004-S310 | SD-004-I03 | 採逐行為及現行 flat src 路徑，依前半/後半 UX 分項；跨包只讀契約。 |
| C／SD-004-S11 FogWindow | 依候選該步實作／驗收內容；詳精確來源位置 | SD-004-S311 | SD-004-I03 | 採逐行為及現行 flat src 路徑，依前半/後半 UX 分項；跨包只讀契約。 |
| C／SD-004-S12 FogWitness | 依候選該步實作／驗收內容；詳精確來源位置 | SD-004-S312 | SD-004-I03 | 採逐行為及現行 flat src 路徑，依前半/後半 UX 分項；跨包只讀契約。 |
| C／SD-004-S13 SameDifferentBook | 依候選該步實作／驗收內容；詳精確來源位置 | SD-004-S413 | SD-004-I04 | 採逐行為及現行 flat src 路徑，依前半/後半 UX 分項；跨包只讀契約。 |
| C／SD-004-S14 TissueDistance | 依候選該步實作／驗收內容；詳精確來源位置 | SD-004-S414 | SD-004-I04 | 採逐行為及現行 flat src 路徑，依前半/後半 UX 分項；跨包只讀契約。 |
| C／SD-004-S15 GiveSpaceReverse | 依候選該步實作／驗收內容；詳精確來源位置 | SD-004-S415 | SD-004-I04 | 採逐行為及現行 flat src 路徑，依前半/後半 UX 分項；跨包只讀契約。 |
| C／SD-004-S16 DeclineApproach | 依候選該步實作／驗收內容；詳精確來源位置 | SD-004-S416 | SD-004-I04 | 採逐行為及現行 flat src 路徑，依前半/後半 UX 分項；跨包只讀契約。 |
| C／SD-004-S17 QuestionCard | 依候選該步實作／驗收內容；詳精確來源位置 | SD-004-S417 | SD-004-I04 | 採逐行為及現行 flat src 路徑，依前半/後半 UX 分項；跨包只讀契約。 |
| C／SD-004-S19 ChatSuggestions | 依候選該步實作／驗收內容；詳精確來源位置 | SD-004-S419 | SD-004-I04 | 採逐行為及現行 flat src 路徑，依前半/後半 UX 分項；跨包只讀契約。 |
| C／SD-004-S20 ClerkPersona | 依候選該步實作／驗收內容；詳精確來源位置 | SD-004-S320 | SD-004-I03 | 採逐行為及現行 flat src 路徑，依前半/後半 UX 分項；跨包只讀契約。 |
| C／SD-004-S22 StormPresentation | 依候選該步實作／驗收內容；詳精確來源位置 | SD-005-S122 | SD-005-I01 | 採逐行為及現行 flat src 路徑，依前半/後半 UX 分項；跨包只讀契約。 |
| C／SD-004-S23 ReadyGate | 依候選該步實作／驗收內容；詳精確來源位置 | SD-005-S223 | SD-005-I02 | 採逐行為及現行 flat src 路徑，依前半/後半 UX 分項；跨包只讀契約。 |
| C／SD-004-S26 RescueSteps | 依候選該步實作／驗收內容；詳精確來源位置 | SD-005-S226 | SD-005-I02 | 採逐行為及現行 flat src 路徑，依前半/後半 UX 分項；跨包只讀契約。 |
| C／SD-004-S27 ReverseClues | 依候選該步實作／驗收內容；詳精確來源位置 | SD-005-S227 | SD-005-I02 | 採逐行為及現行 flat src 路徑，依前半/後半 UX 分項；跨包只讀契約。 |
| C／SD-004-S28 WrongRescue | 依候選該步實作／驗收內容；詳精確來源位置 | SD-005-S228 | SD-005-I02 | 採逐行為及現行 flat src 路徑，依前半/後半 UX 分項；跨包只讀契約。 |
| C／SD-004-S29 QuickCallouts | 依候選該步實作／驗收內容；詳精確來源位置 | SD-005-S229 | SD-005-I02 | 採逐行為及現行 flat src 路徑，依前半/後半 UX 分項；跨包只讀契約。 |
| C／SD-004-S30 WaterStages | 依候選該步實作／驗收內容；詳精確來源位置 | SD-005-S230 | SD-005-I02 | 採逐行為及現行 flat src 路徑，依前半/後半 UX 分項；跨包只讀契約。 |
| C／SD-004-S31 PauseIdle | 依候選該步實作／驗收內容；詳精確來源位置 | SD-005-S231 | SD-005-I02 | 採逐行為及現行 flat src 路徑，依前半/後半 UX 分項；跨包只讀契約。 |
| C／SD-004-S32 PauseReconnect | 依候選該步實作／驗收內容；詳精確來源位置 | SD-005-S232 | SD-005-I02 | 採逐行為及現行 flat src 路徑，依前半/後半 UX 分項；跨包只讀契約。 |
| C／SD-004-S34 GradeS | 依候選該步實作／驗收內容；詳精確來源位置 | SD-005-S234 | SD-005-I02 | 採逐行為及現行 flat src 路徑，依前半/後半 UX 分項；跨包只讀契約。 |
| C／SD-004-S35 GradeA | 依候選該步實作／驗收內容；詳精確來源位置 | SD-005-S235 | SD-005-I02 | 採逐行為及現行 flat src 路徑，依前半/後半 UX 分項；跨包只讀契約。 |
| C／SD-004-S36 GradeB | 依候選該步實作／驗收內容；詳精確來源位置 | SD-005-S236 | SD-005-I02 | 採逐行為及現行 flat src 路徑，依前半/後半 UX 分項；跨包只讀契約。 |
| C／SD-004-S38 Bookmark | 依候選該步實作／驗收內容；詳精確來源位置 | SD-005-S338 | SD-005-I03 | 採逐行為及現行 flat src 路徑，依前半/後半 UX 分項；跨包只讀契約。 |
| C／SD-004-S40 WishMatrix | 依候選該步實作／驗收內容；詳精確來源位置 | SD-005-S340 | SD-005-I03 | 採逐行為及現行 flat src 路徑，依前半/後半 UX 分項；跨包只讀契約。 |
| C／SD-004-S41 EndingArt | 依候選該步實作／驗收內容；詳精確來源位置 | SD-005-S341 | SD-005-I03 | 採逐行為及現行 flat src 路徑，依前半/後半 UX 分項；跨包只讀契約。 |
| C／SD-004-S42 ReceiptTitle | 依候選該步實作／驗收內容；詳精確來源位置 | SD-005-S342 | SD-005-I03 | 採逐行為及現行 flat src 路徑，依前半/後半 UX 分項；跨包只讀契約。 |
| C／SD-004-S44 ReceiptBadges | 依候選該步實作／驗收內容；詳精確來源位置 | SD-005-S344 | SD-005-I03 | 採逐行為及現行 flat src 路徑，依前半/後半 UX 分項；跨包只讀契約。 |
| C／SD-004-S45 NaturalCompletion | 依候選該步實作／驗收內容；詳精確來源位置 | SD-005-S445 | SD-005-I04 | 採逐行為及現行 flat src 路徑，依前半/後半 UX 分項；跨包只讀契約。 |
| C／SD-004-S46 SafeExit | 依候選該步實作／驗收內容；詳精確來源位置 | SD-005-S446 | SD-005-I04 | 採逐行為及現行 flat src 路徑，依前半/後半 UX 分項；跨包只讀契約。 |
| C／SD-004-S48 AssetReadiness | 依候選該步實作／驗收內容；詳精確來源位置 | SD-005-S448 | SD-005-I04 | 採逐行為及現行 flat src 路徑，依前半/後半 UX 分項；跨包只讀契約。 |
| C／SD-004-S49 AvatarReuse | 依候選該步實作／驗收內容；詳精確來源位置 | SD-005-S449 | SD-005-I04 | 採逐行為及現行 flat src 路徑，依前半/後半 UX 分項；跨包只讀契約。 |
| C／SD-004-S50 PlatformPerformance | 依候選該步實作／驗收內容；詳精確來源位置 | SD-005-S450 | SD-005-I04 | 採逐行為及現行 flat src 路徑，依前半/後半 UX 分項；跨包只讀契約。 |
| C／SD-004-S55 CleanReplay | 依候選該步實作／驗收內容；詳精確來源位置 | SD-007-S455 | SD-007-I04 | 改為後段獨立 Gate B 後乾淨重玩；既有 runner 由 SD-006 建立，SD-007 唯一實測。 |
| C／SD-005-S01 EnterStore | 依候選該步實作／驗收內容；詳精確來源位置 | SD-006-S301、SD-006-S501 | SD-006-I03、SD-006-I05 | 採雙平台獨立真 E2E 的驗證責任，實際產品由其他分項唯一寫入，保留來源斷言。 |
| C／SD-005-S02 NavigateAreas | 依候選該步實作／驗收內容；詳精確來源位置 | SD-006-S302、SD-006-S502 | SD-006-I03、SD-006-I05 | 採雙平台獨立真 E2E 的驗證責任，實際產品由其他分項唯一寫入，保留來源斷言。 |
| C／SD-005-S03 DiscoverObjects | 依候選該步實作／驗收內容；詳精確來源位置 | SD-006-S303、SD-006-S503 | SD-006-I03、SD-006-I05 | 採雙平台獨立真 E2E 的驗證責任，實際產品由其他分項唯一寫入，保留來源斷言。 |
| C／SD-005-S04 GestureFence | 依候選該步實作／驗收內容；詳精確來源位置 | SD-006-S304、SD-006-S504 | SD-006-I03、SD-006-I05 | 採雙平台獨立真 E2E 的驗證責任，實際產品由其他分項唯一寫入，保留來源斷言。 |
| C／SD-005-S05 BookCatalog | 依候選該步實作／驗收內容；詳精確來源位置 | SD-006-S305、SD-006-S505 | SD-006-I03、SD-006-I05 | 採雙平台獨立真 E2E 的驗證責任，實際產品由其他分項唯一寫入，保留來源斷言。 |
| C／SD-005-S06 BlindBook | 依候選該步實作／驗收內容；詳精確來源位置 | SD-006-S306、SD-006-S506 | SD-006-I03、SD-006-I05 | 採雙平台獨立真 E2E 的驗證責任，實際產品由其他分項唯一寫入，保留來源斷言。 |
| C／SD-005-S07 InterestBadge | 依候選該步實作／驗收內容；詳精確來源位置 | SD-006-S307、SD-006-S507 | SD-006-I03、SD-006-I05 | 採雙平台獨立真 E2E 的驗證責任，實際產品由其他分項唯一寫入，保留來源斷言。 |
| C／SD-005-S08 Resonance | 依候選該步實作／驗收內容；詳精確來源位置 | SD-006-S308、SD-006-S508 | SD-006-I03、SD-006-I05 | 採雙平台獨立真 E2E 的驗證責任，實際產品由其他分項唯一寫入，保留來源斷言。 |
| C／SD-005-S09 VinylSync | 依候選該步實作／驗收內容；詳精確來源位置 | SD-006-S309、SD-006-S509 | SD-006-I03、SD-006-I05 | 採雙平台獨立真 E2E 的驗證責任，實際產品由其他分項唯一寫入，保留來源斷言。 |
| C／SD-005-S10 AmbientExplore | 依候選該步實作／驗收內容；詳精確來源位置 | SD-006-S310、SD-006-S510 | SD-006-I03、SD-006-I05 | 採雙平台獨立真 E2E 的驗證責任，實際產品由其他分項唯一寫入，保留來源斷言。 |
| C／SD-005-S11 FogWindow | 依候選該步實作／驗收內容；詳精確來源位置 | SD-006-S311、SD-006-S511 | SD-006-I03、SD-006-I05 | 採雙平台獨立真 E2E 的驗證責任，實際產品由其他分項唯一寫入，保留來源斷言。 |
| C／SD-005-S12 FogWitness | 依候選該步實作／驗收內容；詳精確來源位置 | SD-006-S312、SD-006-S512 | SD-006-I03、SD-006-I05 | 採雙平台獨立真 E2E 的驗證責任，實際產品由其他分項唯一寫入，保留來源斷言。 |
| C／SD-005-S13 SameDifferentBook | 依候選該步實作／驗收內容；詳精確來源位置 | SD-006-S313、SD-006-S513 | SD-006-I03、SD-006-I05 | 採雙平台獨立真 E2E 的驗證責任，實際產品由其他分項唯一寫入，保留來源斷言。 |
| C／SD-005-S14 TissueDistance | 依候選該步實作／驗收內容；詳精確來源位置 | SD-006-S314、SD-006-S514 | SD-006-I03、SD-006-I05 | 採雙平台獨立真 E2E 的驗證責任，實際產品由其他分項唯一寫入，保留來源斷言。 |
| C／SD-005-S15 GiveSpaceReverse | 依候選該步實作／驗收內容；詳精確來源位置 | SD-006-S315、SD-006-S515 | SD-006-I03、SD-006-I05 | 採雙平台獨立真 E2E 的驗證責任，實際產品由其他分項唯一寫入，保留來源斷言。 |
| C／SD-005-S16 DeclineApproach | 依候選該步實作／驗收內容；詳精確來源位置 | SD-006-S316、SD-006-S516 | SD-006-I03、SD-006-I05 | 採雙平台獨立真 E2E 的驗證責任，實際產品由其他分項唯一寫入，保留來源斷言。 |
| C／SD-005-S17 QuestionCard | 依候選該步實作／驗收內容；詳精確來源位置 | SD-006-S317、SD-006-S517 | SD-006-I03、SD-006-I05 | 採雙平台獨立真 E2E 的驗證責任，實際產品由其他分項唯一寫入，保留來源斷言。 |
| C／SD-005-S19 ChatSuggestions | 依候選該步實作／驗收內容；詳精確來源位置 | SD-006-S319、SD-006-S519 | SD-006-I03、SD-006-I05 | 採雙平台獨立真 E2E 的驗證責任，實際產品由其他分項唯一寫入，保留來源斷言。 |
| C／SD-005-S20 ClerkPersona | 依候選該步實作／驗收內容；詳精確來源位置 | SD-006-S320、SD-006-S520 | SD-006-I03、SD-006-I05 | 採雙平台獨立真 E2E 的驗證責任，實際產品由其他分項唯一寫入，保留來源斷言。 |
| C／SD-005-S22 StormPresentation | 依候選該步實作／驗收內容；詳精確來源位置 | SD-006-S422、SD-006-S522 | SD-006-I04、SD-006-I05 | 採雙平台獨立真 E2E 的驗證責任，實際產品由其他分項唯一寫入，保留來源斷言。 |
| C／SD-005-S23 ReadyGate | 依候選該步實作／驗收內容；詳精確來源位置 | SD-006-S423、SD-006-S523 | SD-006-I04、SD-006-I05 | 採雙平台獨立真 E2E 的驗證責任，實際產品由其他分項唯一寫入，保留來源斷言。 |
| C／SD-005-S26 RescueSteps | 依候選該步實作／驗收內容；詳精確來源位置 | SD-006-S426、SD-006-S526 | SD-006-I04、SD-006-I05 | 採雙平台獨立真 E2E 的驗證責任，實際產品由其他分項唯一寫入，保留來源斷言。 |
| C／SD-005-S27 ReverseClues | 依候選該步實作／驗收內容；詳精確來源位置 | SD-006-S427、SD-006-S527 | SD-006-I04、SD-006-I05 | 採雙平台獨立真 E2E 的驗證責任，實際產品由其他分項唯一寫入，保留來源斷言。 |
| C／SD-005-S28 WrongRescue | 依候選該步實作／驗收內容；詳精確來源位置 | SD-006-S428、SD-006-S528 | SD-006-I04、SD-006-I05 | 採雙平台獨立真 E2E 的驗證責任，實際產品由其他分項唯一寫入，保留來源斷言。 |
| C／SD-005-S29 QuickCallouts | 依候選該步實作／驗收內容；詳精確來源位置 | SD-006-S429、SD-006-S529 | SD-006-I04、SD-006-I05 | 採雙平台獨立真 E2E 的驗證責任，實際產品由其他分項唯一寫入，保留來源斷言。 |
| C／SD-005-S30 WaterStages | 依候選該步實作／驗收內容；詳精確來源位置 | SD-006-S430、SD-006-S530 | SD-006-I04、SD-006-I05 | 採雙平台獨立真 E2E 的驗證責任，實際產品由其他分項唯一寫入，保留來源斷言。 |
| C／SD-005-S31 PauseIdle | 依候選該步實作／驗收內容；詳精確來源位置 | SD-006-S431、SD-006-S531 | SD-006-I04、SD-006-I05 | 採雙平台獨立真 E2E 的驗證責任，實際產品由其他分項唯一寫入，保留來源斷言。 |
| C／SD-005-S32 PauseReconnect | 依候選該步實作／驗收內容；詳精確來源位置 | SD-006-S432、SD-006-S532 | SD-006-I04、SD-006-I05 | 採雙平台獨立真 E2E 的驗證責任，實際產品由其他分項唯一寫入，保留來源斷言。 |
| C／SD-005-S34 GradeS | 依候選該步實作／驗收內容；詳精確來源位置 | SD-006-S434、SD-006-S534 | SD-006-I04、SD-006-I05 | 採雙平台獨立真 E2E 的驗證責任，實際產品由其他分項唯一寫入，保留來源斷言。 |
| C／SD-005-S35 GradeA | 依候選該步實作／驗收內容；詳精確來源位置 | SD-006-S435、SD-006-S535 | SD-006-I04、SD-006-I05 | 採雙平台獨立真 E2E 的驗證責任，實際產品由其他分項唯一寫入，保留來源斷言。 |
| C／SD-005-S36 GradeB | 依候選該步實作／驗收內容；詳精確來源位置 | SD-006-S436、SD-006-S536 | SD-006-I04、SD-006-I05 | 採雙平台獨立真 E2E 的驗證責任，實際產品由其他分項唯一寫入，保留來源斷言。 |
| C／SD-005-S38 Bookmark | 依候選該步實作／驗收內容；詳精確來源位置 | SD-006-S438、SD-006-S538 | SD-006-I04、SD-006-I05 | 採雙平台獨立真 E2E 的驗證責任，實際產品由其他分項唯一寫入，保留來源斷言。 |
| C／SD-005-S40 WishMatrix | 依候選該步實作／驗收內容；詳精確來源位置 | SD-006-S440、SD-006-S540 | SD-006-I04、SD-006-I05 | 採雙平台獨立真 E2E 的驗證責任，實際產品由其他分項唯一寫入，保留來源斷言。 |
| C／SD-005-S41 EndingArt | 依候選該步實作／驗收內容；詳精確來源位置 | SD-006-S441、SD-006-S541 | SD-006-I04、SD-006-I05 | 採雙平台獨立真 E2E 的驗證責任，實際產品由其他分項唯一寫入，保留來源斷言。 |
| C／SD-005-S42 ReceiptTitle | 依候選該步實作／驗收內容；詳精確來源位置 | SD-006-S442、SD-006-S542 | SD-006-I04、SD-006-I05 | 採雙平台獨立真 E2E 的驗證責任，實際產品由其他分項唯一寫入，保留來源斷言。 |
| C／SD-005-S44 ReceiptBadges | 依候選該步實作／驗收內容；詳精確來源位置 | SD-006-S444、SD-006-S544 | SD-006-I04、SD-006-I05 | 採雙平台獨立真 E2E 的驗證責任，實際產品由其他分項唯一寫入，保留來源斷言。 |
| C／SD-005-S45 NaturalCompletion | 依候選該步實作／驗收內容；詳精確來源位置 | SD-006-S445、SD-006-S545 | SD-006-I04、SD-006-I05 | 採雙平台獨立真 E2E 的驗證責任，實際產品由其他分項唯一寫入，保留來源斷言。 |
| C／SD-005-S46 SafeExit | 依候選該步實作／驗收內容；詳精確來源位置 | SD-006-S446、SD-006-S546 | SD-006-I04、SD-006-I05 | 採雙平台獨立真 E2E 的驗證責任，實際產品由其他分項唯一寫入，保留來源斷言。 |
| C／SD-005-S48 AssetReadiness | 依候選該步實作／驗收內容；詳精確來源位置 | SD-006-S448、SD-006-S548 | SD-006-I04、SD-006-I05 | 採雙平台獨立真 E2E 的驗證責任，實際產品由其他分項唯一寫入，保留來源斷言。 |
| C／SD-005-S49 AvatarReuse | 依候選該步實作／驗收內容；詳精確來源位置 | SD-006-S449、SD-006-S549 | SD-006-I04、SD-006-I05 | 採雙平台獨立真 E2E 的驗證責任，實際產品由其他分項唯一寫入，保留來源斷言。 |
| C／SD-005-S50 PlatformPerformance | 依候選該步實作／驗收內容；詳精確來源位置 | SD-006-S250、SD-006-S450、SD-006-S550 | SD-006-I02、SD-006-I04、SD-006-I05 | 採雙平台獨立真 E2E 的驗證責任，實際產品由其他分項唯一寫入，保留來源斷言。 |
| C／SD-005-S51 GateA | 依候選該步實作／驗收內容；詳精確來源位置 | SD-006-S151、SD-006-S251、SD-006-S651 | SD-006-I01、SD-006-I02、SD-006-I06 | 採雙平台獨立真 E2E 的驗證責任，實際產品由其他分項唯一寫入，保留來源斷言。 |
| C／SD-005-S55 CleanReplay | 依候選該步實作／驗收內容；詳精確來源位置 | SD-007-S455 | SD-007-I04 | 改為後段獨立 Gate B 後乾淨重玩；既有 runner 由 SD-006 建立，SD-007 唯一實測。 |
| C／SD-006-S52 GateB | F-01/F-02（純人工 Gate，產品無寫入）：讀 Verification Gate A 與正式版本 SHA；僅明確本人實玩核准該 SHA 才允許後續 cleanup，拒絕或缺證據保留 V3 與所有資料。 | SD-007-S352 | SD-007-I03 | 採具名清理、本人 Gate B 與清理後驗收分界，不另開重複工作。 |
| C／SD-006-S53 CleanupScope | F-01 `validateSceneEventTarget`／`planSceneEventUpgrade`、F-02 `withPausedWrites`：先確認 default local、停寫、備份，列具名 V1/2/3 及 V4 測試 Round/Session/Invitation/claim/event/catalog/asset 引用；混合非驗收或未知引用拒絕，保護帳號/個資/化身/其他內容指紋。 | SD-007-S153、SD-007-S253 | SD-007-I01、SD-007-I02 | 採具名清理、本人 Gate B 與清理後驗收分界，不另開重複工作。 |
| C／SD-006-S54 CleanupAtomicity | F-01 `applySceneEventUpgrade`／F-02 `withPausedWrites`：按已核准精確 plan 與 FK 順序在 D1 原子清理，R2 僅無剩餘引用 SHA；中斷重讀 plan/狀態，補償、重試、保護指紋與無孤兒查核；不以 prefix 廣刪。 | SD-007-S154、SD-007-S254 | SD-007-I01、SD-007-I02 | 採具名清理、本人 Gate B 與清理後驗收分界，不另開重複工作。 |
| C／SD-006-S55 CleanReplay | F-01/F-02 清理成果沿用；純回歸由 SD-005-S55、SD-004-S55：正式索引僅 V4，舊 SHA 不可恢復，新配對完整流程，查保護指紋及無孤兒；不為通過而修改業務。 | SD-007-S155、SD-007-S255、SD-007-S455 | SD-007-I01、SD-007-I02、SD-007-I04 | 改為後段獨立 Gate B 後乾淨重玩；既有 runner 由 SD-006 建立，SD-007 唯一實測。 |
| C／SD-007-S01 全量深度稽核 | 依候選該步實作／驗收內容；詳精確來源位置 | SD-007-S551、SD-007-S552 | SD-007-I05 | 保留獨立深度稽核、條件式補漏重驗及權威文件交付。 |
| C／SD-007-S02 驗收文件同步及交付 | 依候選該步實作／驗收內容；詳精確來源位置 | SD-007-S553 | SD-007-I05 | 保留獨立深度稽核、條件式補漏重驗及權威文件交付。 |

## final 完整性與來源涵蓋

| 必要產物／來源集合 | final 位置 | 本輪查核與缺漏處理 | 狀態 |
|---|---|---|---|
| 總覽／系統設計／追溯矩陣／全部分項 | [00](00-overview.md)、[01](01-system-design.md)、[02](02-traceability.md)、plans/SD-001～007 | 固定範本章節、產品與測試責任、素材與順序已寫入獨立 final 包 | 已建立，完整設計稽核待完成 |
| 全部 SPEC／BDD／TDD | [02](02-traceability.md) | 來源 15/58/337 唯一 ID、層級、原文 Gherkin、前置與斷言、分項/步驟映射；16 補強案例保留 | 結構映射完整；產品語意、符號與可執行性仍須逐項確認 |
| 跨包來源／既有證據 | [02](02-traceability.md)、Verification | V4 0/337，既有 V3 回歸不代簽；Gate A 321、Gate B 1、後段15 | 產品未開發 |
| 候選到 final 步驟 | 本節 38＋180 列 | 全部原步驟都有 final 責任；補 11 個產品責任細步，Gate A 不重複建置 | 已完成結構對照 |
| 各 I 的全部必要步驟 | plans/、[02](02-traceability.md) | 細步與原群組整合共同負責原 I；先 S00 技術 probe，Gate B 後才清理；不以步驟增加分母 | D/I 尚未勾選，禁止開工 |

### 整合後有效實作決策補正（取代候選不精確部分）

| 對應決策 | 有效設計 | 現況依據與責任 |
|---|---|---|
| DEC-01／02／03 | 四層既有 builder/reader/publisher、版本化 v3 strict schema、原稿 scalar 不改；authoring whitelist 與正式索引須依實際版本、Gate A 分開 | SD001 F01–14；既有 scene-event-content/track-content、兩個 content/publish-policy、V3 policy、local wrapper。 |
| DEC-04／05 | 沿用三個 Application projection、既有 StoryMessagePolicy.Validate；只使用現存 interestTagIds，共同貼紙須雙公開且真交集，未對應作者標籤保留不臆造 | SD001/S002；現行 ProfileCatalog/ProfileFields/StoryPolicies。 |
| DEC-06／07 | SQL 同批前後 guard、system operationIdentity CAS；同 internal/round-command 增固定 room-system transport，外部拒絕 | SD003；現有 track commands、GameRoomSocket、Program.cs、router.ts。 |
| DEC-08～10 | 實際共用元件及唯一 mutation/cueFence，正式 geometry、foreground guard | SD004/S005；現行前端路徑與函式。 |
| DEC-11～14 | 真 runner 新 dispatch、T294 最終核驗、321/1/15 ID 分界；實際 FK、D1/R2 非同交易與精確補償 | SD006/S007；既有 scripts、0004–0007 migration。 |

## 人工確認、變更與交接

**具體 final 版本／核准快照**：0.2.0-draft，總覽記錄目前文件指紋；尚無人工核准。

**使用者明確確認、日期與可追溯依據**：上游 RQ/RA 均已確認；本 final 未獲針對精確版本核准。

**交接狀態**：Draft；不得進 carefully-done。完成全量設計稽核、明確修正未精確定案的符號、細步與來源條件、確認程式基準及文件完整性後，才可轉 Awaiting approval。

**待確認設計／阻斷／恢復條件**：逐檔實際產品符號、具體 Green 分支及命令、素材幾何與製作規格、完整原稿及 BDD/TDD 逐條可執行性、跨包唯一寫入與來源語意校對尚須稽核。不得把候選自評或全量 ID 映射當核准。真 D1 可行性測試屬後續開工前置，不在設計階段執行；現行 HEAD SHA 目前工具未回傳。無須使用者重答已確定 RQ/RA。

**歷史 final 的保存與取代位置**：首次建立 final 設計包，沒有舊核准版本；兩個候選完整保留。

**設計驗證**：來源 SHA、唯一 15/58/337 ID 與 337 筆 AC/BDD/層級比對、218 候選步驟結構對照；文件 diff/連結結果以總覽本次稽核為準。未執行產品測試。

## 相關文檔與生成資訊

- [總覽](00-overview.md)、[系統設計](01-system-design.md)、[全量追溯](02-traceability.md)。
- [ChatGPT 候選](../candidates/chatgpt-gpt-6.2/20261125-2221-01/00-overview.md)、[Antigravity 候選](../candidates/antigravity-model-unprovided/20261125-2312-01/00-overview.md)。
- 生成者：ChatGPT GPT-6.2／2026-11-26／0.2.0-draft。
