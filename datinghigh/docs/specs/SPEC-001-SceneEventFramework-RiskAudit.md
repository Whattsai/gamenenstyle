# SPEC-001-SceneEventFramework — 實作前風險與缺漏稽核（RiskAudit）

**日期**：2026-11-13（原十二項風險確認日期 2026-11-12）  
**規劃狀態**：**Ready for well-done（僅規劃交接）**；RA-Q1=A／RA-Q2=A 已由使用者確認，首條新架構尚未實作，舊視覺 Gate B 未驗收  
**來源**：[MVP-001](../requirements/MVP-001-LoveGameDatingApp.md) → [已確認 SDD](SPEC-001-SceneEventFramework.md) → [78 個 BDD](../bdd/SPEC-001-SceneEventFramework-BDD.md) → [379 項 TDD](../tdd/SPEC-001-SceneEventFramework-TDD.md)

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


