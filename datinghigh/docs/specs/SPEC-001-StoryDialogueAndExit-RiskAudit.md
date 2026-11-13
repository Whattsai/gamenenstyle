# SPEC-001-StoryDialogueAndExit — 實作前風險與缺漏稽核（RiskAudit）

## Well-Done 實作覆核（2026-11-08）

目前實作、Red→Green、各平台執行數與逐項保留缺項見 [驗證紀錄](../verification/SPEC-001-StoryDialogueAndExit-Verification.md) 及 [追溯JSON](../verification/story-dialogue-exit-traceability.json)。下列原規劃風險與歷史0%只描述進入Well-Done前的基線，不代表現行沒有程式。

| 風險 | 現行處置／證據 |
|---|---|
| RA-01 | 0005複合episode唯一與單playing部分唯一；真D1保留fixture驗分場票、offers.frozen、CAS與不覆寫首場JSON；公開固定episode1 |
| RA-02 | known-local wrapper先停寫備份、清三張舊game／邀請，同batch套0005；真D1注入失敗回滾，帳號Profile保留 |
| RA-03～05 | 接受batch內直接算當下排名；N1各步零列rollback、N0拒絕、N2最新有效票／邀請方結算及完整Session／selected guard |
| RA-06 | D1當前family／cv／expiry／原pair與恰好兩claim guard；第三人、撤銷、非法第三claim、舊socket拒絕 |
| RA-07～08 | 標準WS、一次性ticket、事件投影、原IDreceipt／cursor；真commit丟ACK後查回只一筆，DO限frame／連線／速率 |
| RA-09 | Matching、ready、CLI、fixture與runtime改名；真Matching33項與舊Web12項、真CLI回歸 |
| RA-10 | 每次mutate同批授權／revision，並行end／chat／vote及零列事件回滾；結束拒私人歷史且不物理清資料 |
| RA-11～12 | 首場Catalog凍結、published unique、immutable SHA、獨立R2、上傳讀回驗證後發布；retired仍供舊Round |
| RA-13 | 真個人探索與雙人pending，未回覆不代答，等待可返回探索／聊天；兩種完整結尾 |
| RA-14 | 只製作scene-01；Gate B未簽、MVP十場AC不勾，N2/3隔離fixture不算新正式故事 |
| RA-15 | Cloudflare中立通知port與標準client WS；本地兩Room隔離有數據，雲端喚醒／冷啟動／成本保留未驗 |
| RA-16 | ended後安全狀態與無私人內容；沒有先做History／保留天數／後續功能假頁 |



**2026-11-08 歷史稽核日期／舊範圍狀態**：**Ready for well-done（只適用原79 BDD／187 TDD；2026-11-12 新視覺範圍最新規劃Ready狀態見上方）**。`SD-RQ-01=B`、`SD-RQ-02=A` 均已由使用者確認。
**來源**：[已確認 MVP](../requirements/MVP-001-LoveGameDatingApp.md) → [已確認 SDD](SPEC-001-StoryDialogueAndExit.md) → [BDD 79 場景](../bdd/SPEC-001-StoryDialogueAndExit-BDD.md) → [TDD 187 測試](../tdd/SPEC-001-StoryDialogueAndExit-TDD.md)。
**驗證依據**：重新讀取最新 SDD、0004 真 Schema、Matching 的 `matching-commands.ts`、架構與開發規則。並非程式碼執行通過證據；只進行規劃稽核。

## 2026-11-12 增量風險稽核：全身化身／五表情／2.5D 沉浸體驗（最新狀態）

**最新規劃狀態：Ready for well-done（規劃交接，非已實作／已驗收）。Story 與 AvatarAndPreferences 兩份SPEC的新增 BDD／TDD／RiskAudit 已補齊，原跨SPEC文件依賴不再 Blocked**。下方 2026-11-08「Ready for well-done」與原 10 高＋6 中是**歷史記錄**，不涵蓋新 `SD-AC-021～030`。使用者已確認 `Q-UX1=A`、`Q-UX2=A`、`Q-UX3=B`、`UX-RQ-01=B1`、`UX-RQ-02=WS`、`UX-RQ-03=R2-MANIFEST`、`UX-RQ-04=FULL-BODY`，並再次確認 **`UX-AUDIT-RQ-01=CLEAN-RESET`：尚未上線，不做舊半身相容或升級，新功能完成後僅針對非正式角色資料受控清理再從零驗證**。已無需要使用者補答的本次產品問題，**目前沒有執行任何刪除**。

### A. 最新需求追溯與實際驗收分界

| 指標 | 2026-11-12 最新狀態 | 不可誤認 |
|---|---|---|
| MVP → SPEC | MVP 2026-11-12 最新全身／非正式清舊決策；Story `SD-AC-021～030` 10/10、Avatar `AP-AC-025／026` 已回寫 | 舊 D-049 半身要求僅是歷史，不能拿它作最新驗收 |
| SPEC → BDD | 原 `SD-AC-001～020` ↔ 原79 BDD；新10條 ↔ `SD-BDD-080～115` 36場景；**30/30 AC 已有對應行為規劃** | 「已追溯」不是已實作 |
| BDD → TDD | 新36/36 BDD 各對應3個新 TDD ID，Unit36＋Integration36＋API18＋E2E18＝**新增108**，總數 **115 BDD／295 TDD** | 新108項全未驗；舊175/187的覆核不代表新視覺或清測資已完成 |
| 實際證據 | 原2026-11-08 Verification：舊79 BDD 已覆核71、舊187 TDD 已覆核175；新 BDD 0/36、TDD 0/108 | 合計 BDD 71/115、TDD 175/295；舊版逐項證據仍須照 Verification 核對 |
| 跨 SPEC 依賴 | `AvatarAndPreferences` SDD／BDD／TDD／RiskAudit 已補 `AP-AC-025／026`；Avatar 新24 BDD／120 TDD均未驗收 | **跨SPEC規劃依賴已解除**；Ready僅指規劃交接，不能宣稱真圖片／雙端 Gate B 已通過 |

### B. 新增技術與產品風險（高 9 項、中 4 項）

| ID | 等級 | 若忽略，玩家／專案會發生什麼問題 | 已確認方案或仍需決策 | 新行為／TDD 對照 |
|---|---|---|---|---|
| `SD-RA-17` | **高** | 免費16款全身圖可能變成一張「有點像」但原本滿意的臉、上衣與人物氣質都不同 | **已確認不能重畫**；原16張保持不變、上半身 ROI／輪廓遮罩鎖定與同尺度比對，人工逐一批准；若失敗只修補外延下半身 | BDD-081/082，UT-052/053、IT-063/064、ET-041/042 |
| `SD-RA-18` | **高** | 新 3:4 全身 1K 的臉太小，近景會糊；為了每表情壓到200KB可能更差 | **已確認畫質 Gate 優先**；真 Gemini 全身圖、Web／Android 遠中近景及可參數壓縮實測；畫質不足要報告解析度／成本差異，不能暗降驗收 | BDD-083/096/110，UT-054/067/081、IT-065/078/092、API-053、ET-043/044 |
| `SD-RA-19` | **高** | B1 前景製作四張表情可能耗時；原短效候選60分鐘、單次AI 90秒，網路中斷時玩家會卡住或重花費用 | **B1 已確認**；逐張循序 await、只重試缺漏、過期 fail-closed；需真供應商耗時／候選過期／取消／恢復試驗，不新增背景 Job | BDD-084/086，UT-055/057、API-040 |
| `SD-RA-20` | **高** | 同帳號多分頁或兩部手機一邊產表情一邊切角色，晚到的採用回覆可能覆寫新角色 | **已確認前後端禁止切角**；R2 CAS／穩定 requestId／D1 revision 防重複與衝突，只有合法明確前景產製可繼續 | BDD-084/087/091，IT-066/069/073、API-041/045 |
| `SD-RA-21` | **高** | R2 五張檔名雖存在卻破損，或 R2 ready 成功但 D1 Profile 未更新，角色可能只採用半套／用到他人圖 | **已確認 R2 Manifest 作素材權威**；`avatarAssetId+expressionSpecVersion+avatarAssetSpecVersion`、五張 hash/格式/全身完整、R2 ready 後 D1 條件採用，跨服務不假稱原子 | BDD-085/088/089/091，IT-067/070/071/073、API-039/042/043/045 |
| `SD-RA-22` | **高** | 私人AI素材與來源真人照片可能被其他配對者、已結束玩家或未採用候選讀到 | **已確認只給有效 Round 的真兩人讀取已採用投影**；禁止公開 R2 key、短效候選、原始真人照片、Ended後訪問 | BDD-092，IT-074、API-046 |
| `SD-RA-23` | **高** | A換角色 B畫面仍停留舊角色；或為了更新而每秒查DB造成高流量 | **已確認採用成功才 WS 推播 avatar revision**，通知時按需查一次、同一句結束安全切換、重連校正，不定時輪詢 | BDD-093～095，IT-075～077、API-047～049 |
| `SD-RA-24` | **高** | 新舞台只是兩張卡疊在背景、P1～P5有入口卻不能操作，NPC表情和假「對方已讀」誤導真玩家 | **已確認首場五項全做並分 Gate A／B**；分角色分 POV、場景熱區／真雙人狀態、Web／Android兩端各驗、不得用原舊測試代簽 | BDD-080/096～109/111，ET-040/044～055 |
| `SD-RA-25` | **高／已解決設計** | 舊半身角色留存會污染全身遠景、造成新舊兩種不一致體驗；不受控清理又可能誤刪私人真人照、免費角色原畫或其他環境資料 | **使用者已決定 CLEAN-RESET**：未上線，不建半身相容／轉檔／升級 UI；新功能完成後只對核實的非正式環境，按 D1 `user_profiles` 選角、`user_media_assets.kind='generated_avatar'`、R2 avatar／temp／舊套組精確清理，保留照片／帳號／16張原畫；D1／R2 非原子須可重試，先清理才全新驗收 | BDD-090/112～115；UT-061/083～086、IT-072/094～097、API-044/054/055、ET-056/057 |
| `SD-RA-26` | 中 | 共用 Skia 壓縮目前鋪白輸出JPEG，若直接用於角色 alpha 會出現白色外框 | 已確認沿用共用抽象擴充透明 WebP／遮罩；保留個人照200KB政策，品質失敗不能 ready | BDD-110、UT-081、IT-092、API-053 |
| `SD-RA-27` | 中 | 16×5免費圖＋私人AI全身五表情和多層鏡頭會增加手機記憶體、首屏載入與成本 | 已確認預載 neutral／當前節點、其他按需載入，版本快取與低資源模式；不可無證捏造 FPS／秒數 | BDD-097/109，UT-068/080、IT-079/091、ET-045 |
| `SD-RA-28` | 中 | 全身站姿被誤當成可坐下、走路或持物，首場桌邊出現違和姿勢，後續擴場不可靠 | **已確認此期只支援站立與遠中近鏡位**；其他骨架 pose 另規劃，場景不能透過裁切冒充已完成坐姿 | BDD-096/102/111，ET-044/049/055 |
| `SD-RA-29` | 中／**規劃已緩解** | 若 Story／Avatar 文件鏈仍採半身歷史成功案例，可能誤將舊圖片視為全身 Gate B 通過 | **已回寫** Avatar `AP-AC-025／026` → `AP-BDD-074～097` 24場 → 120個TDD與 Avatar RiskAudit RA-15～26；歷史通過記錄保留但不代簽新Gate | Story BDD-081～090/110/112～115；Avatar BDD-074～097／TDD新增120項 |

### C. 缺漏識別與回寫狀態

| 缺漏 ID | 來源／具體影響 | 狀態與下一步 |
|---|---|---|
| `SD-VG-01` | `SD-RA-25`：舊半身角色入場／資料轉換衝突；新方案不需要相容路徑，但要確保清舊測資可安全執行並從零驗收 | **已補回文件** `UX-AUDIT-RQ-01=CLEAN-RESET`：MVP、Story SDD §3.9、Avatar SDD、BDD-090/112～115、TDD UT-061/083～086＋IT-072/094～097＋API-044/054/055＋ET-056/057；**實際清理未執行** |
| `SD-VG-02` | `SD-RA-17/18/26`：原16上半身逐像素保真、AI全身近臉畫質、alpha共用壓縮的品質 Gate 缺漏 | **已補回** `SD-BDD-081/082/096/110`、`SD-UT-052/053/067/081`、`SD-IT-063/064/078/092` 及對應 E2E；仍待真素材驗 |
| `SD-VG-03` | `SD-RA-19～23`：前景失敗／並發、R2與D1結果不明、受控私有素材、WS不輪詢的業務安全缺漏 | **已補回** `SD-BDD-084～095` 與各對應三層 TDD；仍待實作證據 |
| `SD-VG-04` | `SD-RA-24/27/28`：P1～P5、站立遠中近、Web／Android與人工 Gate B 缺漏 | **已補回** `SD-BDD-080/096～109/111` 及對應 TDD；仍待真雙人實玩 |
| `SD-VG-05` | `SD-RA-29`：上游 Avatar `AP-AC-025／026` 新全身＋CLEAN-RESET 要求須具備自身 BDD／TDD／RiskAudit，不得借用 Story 透支通過紀錄 | **已補回／規劃相依解除**：Avatar BDD 新24場、TDD 新120項、RiskAudit 新12風險及6缺漏；兩SPEC分開記各自進度與 Gate，不重複合併ID |

### D. 風險決策已確認（UX-AUDIT-RQ-01=CLEAN-RESET，2026-11-12）

**使用者決策**：DatingHigh 還在開發、未上線，現有半身化身不需要舊資料相容、升級或原 ID 延伸。**完成新全身功能後、正式進行全新 Web／Android 體驗驗收前**，在已明確核准的**非正式測試環境**清除舊角色相關 D1／R2 測試資料，再重新由角色選擇、AI 全身候選、B1 五表情到書店雙人遊戲完整測試。

**執行界線**：先核對環境 DB ID／R2 bucket／測試帳號、精確 owner／object-key 清單與數量，不碰正式或未知環境。清除 `user_profiles.selected_avatar_type/ref` 並更新 revision、所有相關 `user_media_assets.kind='generated_avatar'`、私人 `private/{accountId}/avatar/{assetId}` 舊生成圖、`private/{accountId}/avatar/temp/` 候選與舊五表情 Manifest／物件；保留 `personal_photo`／私有 `photos/`，保留帳號、其他 Profile 欄位及原16款免費圖片檔。D1／R2 刪除必須可重試、留計數及異常證據，不能因跨服務而假稱全部原子，不能現在執行。

**不再保留的 A／B 問題**：之前「先升級舊半身角色」與「允許舊半身暫時入場」兩個選項均已被 **CLEAN-RESET** 取代；不需要再詢問本人。選角前後端只驗證新的 full-body ready，沒有自動背景產圖或舊圖兼容畫面。

### E. 最新規劃交接狀態

- **已完成規劃**：MVP、Story SDD（SD-AC-001～030）、Story BDD 115 場、Story TDD 295項（原187＋新108）及本份風險稽核已對齊；`SD-VG-01～04` 四項已補回；**全部 Story 範圍的產品決策均已確認**。新增108項測試未實作／未驗收，舊版175/187覆核證據不能代簽。
- **跨 SPEC 追溯已完成**：`SD-VG-05` 已透過 Avatar `AP-AC-025／026` 的24 BDD、120 TDD、12項新增RiskAudit風險及逐場追溯補齊；原 **Blocked（文件相依）解除**。本 Story 仍須有自己115 BDD／295 TDD與真實 Web／Android Gate 證據，**規劃 Ready 不是驗收 Passed**。
- **最新 Phase 4／5**：Story增量9高＋4中與 Avatar增量8高＋4中風險均有規劃緩解及新 TDD ID，兩份SPEC的產品決策全部已確認、跨文件規劃依賴已解除，**可交接 Well-Done**。本次只改文件，未改程式／角色圖片／R2／D1或執行清理；新視覺／全身功能仍0實測，原2026-11-08 Ready與通過資料僅保留歷史來源。

---

## 一、需求追溯完整性

| 指標 | 結果 |
|---|---|
| 本 SPEC 可驗收條件 | 20/20 已映射 BDD；實際驗收 0/20 |
| BDD Gherkin | 79/79 都映射至少 2 個 TDD ID；實際驗收 0/79 |
| TDD 規劃案例 | 187 項：Unit 50、Integration 61、API 37、E2E 39；實際驗收 0/187 |
| 已確認產品來源 | `AC-005-01..03`、`AC-012-02..04`、`AC-020-06..07` 的終止交集；`AC-012-01` 留後續 Affection |
| 明確未交付 | 首場以外 9 個劇本、**第 2 個獨立劇本的正式啟動 API／UI／業務流程**、後續完整 OnlineGames／名片交換／好感計分、iOS（暫緩）、無障礙專項（不納入）、Housekeeping／History（未來 MVP） |

| SPEC 驗收 | Gherkin BDD | 已規劃 TDD 代表項（完整對照見 TDD） |
|---|---|---|
| `SD-AC-001` | `SD-BDD-042`、`SD-BDD-043`、`SD-BDD-068` | `SD-IT-024`、`SD-API-001`、`SD-API-029`、`SD-IT-025`、`SD-API-002`（其餘 3 項見 TDD 完整矩陣） |
| `SD-AC-002` | `SD-BDD-001`、`SD-BDD-002`、`SD-BDD-003`、`SD-BDD-004`、`SD-BDD-023`、`SD-BDD-024`、`SD-BDD-033`、`SD-BDD-034`、`SD-BDD-035`、`SD-BDD-056`、`SD-BDD-057`、`SD-BDD-074` | `SD-UT-001`、`SD-IT-001`、`SD-IT-038`、`SD-UT-002`、`SD-IT-002`（其餘 24 項見 TDD 完整矩陣） |
| `SD-AC-003` | `SD-BDD-007`、`SD-BDD-032`、`SD-BDD-055`、`SD-BDD-064` | `SD-UT-007`、`SD-ET-001`、`SD-UT-032`、`SD-ET-018`、`SD-API-014`（其餘 3 項見 TDD 完整矩陣） |
| `SD-AC-004` | `SD-BDD-008`、`SD-BDD-009`、`SD-BDD-061` | `SD-UT-008`、`SD-ET-002`、`SD-UT-009`、`SD-ET-003`、`SD-API-020`（其餘 2 項見 TDD 完整矩陣） |
| `SD-AC-005` | `SD-BDD-009`、`SD-BDD-036`、`SD-BDD-037`、`SD-BDD-044`、`SD-BDD-061`、`SD-BDD-068`、`SD-BDD-070`、`SD-BDD-076`、`SD-BDD-079` | `SD-UT-009`、`SD-ET-003`、`SD-UT-036`、`SD-IT-018`、`SD-UT-037`（其餘 16 項見 TDD 完整矩陣） |
| `SD-AC-006` | `SD-BDD-010`、`SD-BDD-011`、`SD-BDD-012`、`SD-BDD-063`、`SD-BDD-076` | `SD-UT-010`、`SD-ET-004`、`SD-UT-011`、`SD-ET-005`、`SD-UT-012`（其餘 5 項見 TDD 完整矩陣） |
| `SD-AC-007` | `SD-BDD-013`、`SD-BDD-014`、`SD-BDD-015`、`SD-BDD-064` | `SD-UT-013`、`SD-ET-007`、`SD-UT-014`、`SD-ET-008`、`SD-UT-015`（其餘 3 項見 TDD 完整矩陣） |
| `SD-AC-008` | `SD-BDD-016`、`SD-BDD-027`、`SD-BDD-028`、`SD-BDD-029`、`SD-BDD-065`、`SD-BDD-066` | `SD-UT-016`、`SD-IT-007`、`SD-ET-035`、`SD-UT-027`、`SD-ET-014`（其餘 8 項見 TDD 完整矩陣） |
| `SD-AC-009` | `SD-BDD-016`、`SD-BDD-029`、`SD-BDD-066`、`SD-BDD-067` | `SD-UT-016`、`SD-IT-007`、`SD-ET-035`、`SD-UT-029`、`SD-ET-016`（其餘 4 項見 TDD 完整矩陣） |
| `SD-AC-010` | `SD-BDD-017`、`SD-BDD-048`、`SD-BDD-049`、`SD-BDD-078` | `SD-UT-017`、`SD-ET-010`、`SD-IT-030`、`SD-API-007`、`SD-IT-031`（其餘 5 項見 TDD 完整矩陣） |
| `SD-AC-011` | `SD-BDD-017`、`SD-BDD-049`、`SD-BDD-067` | `SD-UT-017`、`SD-ET-010`、`SD-IT-031`、`SD-API-008`、`SD-API-032`（其餘 2 項見 TDD 完整矩陣） |
| `SD-AC-012` | `SD-BDD-018`、`SD-BDD-043`、`SD-BDD-050`、`SD-BDD-051`、`SD-BDD-062`、`SD-BDD-070` | `SD-UT-018`、`SD-IT-008`、`SD-IT-025`、`SD-API-002`、`SD-API-030`（其餘 11 項見 TDD 完整矩陣） |
| `SD-AC-013` | `SD-BDD-019`、`SD-BDD-030`、`SD-BDD-052`、`SD-BDD-053` | `SD-UT-019`、`SD-ET-011`、`SD-UT-030`、`SD-IT-014`、`SD-IT-034`（其餘 5 項見 TDD 完整矩陣） |
| `SD-AC-014` | `SD-BDD-010`、`SD-BDD-031`、`SD-BDD-032`、`SD-BDD-063` | `SD-UT-010`、`SD-ET-004`、`SD-UT-031`、`SD-ET-017`、`SD-UT-032`（其餘 3 項見 TDD 完整矩陣） |
| `SD-AC-015` | `SD-BDD-020` | `SD-UT-020`、`SD-ET-012`、`SD-ET-036` |
| `SD-AC-016` | `SD-BDD-002`、`SD-BDD-003`、`SD-BDD-005`、`SD-BDD-006`、`SD-BDD-025`、`SD-BDD-026`、`SD-BDD-045`、`SD-BDD-046`、`SD-BDD-056`、`SD-BDD-057`、`SD-BDD-058`、`SD-BDD-059`、`SD-BDD-060`、`SD-BDD-075`、`SD-BDD-079` | `SD-UT-002`、`SD-IT-002`、`SD-IT-039`、`SD-UT-003`、`SD-IT-003`（其餘 33 項見 TDD 完整矩陣） |
| `SD-AC-017` | `SD-BDD-001`、`SD-BDD-005`、`SD-BDD-006`、`SD-BDD-037`、`SD-BDD-038`、`SD-BDD-039`、`SD-BDD-045`、`SD-BDD-047`、`SD-BDD-072`、`SD-BDD-073`、`SD-BDD-074`、`SD-BDD-075`、`SD-BDD-076`、`SD-BDD-077`、`SD-BDD-078`、`SD-BDD-079` | `SD-UT-001`、`SD-IT-001`、`SD-IT-038`、`SD-UT-005`、`SD-IT-005`（其餘 38 項見 TDD 完整矩陣） |
| `SD-AC-018` | `SD-BDD-001`、`SD-BDD-002`、`SD-BDD-003`、`SD-BDD-033`、`SD-BDD-055`、`SD-BDD-069`、`SD-BDD-077` | `SD-UT-001`、`SD-IT-001`、`SD-IT-038`、`SD-UT-002`、`SD-IT-002`（其餘 13 項見 TDD 完整矩陣） |
| `SD-AC-019` | `SD-BDD-018`、`SD-BDD-070` | `SD-UT-018`、`SD-IT-008`、`SD-IT-037`、`SD-ET-034` |
| `SD-AC-020` | `SD-BDD-021`、`SD-BDD-022`、`SD-BDD-034`、`SD-BDD-040`、`SD-BDD-041`、`SD-BDD-053`、`SD-BDD-054`、`SD-BDD-071`、`SD-BDD-072`、`SD-BDD-073`、`SD-BDD-074`、`SD-BDD-077`、`SD-BDD-079` | `SD-UT-021`、`SD-IT-009`、`SD-UT-022`、`SD-IT-010`、`SD-IT-041`（其餘 30 項見 TDD 完整矩陣） |

**追溯結論**：20/20 項 SDD 驗收皆可對應 BDD 和 TDD，**有規劃並不等於已實作**。使用者已確認 `SD-RQ-01=B` 的多場次資料模型（本期只玩第 1 場）、`SD-RQ-02=A` 的非正式舊遊戲測資重建；兩項缺漏均已寫入 SDD／BDD／TDD。

## 二、已識別實作風險（依嚴重度）

### 高風險（10 項，均有已確認決策或技術緩解）

| ID | 已發現風險及會發生的問題 | 依據 | 決策／處置 | 規劃測試 |
|---|---|---|---|---|
| `SD-RA-01` | **已依 SD-RQ-01=B 解決規劃衝突**：`game_story_sessions` 原 `UNIQUE(round_id)` 限死單輪只能一場，現在新增 `episode_seq`、`UNIQUE(round_id,episode_seq)` 與單輪 playing 的部分唯一索引；候選與投票必須按場次隔離。**影響：若只移除 UNIQUE 而不區隔選票與節點，未來第二場仍會混資料** | SDD §2、§4.3～4.4、§5、§8 | **使用者 SD-RQ-01=B 已確認**：資料層可放多個獨立 StorySession，但本期 App、API、WS 只支援 episode=1；第 2 場候選用 events.frozen，不加表 | `SD-BDD-072～079`、`SD-UT-043～050`、`SD-IT-050～061`、`SD-API-036/037`、`SD-ET-038/039`；待 Well-Done 真測 |
| `SD-RA-02` | 既有 game_rounds 7→9 欄中的 story_offer_catalog_ids_json TEXT NOT NULL 無 DEFAULT；0004 本地資料若已有舊 Round，直接 ALTER TABLE 加欄可能失敗，不能憑空替舊 Round 釘選新劇本。**影響：非正式 DB 升級可能中斷或為了通過任意寫入假候選；更不能無授權清除資料** | §4.3、0004_matching_sessions.sql | **使用者已確認 SD-RQ-02=A（2026-11-08）**：尚未上線；實作期清除已確認非正式環境的全部舊遊戲資料及其必要關聯測資，再以新 Schema 建立測試資料；不做舊 Round 遷移；本輪不執行清除 | SD-BDD-021/022/071、SD-UT-042、SD-IT-048/049；真 D1 清除／重建／拒絕未知環境 |
| `SD-RA-03` | 現有 match.invite.resolve action=accept 多段 prepared SQL 以 changes()=1 串接；在同批加入候選、單場初始化／event 後若錯排插入，會破壞原先 changes() 保護。**影響：受邀者可能看到 accepted 但沒有完整房間，或某人仍被佔用** | §4.3、matching-commands.ts | 已有明確技術處理：維持同 batch 線性化、逐句 guard 並以真 D1 故障注入 | SD-IT-001、SD-IT-002、SD-IT-003、SD-IT-038 |
| `SD-RA-04` | 取消 Votes 專用表改存共用 game_round_events，最晚有效投票需依**同 episodeSeq** 的 actor MAX(sequence) 還原，若用整個 Round 最後事件或在 UI 端結算，邀請方決勝會錯。**影響：兩人看到不同劇本或後提交的人不當取得決定權** | §2.4、§4.3、§5 | 已按 episodeSeq＋actor 的最後有效事件及同 D1 batch 結算規劃 | SD-BDD-005/006/025/038/039、SD-IT-005/006/013/021/042/053/060 |
| `SD-RA-05` | 同事件流包含未結算投票 catalogId；HTTP events/query、WS 快照、重連補漏若回傳原始 payload，另一方會提早知道對方選項。**影響：玩家投票隱私和真實選擇獨立性被破壞** | §2.3、§5.2 | 由伺服器依 actor／round／episodeSeq／是否結算做事件投影；不能只前端隱藏 | SD-BDD-046、SD-IT-028/044/053、SD-API-005 |
| `SD-RA-06` | 投票事件做伺服器隱藏後，afterSeq／beforeSeq 的游標翻頁與 page limit 不能因此漏掉下一則合法事件或洩露隱藏 event。**影響：玩家重連無法補齊對話，或可由事件 payload 看見對方票** | §5.2 | 游標可在隱藏事件上前進但不返回敏感 payload，保持全局 sequence、episodeSeq 與授權投影一致 | SD-IT-044/056、SD-BDD-018/046 |
| `SD-RA-07` | WebSocket ticket 一次性且短效，DO Hibernation 附件是非權威；新登入撤舊 family 後舊 socket 仍可能存活。**影響：被踢下線的舊裝置可假扮本人續傳訊息** | §4.1、§4.1.2 | WS transport 每次授權需重驗並用真 D1 guard；重播票拒絕 | SD-BDD-043/050、SD-API-002/030/033 |
| `SD-RA-08` | D1 已提交但 DO 廣播失敗／Container 冷啟動，UI 若視 WS 推送為唯一真相或以新 requestId 補送會重複聊天與互動。**影響：發話看起來消失、重複扣用戶操作、不同裝置順序不一致** | §4.1、§5.2 | 事件序號、同 requestId 回查 receipt、HTTP snapshot／有界補漏 | SD-BDD-018/051/062、SD-IT-033/045、SD-API-010/035 |
| `SD-RA-09` | game_round_participants → game_active_round_claims 為既有 UNIQUE 佔用表的更名；Matching、readiness、CLI維運／所有對應測試可能仍引用舊名。**影響：正式接受、查詢、結束或本地維運可能部分失效** | §4.3、AGENTS/MatchingSessions | 更名不合併表；全入口實際查詢覆蓋、既有資料與占用 UNIQUE 回歸 | SD-BDD-022/040/054、SD-IT-010/041 |
| `SD-RA-10` | story、interaction、chat 及 end 並行時，若只先 GET 判斷 active，已結束後仍可追加合法樣貌的事件；未來名片也可能在 ended 後繼續揭露。**影響：用戶結束後仍被訊息打擾，甚至取得後續更新的真人照片** | §2.11/12、§4.3 | 在每個固定 SQL batch 中驗 active、episodeSeq、對應 Session、Claim、revision，end 與 commit 線性化 | SD-BDD-016/048/049、SD-IT-030/043/055/061 |

### 中風險（6 項；實作前規則已明確）

| ID | 已發現風險及會發生的問題 | 依據 | 決策／處置 | 規劃測試 |
|---|---|---|---|---|
| `SD-RA-11` | **第 1 場 Round 候選 JSON** 是最多三個 Catalog ID，無法以直接多欄 FK 保護每一元素；若來源合法但排名時 Publish／Retire 競態，可能指向不可玩的劇本。**影響：配對成立卻無法進場或玩家選了不完整場景** | §4.3、§5.1 | 接受同批驗 Catalog、狀態、互異與排名；未來新場候選則在共用 offers.frozen event 同批 guard，兩者均禁止回溯改動 | SD-BDD-001～004/030/033/034、SD-IT-003/052/059 |
| `SD-RA-12` | content_story_catalog 同 story_id 只允許一個 published，變更版次需保留已釘選舊 Round；沒有明確的受控發布器與 R2 hash/asset 驗證會產生破圖／失連。**影響：舊玩家載入新版錯台詞、支線不可到達或看到私人照片** | §4.3、§6.1 | immutable manifest、R2 content ACL、同劇本發布版本唯一索引與Retire時舊檔保留 | SD-BDD-019/030/052/053、SD-IT-014/034/035/046/047 |
| `SD-RA-13` | 真雙人非同步合作可能等很久，假 NPC 回覆、假已讀或逾時代答會誤導玩家。**影響：玩家以為另一方已答應或已讀，結果偏離真選擇** | §2.5～9、§6.3 | 個人探索不中斷，雙人閘門保持 pending、明確顯示來源，不加倒數處罰 | SD-BDD-010/011/012/026/031/063 |
| `SD-RA-14` | 第一個完整劇本和 MVP 的十個劇情完成度不可混算；場景圖、3:4 立繪、分支與音效若只有 intro 便勾選完成會誤報品質。**影響：玩家只玩得到片段卻顯示 MVP 已完成** | §1、§3、§6.4 | 首場完整 Gate A 技術＋Gate B 使用者實玩分別保存；其餘九場未達標不勾 | SD-BDD-007/013/014/020/064、SD-ET-036 |
| `SD-RA-15` | 原生 WebSocket 與 Cloudflare DO 是傳輸 Adapter，若把 DO ID 或 Hibernation 物件放進 Domain／UI，將來換平台仍需改寫遊戲邏輯。**影響：未來搬離 Cloudflare 時大量重寫劇情及前端** | §4.1.2、§4.2 | 固定 JSON Wire Contract／IRoundRealtimeNotifier；本期只部署一套 DO Adapter | SD-BDD-018/070、SD-UT-018、SD-IT-037 |
| `SD-RA-16` | SD-Q3 明確禁止 ended 後玩家讀聊天；History／Housekeeping 不在本 SPEC，不能因沒有保留天數就自行物理刪除。**影響：越權查舊聊天或誤刪必要的永久配對排除證據** | §2.14、§7、§9 | 本期只做存取拒絕，History/搬移/保留天數留未來 MVP | SD-BDD-017/049、SD-API-008/032、SD-ET-010/031 |

### 低風險／明確排除

- 目前 Cloudflare DO 的併發數、真實流量／費用尚無執行量測；以 TDD 容量測試作實測，不杜撰 SLA 或要求另建 SignalR。
- 正式資料保留、History、Housekeeping 不在本期規劃或開發清單。此項不列為「尚欠一個保留天數答案」，避免違反已確認範圍。
- 先本地 Web／Android 驗證，雲端正式部署／iOS 不得被本地結果冒稱已驗收。

## 三、測試覆蓋已補強及待決策缺漏

### 已於 Phase 3 納入 TDD 的關鍵風險覆蓋

| 類別 | 覆蓋要點 | TDD |
|---|---|---|
| 真 SQL accept rollback | 插入 Round、Claim、N=1 StorySession、Event 任意一段失敗都 rollback；Profile／Catalog 競態 | `SD-IT-038～040`（詳見 TDD） |
| Event 投票與重放 | A 改票、B 投票時序、最後有效事件、同 requestId 不覆寫更新票 | `SD-IT-042`、`SD-BDD-025/038/039` |
| 私人投票的伺服器投影 | WS／HTTP events、補漏游標與 next-page 保留序號又不揭露對方實際票 | `SD-BDD-046`、專項真 D1／API 測試 |
| 已提交事件遺失推播 | DO crash 後原 requestId receipt、游標同步與 exactly-once 業務效果 | `SD-BDD-051` 與補強整合測試 |
| 四新表／改名完整回歸 | 不新增 Offers／Votes；驗證 live Claim UNIQUE、Matching、local policy、API 全路徑 | `SD-BDD-021/022/040/054` 與整合測試 |
| 極端訊息／權限 | Unicode scalar 上下界、危險字元、跨 Round、Session family 撤銷、end 競態 | `SD-BDD-036/042～050` |

### 兩項缺漏均已依使用者決策補回

| 缺漏 ID | 來源 | 使用者確認的處置 | 已回寫位置及狀態 |
|---|---|---|---|
| `SD-GAP-01` | `SD-RA-01` | **已確認 B**：單輪可依序儲存多獨立劇本 Session；本期只啟動第一場，未來第二場從 episodeSeq=2 開始，不共享原場候選或選票 | **已補回 SDD §2／§4.3～4.4／§5、BDD-072～079、TDD UT-043～050／IT-050～061／API-036～037／ET-038～039**；規劃完成，待實作 |
| `SD-GAP-02` | `SD-RA-02` | **已決定**：尚未上線，舊遊戲資料不做相容轉換；僅在實作期對經確認的非正式 DatingHigh DB 清除全部舊 Round／Claim／必要關聯測資，再用新 Schema 測試 | **已回寫 BDD-071、UT-042、IT-048～049 與 SDD §4.3；已補回文件，程式碼未執行** |

## 四、實作前風險決策（兩題均已確認）

### SD-RQ-01：已確認 B（多場次 Schema、當期只啟動第 1 場）

**使用者決策（2026-11-08）**：選 B。現在於 `game_story_sessions` 增加 `episode_seq` 並將 `UNIQUE(round_id)` 調整成 `UNIQUE(round_id,episode_seq)`，同時建立「每個 Round 最多一筆 `chapter_status='playing'`」的部分唯一索引。第 1 場配對當下推薦 JSON 永遠不覆寫；未來第 2 場以上的候選由共用 `game_round_events(kind='story.episode.offers.frozen')` 記錄，選票／結算的 `payload_json` 均帶 `episodeSeq`，遊玩節點綁 `storySessionId`。不新增 Episode／Offers／Votes 實體表。

**目前玩家看得到的功能**：每輪只進行第 1 個獨立劇本，完成後繼續自由聊天和未來其他模組，不新增第二場入口。**未來擴充**：基礎多場續玩的資料結構無需再因單輪一場限制而 Migration，但仍須補 Application／API／UI 及相應真雙端驗證，不能宣稱未來所有需求一概無資料變更。

**風險緩解與測試**：`SD-BDD-072～079`、`SD-UT-043～050`、`SD-IT-050～061`、`SD-API-036～037`、`SD-ET-038～039`。第二場的資料模型可於隔離真 D1 測試，但本期公開端點與 UI 不准開始第 2 場。**狀態：已補回文件**，無待問選項。

### SD-RQ-02：已確認，尚未上線，清除舊遊戲測資直接使用新版結構

**使用者決策（2026-11-08）**：採 **A**。無需保留現有舊遊戲資料或替既有 Round 補入假 Catalog ID；在進入實作／套用本 SPEC 的新 Schema 時，針對已確認的 DatingHigh 非正式測試 DB，**清除全部舊遊戲 Round、帳號占用與必要關聯測資**，直接使用新表和新測試案例重建。

**邊界**：不是清除正式資料、未知環境或其他專案；帳號／Profile／與遊戲無關的資料不得被「清遊戲」指令波及。需要因 FK 連帶處理的邀請／事件依實際引用關係一併清理並驗證完整，不能留下舊 accepted 邀請卻無 Round 的孤兒業務狀態。此處只是**規劃授權，不在 perfect-plan 立即執行資料刪除**；不做舊版 Room 資料移植或相容層。

**測試回寫**：新增 `SD-BDD-071`、`SD-UT-042`、`SD-IT-048/049` 驗證非正式環境範圍、清除順序、交易 rollback、沒有孤兒資料，以及新 Schema 直接建立真單／雙候選 Round。

## 五、稽核結論與 perfect-plan 階段

- **Phase 2 SDD**：2026-11-08 使用者已確認；未擅自增加第 5 張表、Offers／Votes、特殊單故事開關、Housekeeping。
- **Phase 3 BDD/TDD**：79 場景、187 個待驗收 TDD ID（50 Unit／61 真 D1 Integration／37 API／39 E2E），全部尚未執行，實作驗收仍為 0%。
- **Phase 4 RiskAudit**：辨識 **10 高＋6 中** 風險，兩項需要使用者決策的 `SD-RQ-01=B` 與 `SD-RQ-02=A` 均已確認及回寫文件；其餘 14 項技術風險的設計約束及驗證項目已追溯。**無待回答的產品／資料問題**。
- **Phase 5 規劃交接**：**Ready for well-done**；兩題決策及缺漏補回，TDD 末尾完成規劃交接表及實作注意事項。**這只是可開發規劃交接，不代表程式功能或測試已通過**。
- **工作範圍**：本次只有 Markdown 規劃文件；沒有新增 SQL migration、執行刪除、修改 Runtime、建立 WebSocket 或通過任何實測。
