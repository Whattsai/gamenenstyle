# SPEC-001-SceneEventFramework — 實作前風險與缺漏稽核（RiskAudit）

**日期**：2026-11-16（新版 V2-RQ-01=A 已確認；2026-11-12～13 歷史風險稽核保留於下方）
**規劃狀態**：**Ready for well-done（Phase 5 規劃交接）**；V2-RQ-01=A 已由使用者確認，新版 12 項風險均有決策／測試落點、10 組 GAP 均已寫入 TDD。原 RA-Q1=A／RA-Q2=A 保留有效；未開始產品測試或人工 Gate B。
**來源**：[MVP-001](../requirements/MVP-001-LoveGameDatingApp.md) → [最新版 SDD](SPEC-001-SceneEventFramework.md) → [121 個 BDD](../bdd/SPEC-001-SceneEventFramework-BDD.md) → [625 項 TDD](../tdd/SPEC-001-SceneEventFramework-TDD.md)

## 2026-11-16 新版雙 Track／雨聲書店 RiskAudit 定案（Phase 4 結束）

**適用範圍**：MVP-001 AC-005-17～23、SDD §3.3～3.8.6／§4～§8、BDD-080～121、TDD Unit-237～366／Integration-081～129／API-028～053／E2E-041～077（舊 Phase 3 計畫外新增稽核測試見下文）。**本節是 2026-11-16 最新決策；下方 2026-11-12～13 的舊版 Ready／測試數字均為歷史快照，不取代本次 625 項規劃與 Gate B 規則。**

### 一、需求→SPEC→BDD→TDD 最新追溯

| MVP 業務需求 | SDD 與 SPEC | BDD | TDD 分層 |
|---|---|---|---|
| AC-005-17：雙方獨立進度、離線不跳戲 | §3.5／§4／SEF-AC-018 | 080～083 | UT-237～248、IT-081～084，API-028～031 |
| AC-005-18：多次交會、回單方／雙方、共同收尾 | §3.3／3.5／SEF-AC-019 | 084～089 | UT-249～266、IT-085～090，API-032～034 |
| AC-005-19：私人知識與共享世界一致 | §3.6／§6／SEF-AC-020 | 090～094 | UT-267～281、IT-091～095，API-035～039 |
| AC-005-20：Area／物件／NPC／角色演出 | §3.7／SEF-AC-021 | 095～099 | UT-282～296、IT-096～100，API-040～044 |
| AC-005-21：可見微動／必要 StoryMotion | §3.7／3.8.5／SEF-AC-022 | 100～103 | UT-297～308、IT-101～104，ET-041～044 |
| AC-005-22：完整雨聲書店與首條 Gate | §3.8.1～3.8.6／SEF-AC-023 | 104～117、121（RB-01～14） | UT-309～350／UT-360～362、IT-105～118／IT-122，API-045～049 中的對應案例、ET-045～072 |
| AC-005-23：安全地清舊表／程式／內容且不破壞既有資料 | §7.1／SEF-AC-024 | 118～120 | UT-351～359、IT-119～121 |

**統計基線**：SPEC **24/24** 有既有／新增 BDD；BDD 原 79＋新 42＝**121 個**。TDD 原 383＋雙軌 Phase 3 增量 222＋本次 RiskAudit 增量 20＝**625 項**（Unit 366、Integration 129、API 53、E2E 77）。既有完整覆核 **BDD 1/79、TDD 56/383**，新版 **BDD 0/42、TDD 0/242**，總體 **BDD 1/121、TDD 56/625**。此為規劃與既有證據統計，不能宣稱新引擎已實作。

### 二、全域一致性與技術風險（新增 12 項）

| ID | 等級 | 來源與實際風險 | 可執行的緩解／現有規劃證據 | 本輪處置 |
|---|---|---|---|---|
| **SEF-V2-RA-01** | 高 | §3.5／§4；只建立一筆 Progress 或以 shared currentNode 覆蓋另一人，會讓快慢不同的雙人直接跳過劇情 | 兩個 role 的 Progress 同 D1 batch 建立；每人 revision 獨立。BDD-080～084、UT-237～251、IT-081～085 | 已補回 SDD／BDD／TDD；IT-123/124 驗證真 D1 失敗時不殘留半場 |
| **SEF-V2-RA-02** | 高 | §6；S02 第一位真人提交後先 completed／第二人重送，會造成假合作、雙份物件或半套世界 | Shared EventInstance 保留獨立真人答案、event revision CAS、WorldState 同批提交 receipt；BDD-091～093、110～111、IT-092～094／111～112 | 已補回 SDD／BDD／TDD；IT-123～126 驗 CAS／合作事件真人提交 |
| **SEF-V2-RA-03** | 高 | §3.6／§4.3／§5；若完整雙 Track Manifest 由公開 R2 直接給 Client，對方私有書名或未解鎖 hidden binding 可被解析，不只畫面隱藏不足 | 只傳已授權的 caller view／hotspot，隱藏內容不發給 client；API/WS／R2 權限篩檢。BDD-090、094、RB-02／04 | 已補回 SDD／BDD／TDD；API-050/051 驗私有 R2／WS／experience 洩漏負例 |
| **SEF-V2-RA-04** | 高 | §3.3／§3.5；Shared→A only／雙方各自的解鎖與直接推進混用、必要依賴互等，造成死鎖或另一人被代玩 | role-aware DSL、不可達圖拒發、unlock 與 currentNode 兩種效果分離；BDD-085～089、112 | 已補回 SDD／BDD／TDD；UT-363/364 驗三次交會、可選循環與必經死鎖 |
| **SEF-V2-RA-05** | 高 | §4／§7.1；在未知環境刪掉舊表／R2，或只刪表卻留 Worker 查詢，會導致資料損壞或遊戲崩潰 | 只辨明 local DB／R2、保護帳號與角色、實際引用查核、全鏈 clean rebuild、Schema 不保留 Legacy；BDD-118～120 | 已補回 SDD／BDD／TDD；IT-127/128 驗未知環境拒清及 local 保護資料不變 |
| **SEF-V2-RA-06** | 高 | §3.7／§4.3；v2 含 move-area／manipulate-object／cooperative-action，但 Publisher 或 UI 仍只懂 v1 的 inspect／choice，玩家看到假熱區而無法操作 | 嚴格 v2 Schema／module registry／renderer／物件轉移，引用已發布素材，發布時 fail-closed；BDD-095～103、119 | 已補回 SDD／BDD／TDD；UT-365／API-052 驗 v2 Publisher 與 action/params 拒絕 |
| **SEF-V2-RA-07** | 高 | §3.8；雨聲書店 21 個 ID／台詞／Cue 與實際 R2 內容若部分缺漏，自動測試僅驗引擎可能錯誤宣稱首條完成 | 為 21 節點／三次交會、四 Area、必要物件及兩結局建立 manifest-to-SDD 對照；RB-01～14／BDD-104～117 | 已補回 SDD／BDD／TDD；UT-366／IT-129 驗 21 Node、Cue、SHA 與實際 R2 發布 |
| **SEF-V2-RA-08** | 中 | RB-08 舊稿將 A 專屬取回標籤描述成「兩人都可搶」，與角色授權不符 | **本輪已修正** SDD RB-08、BDD-111、UT-330～332／IT-112／API-047／ET-059～060；A 雙裝置並發、I 越權拒絕 | 已修正角色授權差異並補回 IT-125/126；真 D1 並發仍待 well-done |
| **SEF-V2-RA-09** | 中 | E01 舊文案「再逛一下」可能誤導玩家期待能繼續探索，與自然完成封存 Side 衝突 | **V2-RQ-01=A**：改選項為「再看一眼書架，替今天畫個句點」；純收尾鏡頭後立即 completed、Side 封存，無新互動／結束按鈕，Round 聊天保留 | **使用者 V2-RQ-01=A 已確認**；E01 短書架收尾後自然 completed，已回寫 SDD／BDD-113/114／ET-076/077 |
| **SEF-V2-RA-10** | 中 | §3.8.3／§3.8.5；NPC／系統的台詞若被當作對方真人訊息或未選過的玩家選項，會損害真實交友可信度 | 只以 NPC/旁白身分播台詞，真人意圖必須 actor 親提交或自由聊天；BDD-098、106、113～114 | 已補回 SDD／BDD／TDD；API-053／ET-073 驗 NPC/真人作者歸屬 |
| **SEF-V2-RA-11** | 中 | §3.7／§4.4；環境雨景、人物全身五表情與紙標籤動畫若效能差或動畫跳過便遺失線索，實際遊玩不完整 | Ambient／Story Motion 分離、關閉微動不損必要互動、Web/Android 真 jank／資產量測；BDD-100～103、116 | 已補回 SDD／BDD／TDD；ET-074/075 驗 Web/Android 環境微動與背景恢復 |
| **SEF-V2-RA-12** | 中 | §7／Gate B；僅通過 625 項的部分程式測試仍可能劇情難懂、交會不自然，甚至未完成便製作另外九條 | 21 節點與 RB-01～14 驗證、獨立真人雙端試玩、使用者人工確認；未簽核不得做其餘九條 | 已補回 SDD／BDD／TDD；ET-076/077 保留使用者人工 Gate B 不代簽 |

### 三、稽核辨識的 10 項缺漏已正式補入 TDD（各兩項，共 20 項）

以下是**Phase 4 已完成正式補強的 10 組 GAP**：每組兩項獨立的 Unit／Integration／API／E2E 測試，總新增 **20** 項，已包含在 TDD **625** 項，不重複算 Phase 3 的 222 項。此處的「已補入」只指規劃文件，**全部尚未開始產品測試**。

| 缺漏 ID | 對應 BDD／來源 | 正式補強測試與斷言 | 風險／處置 |
|---|---|---|---|
| SEF-V2-GAP-01 | BDD-080、092、110 | IT-123/124：Shared 第一人提交與第二人失敗 rollback，不提前 completed | RA-01／02（已補回文件，待 well-done 驗證） |
| SEF-V2-GAP-02 | BDD-091、111 | IT-125/126：A 雙裝置 stale revision 單一成功；I 越權拒絕 | RA-02／08（已補回文件，待 well-done 驗證） |
| SEF-V2-GAP-03 | BDD-090、094、105 | API-050/051：experience／WS／公開 R2 不外洩對方私有線索 | RA-03（已補回文件，待 well-done 驗證） |
| SEF-V2-GAP-04 | BDD-087、088、089 | UT-363/364：多次交會合法圖可達、必要互等死鎖拒發 | RA-04（已補回文件，待 well-done 驗證） |
| SEF-V2-GAP-05 | BDD-095～099、103 | UT-365／API-052：未知 Area/object/slot/action/params／版本拒絕且無 receipt | RA-06（已補回文件，待 well-done 驗證） |
| SEF-V2-GAP-06 | BDD-118～120 | IT-127/128：remote/未知環境拒清、local 重建仍保護帳號／角色 | RA-05（已補回文件，待 well-done 驗證） |
| SEF-V2-GAP-07 | BDD-104～117 | UT-366／IT-129：21 Node、四 Area、兩 Ending、Cue 和 R2 SHA 完整 | RA-07（已補回文件，待 well-done 驗證） |
| SEF-V2-GAP-08 | BDD-098、113～114 | API-053／ET-073：NPC／旁白不冒充真人訊息或提交 | RA-10（已補回文件，待 well-done 驗證） |
| SEF-V2-GAP-09 | BDD-100～103、116 | ET-074/075：Ambient 關閉不影響 StoryMotion，背景重連不重播 | RA-11（已補回文件，待 well-done 驗證） |
| SEF-V2-GAP-10 | BDD-113～114、117、121 | ET-076/077：**V2-RQ-01=A** 的 E01/E02 收尾、Side、聊天及人工 Gate 硬限制 | RA-09／12（已補回文件，待 well-done 驗證） |

### 四、V2-RQ-01 最終業務決策（使用者確認 A）

**V2-RQ-01=A（2026-11-16 已明確確認）**：兩人若都選 `look_back`，介面文字固定「再看一眼書架，替今天畫個句點」，E01 僅以暖光／雙人回望書架短演出作結，**自然完成本次 Chapter，未完成 Side 同交易封存，不提供額外探索、物件熱區、延伸劇情或結束按鈕**；Round 保持 active，仍可聊天。任一方選 `rest_chat` 則 E02，同樣自然完成，不能代替真人作答。這符合原 `SEF-RQ-02=A`，沒有新增尾聲模式／計時器／資料表。

**回寫落點**：SDD §3.8.3/3.8.4/3.8.5/3.8.6、BDD-113/114、其 Phase 3 TDD Unit-336～341／Integration-114～115／E2E-063～066，以及 Phase 4 ET-076/077 的 Ending 行為。純演出時間和素材完成度仍屬未來人工 Gate B 驗證，不預先宣稱已完成。

### 五、Phase 4 定案及 Phase 5 交接判定

**新增風險 12 項（高 7、中 5）均已在上表確定處置**。RA-09 由使用者直接選 A；其餘依先前同意之 SDD 保留具體技術防護，不新增未授權業務規則；RA-08 的 A 專屬取回標籤角色衝突已修復。**SEF-V2-GAP-01～10 共 10 組、20 項新測試**均已補回 TDD，原 12 項 SEF-RA、8 項 SEF-UX-RA 及歷史確認決策仍適用。

**交接狀態：Ready for well-done（規劃層）**，無待使用者確認的風險規則或缺漏。Well-Done 可按 TDD Phase 5 Gate 1／2 開始測試先行、實作與回歸；**本次沒有執行任何產品程式碼、資料清除、Web／Android 測試或人工 Gate B 驗收**。第一條使用者實玩核准前不可製作其餘九條。

---

## 一、需求追溯與執行事實

| MVP 需求 | SDD | BDD 測試覆蓋重點 | TDD 層級 |
|---|---|---|---|
| AC-005-04 | SEF-AC-001 | SEF-BDD-001～007、053～054；類別候選 0/1/2/3+、原邀請方決勝、雙票與隱私 | Unit、真 D1、API、E2E |
| AC-005-05 | SEF-AC-002 | SEF-BDD-008～010；Scene↔Category 多對多與無效關聯 | Unit、真 D1 |
| AC-005-06、12 | SEF-AC-003 | SEF-BDD-011～018；3:1、同一 pair、新 pair、有序／無序及全玩過退路 | Unit、真 D1 |
| AC-005-07 | SEF-AC-004 | SEF-BDD-019～022；線性唯一 Ending、分支合流、兩結局、不能發布死循環 | Unit、發布驗證、E2E |
| AC-005-08 | SEF-AC-005 | SEF-BDD-023～027、055；三事件來源、跨主線角色、隱藏隨機、相容性、Renderer | Unit、R2、D1、UI |
| AC-005-09 | SEF-AC-006 | SEF-BDD-028～033、056；playthrough／round 重複、前置條件、並發冪等、真人雙邊互動 | Unit、真 D1、API、UI |
| AC-005-10 | SEF-AC-007 | SEF-BDD-034～037、057、063；自然完成、封存支線、聊天保留、安全退出 | Unit、D1、Web／Android |
| AC-005-11 | SEF-AC-008 | SEF-BDD-038～042、058～059；雙方同意、撤回、過期場次、重複點擊 | Unit、真 D1、API、E2E |
| AC-005-13 | SEF-AC-009～010 | SEF-BDD-043～048、060～061；授權、序號、斷線補漏、R2 版本、缺檔、發布 | Unit、真 D1、API、E2E |
| AC-005-14 | SEF-AC-011 | SEF-BDD-049～050、062；首條雨聲書店人工 Gate／最終十條內容驗收 | Unit、D1、Web／Android |
| AC-005-15 | SEF-AC-012 | SEF-BDD-051～052；MVP-001 不造 AI 主線、劇情模式只一個場景 | Unit、真 D1 |

**最新追溯統計（2026-11-13）**：已確認 MVP AC-005-04～15（12/12）→ **SPEC AC 16/16** → **BDD 78/78** 均有規劃測試對應；TDD **379 項**（Unit 235、Integration 79、API 26、E2E 39），原 8 組 GAP 加上跨 SPEC 8 組 UX GAP 均已補入。舊 12 項風險如 §二～五保留，新增 8 項影響風險見 §六。全部僅為文件規劃，**0 項產品測試實際通過**。

## 二、架構及資料風險（按嚴重度）

| 風險 ID | 嚴重度 | 來源與具體問題 | 影響與建議 |
|---|---|---|---|
| SEF-RA-01 | **高** | SDD §3.1～3.2、§4.2：同一 Scene 適用多類別，但主線不一定都符合所選類別 | **RA-Q1=A 已確認**：Narrative Manifest 以 `eligibleCategoryCodes`（允許多個）聲明適用性，Publisher／Runtime 雙重排除不符類別；BDD-064/066、GAP-01 已補強 |
| SEF-RA-02 | **高** | SDD §3.1、§3.4：多場次間兩人興趣可能修改 | **RA-Q2=A 已確認**：雙方再次同意齊備時，取最新已儲存興趣並於同一 D1 提交凍結新場候選；舊場不回溯。BDD-065、GAP-02 已補強 |
| SEF-RA-03 | **高** | SDD §4.2、既有 `0005_story_dialogue_exit.sql`：舊 `story_offer_catalog_ids_json` 內是 Story Catalog ID，新契約是 Category ID | 型別同為 JSON ID，最容易出現「合法 UUID 卻被誤當正確業務類型」。在新向前 migration／受控非正式資料重建時明確轉成新的 category 欄及固定 command；原欄不可靜默沿用舊語意，真 D1 rollback／FK／CHECK 必驗 |
| SEF-RA-04 | **高** | SDD §6.1～6.3：D1 batch 與外部 R2 讀取不可能同一交易包覆 | 已抽場景後 R2 失效，若重跑隨機會讓兩人看到不同劇情。推薦先驗證全部 immutable 內容／hash，再以 D1 一次提交選擇快照及 receipt；結果不明先查既有決議，**絕不重新抽選** |
| SEF-RA-05 | **高** | SDD §3.4、§6.5：兩人幾乎同時同意下一場，或先同意後撤回與結算撞在一起 | 同一 Round 可能重複建立 Episode 或單方被認定兩票；保留按 `completedEpisodeSeq` 限定的最後有效同意、事件唯一性、版本檢查，並用真 D1 競態／故障注入驗證 |
| SEF-RA-06 | **高** | SDD §3.3、§4.3：Global EventPool、Narrative、Scene 與 EventDefinition 分開於 R2，現有 catalog 未直接存全域事件目錄 | 更新共用池可能改到進行中的事件條件；必須釘選 **每一層的版本、SHA、Binding 完整鍵及依賴快照**，不只釘 Narrative ID；禁止 runtime 讀取最新版全域池代替已釘選版本 |
| SEF-RA-07 | **高** | SDD §3.4、§4.2：`game_event_instances` 與既有 `game_interaction_instances` 兩層狀態並存 | 同一互動可能一張表 completed、另一張仍 active，導致雙方結果不同。需在同一 D1 原子交易更新與相互驗證；同時結束主線時取消未完成事件／互動，禁止舊指令重啟 |
| SEF-RA-08 | **中** | SDD §1.1、§5、既有 StoryDialogueAndExit BDD/TDD：原直接投 StoryCatalog，第 1 場 `episodeSeq=1` 固定，現改投 Category、啟用第二場 | 即使新 SPEC 測試通過，舊 UI／API／Worker 或測試可能仍發 StoryCatalog 票。實作時須同步更新既有契約及原 SPEC 回歸案例；不把舊 BDD 勾選當作新流程驗收 |
| SEF-RA-09 | **中** | SDD §3.2：3:1 是抽中機率權重不是保證每三次就抽中一次 | 少量試玩可能連續抽到舊場景；保留固定 seed 的權重單元測試與大樣本容差檢驗，UI 不允許無限制反覆重抽；此風險已由原 SEF-RQ-01=A 接受，**不重新詢問** |
| SEF-RA-10 | **中** | SDD §3.4：收尾即封存支線，但雙人合作互動可能只完成其中一人答案 | 完成時對方可能看到「等待另一位」卻永遠無結果。應以原子取消與明確 UI 通知呈現「本次劇情已結束，未完成互動已停止」，而不是代答或阻止自然收尾；原 SEF-RQ-02=A 已確定 |
| SEF-RA-11 | **中** | SDD §7：第一條既有雨聲書店已有部分本地技術測試，另有全身角色／B1／場景 UX 尚未結案 | 第一條新框架可操作不等於人工 Gate 通過；TDD 與原 StoryDialogueAndExit 的 Gate B 分開保留，使用者明確確認才量產其餘九條 |
| SEF-RA-12 | **低** | SDD §3.3：Event DSL、重複群組、場景能力多維度 | 未來內容大量增加後可能使發布驗證昂貴；要求發布時預編譯與規則上限、單次候選有界、觀察真場景開銷；不在 MVP-001 提前實作內容後台 |

## 三、已補入 TDD 的八組實作前缺漏（使用者確認後補強）

| GAP ID | 涉及風險與原始 BDD | 已補回 TDD 測試（皆未執行） | 實作要求 |
|---|---|---|---|
| SEF-GAP-01 | RA-01、BDD-008/009/016/064/066 | **SEF-UT-199、SEF-IT-065**；新增場景 UT-190～192、UT-196～198、IT-062/064 | 主線可適用多類別，但選定懸疑絕不能抽到純浪漫；Publisher／Runtime 雙重檢查 |
| SEF-GAP-02 | RA-02、BDD-003/038/065 | **SEF-IT-066、SEF-API-022**；新增場景 UT-193～195、IT-063 | 新場次開始時讀取最新已儲存的雙方興趣並固定候選，不改動舊場 |
| SEF-GAP-03 | RA-03、BDD-002/010 | **SEF-IT-067** | 既有 Story ID 不可被誤認為 Category ID，僅在已核准非正式環境清理測資 |
| SEF-GAP-04 | RA-04/06、BDD-045～048 | **SEF-IT-068** | R2 Scene/Narrative/GlobalPool/EventDefinition 的版本／SHA 都需固定，重試不重抽 |
| SEF-GAP-05 | RA-07/10、BDD-034～037/056～057 | **SEF-IT-069、SEF-ET-025** | 主線結束時原子封存所有未完成事件／雙人互動，兩端顯示已停止 |
| SEF-GAP-06 | RA-05、BDD-038～042 | **SEF-IT-070** | 同意、撤回、第二同意競態僅有一個權威結果 |
| SEF-GAP-07 | RA-08、BDD-001～007/053～054 | **SEF-API-023、SEF-ET-026** | 拒絕舊 StoryCatalog 投票格式，端點與 UI 改為 Category，原 StoryDialogueAndExit 回歸不可跳過 |
| SEF-GAP-08 | RA-09/11、BDD-011/014/049～050/062 | **SEF-IT-071、SEF-ET-027** | 3:1 可重現；首條人工 Gate 未通過不得量產或把 fixtures 當正式主線 |

**補強完成度**：**8/8 組已補入 TDD**；另外針對 RA-Q1=A／RA-Q2=A 新增 BDD-064～066 及其衍生單元／真 D1 測試。全新測試仍是待開發檢查項，不能說成執行通過。

## 四、已確認的使用者風險決策（2026-11-12）

| 決策 | 使用者最終選擇 | 對外可感知的行為 | 落實與追溯 |
|---|---|---|---|
| **RA-Q1=A** | 場景與主線都必須符合玩家選定的類別 | 玩家選「懸疑」不會抽到僅適用「浪漫」的主線，同一主線仍可同時屬兩類別 | MVP AC-005-04/06；SDD §3.1、§3.2、§4.2～4.3、§6；BDD-064/066；GAP-01 |
| **RA-Q2=A** | 下一場開始時，以兩位玩家**最新已儲存**的興趣重新推薦；新候選凍結後不再變 | 先改興趣再雙方同意，會影響**下一場**的推薦；已開始或已完成的劇情不受影響 | MVP AC-005-11；SDD §3.1、§3.4、§6；BDD-065；GAP-02 |

兩項皆已由使用者明確確認，不再列為待答事項。由於最後一位同意成功完成時才凍結下一場候選，Profile 更新與凍結先後依同一 D1 受控提交順序判定；任何 Client 重試／重新連線只能恢復同一份已決議候選，不得自行重新排名。

## 五、十二項風險最終處置與 Perfect Plan Phase 5 交接

| 風險 | 最終狀態（**文件規劃完成，非程式已修復**） | 已寫回的防護位置 |
|---|---|---|
| SEF-RA-01 | **使用者確認 A、已補回文件** | MVP AC-005-04/06、SDD §3.1/3.2/4.3、BDD-064/066、TDD GAP-01 |
| SEF-RA-02 | **使用者確認 A、已補回文件** | MVP AC-005-11、SDD §3.1/6、BDD-065、TDD GAP-02 |
| SEF-RA-03 | **已補回文件** | SDD §4.2/7、TDD GAP-03／IT-067；真 D1 向前 migration 及測資清理守則 |
| SEF-RA-04 | **已補回文件** | SDD §4.3/6、TDD GAP-04／IT-068；R2 故障與原子選擇快照 |
| SEF-RA-05 | **已補回文件** | SDD §3.4/6、TDD GAP-06／IT-070；同意與撤回競態 |
| SEF-RA-06 | **已補回文件** | SDD §4.3/6、TDD GAP-04／IT-068；完整依賴版本釘選 |
| SEF-RA-07 | **已補回文件** | SDD §3.4/4.2/6、TDD GAP-05／IT-069、ET-025 |
| SEF-RA-08 | **已補回文件** | SDD §1.1/5/7、TDD GAP-07／API-023、ET-026；原 SPEC 回歸 |
| SEF-RA-09 | **使用者已接受 3:1 權重、已補回文件** | SDD SEF-RQ-01=A、BDD-011/014、TDD GAP-08 |
| SEF-RA-10 | **使用者已接受收尾即封存、已補回文件** | SDD SEF-RQ-02=A、BDD-035～037、TDD GAP-05 |
| SEF-RA-11 | **使用者已確認首條人工 Gate、已補回文件** | MVP AC-005-14、SDD §7、BDD-049/050/062、TDD GAP-08 |
| SEF-RA-12 | **已補回文件** | SDD §3.3/4.3、既有 BDD-026/027/032/048、TDD 事件條件／內容發布測試；Publisher 必須有界限 |

**稽核結論**：12/12 風險均具規劃層處置與追溯、8/8 組 GAP 均已補入 TDD、使用者待決策 **0 項**。**Ready for well-done（僅規劃交接）**，可以開始交由開發流程實作**首條雨聲書店的新事件框架**，但不得略過真 D1／R2／Web／Android 回歸與內容發布驗證。

**首條人工驗收是後續內容擴充的硬關卡，不是規劃交接阻斷**：先完成一條完整主線、新架構真雙人試玩，取得使用者親自驗證、調校、明確核准，才可開發其餘九條；不替原 StoryDialogueAndExit Gate B／B1 全身化身勾選通過。MVP-002 沉浸模式 AI 動態主線、History／Housekeeping 均不得偷渡本次實作。

**本輪技術證據限規劃**：2026-11-12 原 12 風險／8 GAP 保留，2026-11-13 另補八項人物／舞台影響風險及八組 UX GAP，BDD **0/78**、TDD **0/379**。沒有執行產品測試或 migration。交接資訊及分層統計見 [TDD 規劃交接](../tdd/SPEC-001-SceneEventFramework-TDD.md#規劃交接紀錄)。

## 六、2026-11-13 最新人物／遊戲體驗影響稽核（跨 SPEC，增補 8 項）

本節是原先 §二～五已確認 12 項風險、8 組 GAP **以外**的技術整合補強。其依據為當前 `StoryDialogueAndExit`、`AvatarAndPreferences` SPEC、2026-11-13 Verification，以及實作中的 `StoryStage`、`StoryPortrait`、`ADVStage`、`StoryExperienceScreen`、`story-avatar`、`story-stage-geometry` 與 `contracts/story-scenes.json`。這些護欄完全沿用既定人物與玩法，**沒有重新詢問或推翻已確認 Q1～Q7、SEF-RQ-01～03、RA-Q1／Q2**。

| 新風險 ID | 程度 | 具體衝突與使用者可能看到的問題 | 決定的防護與文件落點 |
|---|---|---|---|
| **SEF-UX-RA-01** | **高** | 拆成 Scene／Narrative 後，鏡位、桌面透明前景及書籤熱區若各有一套座標，人物可能看似站在桌上或熱區錯位 | **已補回文件**：SDD §4.4 Scene 擁有完整 `2.5d.v1`，Node/Event 只引用已存在 ID；BDD-067/069、GAP-01、TDD UT-200～202/206～208、IT-072/074、ET-028/030 |
| **SEF-UX-RA-02** | **高** | 自由事件完成但未控制鏡頭／表情，或效果殘留到主線下一節，造成演出與劇情進度不符 | **已補回文件**：EventBinding 可選安全 `presentationEffects`，已提交結果才演出、完成清覆寫、不直接改 Node；BDD-068、GAP-02、UT-203～205、IT-073、ET-029 |
| **SEF-UX-RA-03** | **高** | 靜態 Scene 熱區無視隱藏事件條件，可能提前洩漏探索入口；點一下即寫入選擇 | **已補回文件**：安全事件資格投影控制熱區可見與可用，檢視與提交分開；BDD-070、GAP-03、UT-209～211、IT-075、API-024、ET-031 |
| **SEF-UX-RA-04** | **高** | 事件／場景重整期間角色換成不同版本，可能顯示新舊五表情混包、呼叫 Gemini 重產、或離場後仍顯示對方私人影像 | **已補回文件**：完整五圖解碼、句尾安全換角、Avatar 與 Scene 獨立版本、失權立即清投影、B1 不由故事續產；BDD-071/072/075、GAP-04、UT-212～217/224～226、IT-076/079、API-026、ET-032/033/036 |
| **SEF-UX-RA-05** | **高** | 兩條主線都有 `entry`，沿用舊 `node.id` 會保留上一場台詞／表情／Modal；Completed 後整個 ADV 消失也會把聊天藏掉 | **已補回文件**：以 `storySessionId + nodeId` 定位舞台，Episode 變更只清劇情狀態、Round 聊天與化身繼續；完成後保留收尾與聊天；BDD-073/076、GAP-05、UT-218～220/227～229、IT-077、API-025、ET-034/037 |
| **SEF-UX-RA-06** | **中** | App 在背景回前景時若觸發重新抽選或 B1 自動續產，會讓場景跳轉、產圖負載增加 | **已補回文件**：只透過權威快照＋游標補漏恢復；微動／音效按既有背景規則暫停，不重抽、重送或產圖；BDD-074、GAP-06、UT-221～223、IT-078、ET-035 |
| **SEF-UX-RA-07** | **中** | 全身五表情與多 Event 反覆重載造成記憶體／卡頓；關閉微動後仍播放動畫 | **已補回文件**：同版本圖檔重用、事件素材按需載入、保留微動開關，要求 Web／Android 量測實際延遲／記憶體／jank；BDD-077、GAP-07、UT-230～232、ET-038；不得假稱未測 FPS |
| **SEF-UX-RA-08** | **中** | 新引擎測試通過，但既有全身角色、兩結局、Web／Android 舞台或本人的完整試玩仍未驗收，就開始製作九條 | **已補回文件**：第一條「雨聲書店」同時執行本框架整合回歸與原 StoryDialogueAndExit UX-P1～P5／B1／Gate B，需本人核准；BDD-078、GAP-08、UT-233～235、ET-039 |

### 六之一、八組整合缺漏均已補入 BDD/TDD

| 缺漏 | BDD | Unit | Integration | API | E2E |
|---|---|---|---|---|---|
| SEF-UX-GAP-01 | 067、069 | 200～202、206～208 | 072、074 | — | 028、030 |
| SEF-UX-GAP-02 | 068 | 203～205 | 073 | — | 029 |
| SEF-UX-GAP-03 | 070 | 209～211 | 075 | 024 | 031 |
| SEF-UX-GAP-04 | 071、072、075 | 212～217、224～226 | 076、079 | 026 | 032、033、036 |
| SEF-UX-GAP-05 | 073、076 | 218～220、227～229 | 077 | 025 | 034、037 |
| SEF-UX-GAP-06 | 074 | 221～223 | 078 | — | 035 |
| SEF-UX-GAP-07 | 077 | 230～232 | — | — | 038 |
| SEF-UX-GAP-08 | 078 | 233～235 | — | — | 039 |

**追溯結果**：原 SPEC AC-001～012 保留，新增 **SEF-AC-013～016** 對應現有 MVP 的場景、互動及首條人工 Gate（未新增業務需求）。BDD **66→78**；TDD **320→379**，增加 Unit 36、Integration 8、API 3、E2E 12。規劃涵蓋 **SPEC AC 16/16、BDD 78/78**，但實際產品驗證 **BDD 0/78、TDD 0/379**。此處的 Ready 只表示可交付 well-done 的文件，不代表舊 Gate B 或新功能已通過。

### 六之二、確定的交接與禁止事項

- **原結論保持**：五張新增 D1 表、EventDefinition R2、3:1／同一對玩家去重、RA-Q1=A／RA-Q2=A、主線完成封存支線及雙方同意新場次不變。本次不提新資料表、Profile／Avatar 欄位或 Gemini 生成流程。
- **要開發的只有首條與引擎整合**：Scene／Narrative／Event 演出需沿用 `2.5d.v1`、免費 16 人物正式素材／五表情及已確認 AI 套組；不重畫免費人物、不新增新的角色姿勢生成功能。
- **使用者人工 Gate B 嚴格保留**：原 Verification 的本地回放、素材核對、Web／Android 自動測試不能替真人雙手機及使用者完整試玩簽核。第一條經本人試玩調校與明確確認後，才可繼續其餘九條主線。
- **無新的待決策業務事項**：所有八項都是已確認功能的跨 SPEC 安全與體驗整合，故技術層採守住原契約的方案；未發現需新增人工規則選擇。正式實作的效能、Gemini 供應商失敗與 Native 真機結果仍須當場驗證，未驗不能視為通過。
- **下一步**：交接 `docs/tdd/SPEC-001-SceneEventFramework-TDD.md`，由 well-done 先執行這 59 項增補測試與原 320 項的適當分層實作，所有結果以實際 runner/真 D1/Web/Android 證據記錄；本輪只修改規劃 Markdown。


