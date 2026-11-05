# SPEC-001-MatchingSessions — 實作前風險與缺漏稽核（RiskAudit）

**來源 MVP**：[MVP-001-LoveGameDatingApp](../requirements/MVP-001-LoveGameDatingApp.md)
**已確認 SDD**：[SPEC-001-MatchingSessions](SPEC-001-MatchingSessions.md)（2026-11-05 Q1～Q4）
**BDD**：[SPEC-001-MatchingSessions-BDD](../bdd/SPEC-001-MatchingSessions-BDD.md)
**TDD**：[SPEC-001-MatchingSessions-TDD](../tdd/SPEC-001-MatchingSessions-TDD.md)
**稽核日期**：2026-11-06
**狀態**：**已確認並完成規劃風險交接**。使用者於2026-11-05對 RQ-01、RQ-02 均採建議 A；20項風險已有緩解與文件回寫，原24項、第一輪11缺口／22測試及本輪1缺口／2測試均已加入TDD，交接為 `Ready for well-done`（未實作）。

## 一、需求追溯與真實進度

本次只針對 `SPEC-001-MatchingSessions`，MVP 主追溯 `US-004 / AC-004-01～02`，另消費 `US-002/003/012/020` 的既有資料與授權邊界，不把其他五份未規劃 SPEC 當成本次已交付。

| 指標 | 確認結果 |
|---|---|
| SDD 本份驗收 `MS-AC-001～014` | **14/14** 已找到對應 BDD（設計追溯，不是驗收通過） |
| BDD 唯一場景 | **75**：原63＋第一輪11＋本輪1場景 |
| TDD 唯一測試項 | **174**：Unit 60、Integration 64、API 31、E2E 19（原150＋前輪22＋本輪2） |
| BDD→TDD 規劃追溯 | **75/75** 場景至少兩個層級案例（不表示端點／原子細分已全面覆蓋） |
| 真實實作／驗收 | **0/75 BDD、0/174 TDD**；不存在配對功能通過證據 |
| 使用者 SDD 決策 | Q1 65/20/15軟性加權、Q2拒絕或結束永久互斥、Q3單人同時一場、Q4自動列入候選 **均已確認** |
| 風險決策／缺漏 | **RQ-01=A、RQ-02=A 已確認**；20項風險已列緩解／實作門檻，原24項補強及後續新增24項已回寫 TDD |

**AC 對照**：

| SDD 驗收 | BDD 場景數 | BDD 起迄與對應 TDD |
|---|---:|---|
| `MS-AC-001` | 3 | `MS-BDD-002`、`MS-BDD-061`、`MS-BDD-069`；對照 TDD 各測試項的「來源」欄 |
| `MS-AC-002` | 6 | `MS-BDD-005`、`MS-BDD-022`、`MS-BDD-034`、`MS-BDD-035`、`MS-BDD-063`、`MS-BDD-067`；對照 TDD 各測試項的「來源」欄 |
| `MS-AC-003` | 9 | `MS-BDD-003`、`MS-BDD-004`、`MS-BDD-016`、`MS-BDD-017`、`MS-BDD-023`、`MS-BDD-024`、`MS-BDD-025`、`MS-BDD-026`、`MS-BDD-027`；對照 TDD 各測試項的「來源」欄 |
| `MS-AC-004` | 10 | `MS-BDD-013`、`MS-BDD-014`、`MS-BDD-015`、`MS-BDD-018`、`MS-BDD-020`、`MS-BDD-028`、`MS-BDD-029`、`MS-BDD-030`、`MS-BDD-031`、`MS-BDD-032`；對照 TDD 各測試項的「來源」欄 |
| `MS-AC-005` | 9 | `MS-BDD-001`、`MS-BDD-049`、`MS-BDD-050`、`MS-BDD-064`、`MS-BDD-065`、`MS-BDD-068`、`MS-BDD-069`、`MS-BDD-074`、`MS-BDD-075`；對照 TDD 各測試項的「來源」欄 |
| `MS-AC-006` | 8 | `MS-BDD-006`、`MS-BDD-010`、`MS-BDD-011`、`MS-BDD-033`、`MS-BDD-051`、`MS-BDD-053`、`MS-BDD-054`、`MS-BDD-072`；對照 TDD 各測試項的「來源」欄 |
| `MS-AC-007` | 6 | `MS-BDD-007`、`MS-BDD-008`、`MS-BDD-045`、`MS-BDD-055`、`MS-BDD-066`、`MS-BDD-072`；對照 TDD 各測試項的「來源」欄 |
| `MS-AC-008` | 3 | `MS-BDD-009`、`MS-BDD-037`、`MS-BDD-052`；對照 TDD 各測試項的「來源」欄 |
| `MS-AC-009` | 9 | `MS-BDD-019`、`MS-BDD-021`、`MS-BDD-036`、`MS-BDD-039`、`MS-BDD-056`、`MS-BDD-057`、`MS-BDD-065`、`MS-BDD-068`、`MS-BDD-071`；對照 TDD 各測試項的「來源」欄 |
| `MS-AC-010` | 3 | `MS-BDD-012`、`MS-BDD-038`、`MS-BDD-071`；對照 TDD 各測試項的「來源」欄 |
| `MS-AC-011` | 5 | `MS-BDD-040`、`MS-BDD-041`、`MS-BDD-042`、`MS-BDD-060`、`MS-BDD-070`；對照 TDD 各測試項的「來源」欄 |
| `MS-AC-012` | 11 | `MS-BDD-043`、`MS-BDD-044`、`MS-BDD-046`、`MS-BDD-047`、`MS-BDD-048`、`MS-BDD-066`、`MS-BDD-067`、`MS-BDD-069`、`MS-BDD-073`、`MS-BDD-074`、`MS-BDD-075`；對照 TDD 各測試項的「來源」欄 |
| `MS-AC-013` | 2 | `MS-BDD-058`、`MS-BDD-059`；對照 TDD 各測試項的「來源」欄 |
| `MS-AC-014` | 1 | `MS-BDD-062`；對照 TDD 各測試項的「來源」欄 |

## 二、技術風險（依嚴重度）

| ID | 風險程度 | 已發現的規格／測試缺口 | 實際可能後果 | 建議實作／測試方向 | 處理狀態 |
|---|---|---|---|---|---|
| `MS-RA-01` | 高 | SDD §6.2 跨 pair 一人一場；只用 `game_rounds` pair UNIQUE 不足 | A 可能同時與 B、C 各開始一場 | 已在 SDD 設計 `game_round_participants.account_id UNIQUE`；真 D1 測交叉 pair 併發、雙 participant 與 ended 釋放 | 已補回文件：participants UNIQUE + 真D1 |
| `MS-RA-02` | 高 | SDD §6.3 條件更新可能 0 changes；D1 batch 雖會對 SQL 失敗回滾，但**無異常的0列更新不會自動回滾** | 回答成功但邀請未被接受，或有孤兒 round、殘留 participant、其他邀請錯誤失效 | 固定命令設計可證明行數的失敗封閉 guard，真 Miniflare D1 注入「第二筆 participant 失敗／0 changes／併發」 | 已補回文件：fail-close CAS |
| `MS-RA-03` | 高 | SDD §4.1、§5 永久排除依 account pair 歷史，但沒有說明刪除帳號後重新註冊是否算原本那個人 | 重新註冊可能再次遇到曾拒絕的人；若追蹤真人身分則造成超出本 MVP 的識別與隱私蒐集 | 建議永久排除限同一對既有 `accountId`；保留最少歷史鍵，不建立跨帳號真人追蹤（RQ-01） | RQ-01=A，已補回 |
| `MS-RA-04` | 高 | SDD §3、§8 的 `invalidated` 同時代表「與別人開始遊戲」及「資料資格變更」；單靠 status 無法區分 | 用戶可能誤認被婉拒，或畫面顯示不正確原因 | 建議邀請加受控 `invalidated_reason`（`other_round_started/eligibility_changed`），UI 僅顯示安全狀態，不能暴露對方的新對象（RQ-02） | RQ-02=A，已補回 |
| `MS-RA-05` | 高 | SDD §6.1、§6.3 配對前 reader；現有 `IAvatarAndPreferencesReader` 需要真 `RoundId` | 未配對者可能繞過授權讀取對方性向／原照／名片 | 只能新增受限內部 `IMatchingCandidateProfileReader`，先以match_conditions／active／性向／pair過濾，排序清單只回ID與總分，另以GET按需授權安全Persona | 已補回文件：受限 reader |
| `MS-RA-06` | 高 | SDD §5、§6.3 profile revision、Session 及 pair 狀態跨多步查核 | 新探索／發邀可能使用過期的條件或遊戲占用；既有pending必須保留原性向判定 | 新探索／新發邀使用最新版投影；既有pending接受只重驗帳號、成年、有效化身、遊戲占用及期限，不回溯性向；真D1測試 | 已補回文件：最新資格驗證 |
| `MS-RA-07` | 中 | SDD §4.2 目前地區選填，行政區代表座標不是實際住址；缺資料給50 | 跨縣市邊界或外島會出現不夠直覺的距離排序 | 固定完整縣市 code→代表座標版本，測同代碼距離0、外島／邊界、更新版本前後一致性；UI 說明「概略地理契合」 | 已補回文件：縣市固定對照 |
| `MS-RA-08` | 中 | SDD §4.2 興趣／生活偏好可選填，空標籤或兩人無共同可比欄位 B=0 | 資料稀疏者總分較低，可能被誤會成不適合 | 不改已確認公式；UI 不稱「科學配對」，用計算測試固定 0／100／中間值及重分配精度 | 已補回文件：空偏好規則 |
| `MS-RA-09` | 中 | SDD §5 多個 pending 中一個被接受，須一次失效雙方所有其他 incoming/outgoing | 第三人的邀請可能在遊戲中仍顯示可接受 | D1 用 pair 參與者索引查雙方向、同一 batch invalidated，並覆核原邀請未被永久拒絕 | 已補回文件：全部 pending 原子失效 |
| `MS-RA-10` | 中 | SDD §5、§7 72h 邊界、重送與反向邀請的判定 | 期限附近可能多生邀請或錯誤把過期視為拒絕 | 查伺服器時間 `now >= expires_at`；反向重送 CAS＋回查；`clientRequestId` 冪等一次成功 | 已補回文件：伺服器期限／冪等 |
| `MS-RA-11` | 中 | TDD 現有 API 項主要來自錯誤場景；9 個 REST 端點缺逐端點正常路徑及授權矩陣 | Endpoint 已接線但未被完整測試，可能漏接認證／錯誤代碼 | 補全部9條 happy API與各自401／403／409錯誤測試；含嚴格 JSON、no-store 與重送 | 已補回文件：API 成功／權限 |
| `MS-RA-12` | 中 | SDD §7 搜尋 offset 0～5000 與每次重新評分，無跨頁快照；match_conditions 候選成長後全量評分 | 大量候選延遲、跨頁重複／遺漏與讀取成本增加 | 補 0／1／20／21／5000 邊界及資料中途變更；實測具代表性資料量與 Cloudflare D1 查詢預算 | 已補回文件：分頁邊界 |
| `MS-RA-13` | 中 | `StoryDialogueAndExit` 尚未實作真正 ended 入口；本份只有終止契約 | 本份若先宣稱「可結束後再配對」，會把下一 SPEC 尚未完成功能當成本份通過 | 本份只以受控整合驗 `ended` 原子狀態轉移；完整 UX／真人中止流程留給 Story SPEC 後再做跨 SPEC 驗收 | 已補回文件：後續 SPEC 責任 |
| `MS-RA-14` | 低 | 明確婉拒是不可逆的永久決策；錯點會永久失去此 pair | 玩家可能不知道婉拒是永久性的 | BDD `MS-BDD-052` 顯示確認文案，取消 Dialog 不能寫入 declined；限流與雙端狀態一致 | 已補回文件：婉拒二次確認 |

### 2026-11-06 新增風險 6 項（原14項保留）

| ID | 程度 | 缺口 | 可能後果 | 解法 | 狀態 |
|---|---|---|---|---|---|
| `MS-RA-15` | 高 | match_conditions／user_profiles 兩份資料若分開提交，配對資料沒同步或無關Profile revision造成誤排除 | 舊條件可能錯誤放行候選，或照片排序被錯誤排除 | 僅配對欄位／資格異動時同D1原子維護，不設跨表版本檢查；無關個資不更新投影 | 已確認緩解，BDD-064/065/074，IT-057/058/063待實測 |
| `MS-RA-16` | 高 | 邀請建立後修改性向／偏好，新探索與舊邀請語意不同 | 錯誤撤銷既有邀請，或新邀請套用舊性向 | 原pending不回溯性向，只用最新條件搜尋／發新邀；接受仍驗帳號成年化身占用期限 | 已確認緩解，BDD-043/066/067，IT-043/059，API-010/028待實測 |
| `MS-RA-17` | 高 | game_round_participants 與 game_rounds 的跨pair唯一性與條件更新0changes | 一帳號同時兩場或交易半套提交 | account_id UNIQUE；真D1雙參與者同批、失敗封閉與併發測試 | 已確認緩解，BDD-070，IT-049/050/060待實測 |
| `MS-RA-18` | 中 | 全適格集合排名再分頁，人物卡按需讀取的授權與網路延遲 | 先分頁後計分會排名錯誤，逐筆API易N+1 | 先全量評分排序再分頁；POST清單只ID/score，GET單筆安全Persona，預取1～3筆 | 已確認緩解，BDD-061/069，UT-056，API-029待實測 |
| `MS-RA-19` | 中 | 登入後Profile未完成／遊戲進行中的導頁缺漏 | 玩家可能進不了配對或重開錯誤遊戲 | 登入後讀Profile與game_rounds分流，API不明安全重試；無暫停探索 | 已確認緩解，BDD-068，UT-055，ET-018待實測 |
| `MS-RA-20` | 高 | 尚未上線要求資料清除重建，R2可能留孤兒，清錯環境會毀損資料 | 刪除其他專案或非目標環境 | 只在明確確認的DatingHigh非正式local／SIT重建；R2測資清理範圍一致，不做ETL或雙寫；規劃階段不清除 | 已確認緩解，BDD-073，IT-062，API-030待實測 |

**D1 官方契約參考**：<https://developers.cloudflare.com/d1/worker-api/d1-database/> 的 `batch()` 明示一批 prepared SQL 依序執行、遇 SQL statement 失敗回滾整批；但是**條件式 UPDATE 影響0列不代表SQL錯誤**，故還須自行設計 server CAS guard 及故障注入測試。不得以泛稱「交易會回滾」替代 0 changes 的驗證。

## 三、已補回 TDD 的 24 項缺漏（未執行）

依 2026-11-05 使用者確認的兩項建議 A，原126項測試ID完全保留、下列24項各新增一個獨立測試ID，並已更新 TDD 分層進度及 AC/BDD 追溯。**已補回僅代表規劃完整，並非測試已完成**。

| 缺漏 ID | 來源 | 層級 | 建議測試名稱 | 必須驗證的關鍵結果 | 回寫 TDD ID |
|---|---|---|---|---|---|
| `MS-GAP-01` | §7／BDD-001,061 | API | `SearchCandidates_ValidReadyProfiles_ReturnsRankedCandidates` | 搜尋200、分頁及同分排序 | `MS-API-016`（未實作） |
| `MS-GAP-02` | §7／BDD-006 | API | `CreateInvitation_ValidRequest_Returns201Pending` | 建立201 pending及原子保留 | `MS-API-017`（未實作） |
| `MS-GAP-03` | §7／BDD-051 | API | `GetInvitations_AsParticipant_ReturnsSafeLists` | incoming/outgoing合法且無私有欄位 | `MS-API-018`（未實作） |
| `MS-GAP-04` | §7／BDD-007 | API | `AcceptInvitation_ValidReceiver_ReturnsSameRoundId` | 接受200、兩端同輪 | `MS-API-019`（未實作） |
| `MS-GAP-05` | §7／BDD-009 | API | `DeclineInvitation_ValidReceiver_PermanentlyExcludesPair` | 婉拒後雙向封鎖 | `MS-API-020`（未實作） |
| `MS-GAP-06` | §7／BDD-010 | API | `CancelInvitation_AsInitiator_LeavesPairEligible` | 自己取消不封鎖 | `MS-API-021`（未實作） |
| `MS-GAP-07` | §7／BDD-055 | API | `GetRounds_AsParticipant_ReturnsAtMostOneActive` | 本人一場，非本人無權 | `MS-API-022`（未實作） |
| `MS-GAP-08` | §7／BDD-055 | API | `GetRound_ById_AsParticipant_ReturnsSafeContext` | active及權限保護 | `MS-API-023`（未實作） |
| `MS-GAP-09` | §7／BDD-034 | API | `SearchCandidates_Unauthenticated_Returns401` | 登入防護與no-store | `MS-API-024`（未實作） |
| `MS-GAP-10` | §7／BDD-046 | API | `GetInvitations_NonOwner_DoesNotLeak` | 猜對方記錄不外洩 | `MS-API-025`（未實作） |
| `MS-GAP-11` | §7／BDD-046 | API | `GetRound_NonParticipant_ReturnsSafeFailure` | 猜roundId不得取得資料 | `MS-API-026`（未實作） |
| `MS-GAP-12` | §7／BDD-036 | API | `CreateInvitation_WhenParticipantActive_Returns409` | 活躍遊戲期間不產生pending | `MS-API-027`（未實作） |
| `MS-GAP-13` | §6.2／BDD-040 | Integration | `AcceptCrossPairs_SameAccount_EnforcesUniqueParticipant` | A不得同時開兩輪；其中一批完整回滾 | `MS-IT-049`（未實作） |
| `MS-GAP-14` | §6.3／BDD-045 | Integration | `AcceptInvitation_SecondParticipantFails_RollsBackWholeBatch` | 不殘留第一筆participant或round | `MS-IT-050`（未實作） |
| `MS-GAP-15` | §6.3／BDD-045,074 | Integration | `AcceptInvitation_ZeroConditionalChanges_DoesNotCommitPartialState` | 不將0列UPDATE當成功 | `MS-IT-051`（未實作） |
| `MS-GAP-16` | §6.3／BDD-039 | Integration | `AcceptInvitation_OtherPending_InvalidateBothDirections` | 同批失效兩人所有其他邀請，不永久排除第三人 | `MS-IT-052`（未實作） |
| `MS-GAP-17` | §6.2／BDD-012 | Integration | `EndRound_ReleaseTwoParticipants_StoresEndedHistoryAtomically` | 兩participant全釋放且仍永久互斥該pair | `MS-IT-053`（未實作） |
| `MS-GAP-18` | §6.2／BDD-037,038 | Integration | `SearchCandidate_DeclinedOrEndedPair_RejectsBothDirections` | 換發起方向仍不得再配 | `MS-IT-054`（未實作） |
| `MS-GAP-19` | §4.2／BDD-026,027 | Unit | `RegionScore_RepresentativeCountyCoordinates_UsesStableDistance` | 同縣市0、距離遞減、外島及對照表全集 | `MS-UT-049`（未實作） |
| `MS-GAP-20` | §4.2／BDD-013,014,015 | Unit | `CompatibilityScore_UnsetOptionalPreferences_RenormalizesWeights` | 無／只有單邊／都有；最後四捨五入 | `MS-UT-050`（未實作） |
| `MS-GAP-21` | §4.1／BDD-042 | Integration | `CreateInvitation_ExpiredPending_ReleasesPairUniqueAtomically` | 72h跨界與同pair pending UNIQUE | `MS-IT-055`（未實作） |
| `MS-GAP-22` | §3／BDD-057 | Integration | `InvalidateInvitation_DifferentReasons_PersistsSafeReason` | 區分 other_round_started／eligibility_changed；RQ-02=A | `MS-IT-056`（未實作） |
| `MS-GAP-23` | §8／BDD-052 | E2E | `DeclineDialog_Cancelled_DoesNotPermanentlyExclude` | 永久拒絕確認視窗按取消後不落地 | `MS-ET-016`（未實作） |
| `MS-GAP-24` | §5／BDD-012 | E2E | `AfterEnding_ReloadCandidates_ExcludesOldPairAndAllowsNewPair` | 下游退出完成後才驗真Web／Android端到端；未實作不得先通過 | `MS-ET-017`（未實作） |

### 2026-11-06 新增缺口11項／22項TDD（未執行）

| 缺口ID | BDD | TDD ID | 斷言 |
|---|---|---|---|
| `MS-GAP-25` | `MS-BDD-064` | `MS-UT-051`、`MS-IT-057` | 只有Ready Profile建投影，未合格資料仍保存，不檢查跨表revision |
| `MS-GAP-26` | `MS-BDD-065` | `MS-UT-052`、`MS-IT-058` | 不合格即移除搜尋投影但活躍遊戲不提前結束 |
| `MS-GAP-27` | `MS-BDD-066` | `MS-UT-053`、`MS-IT-059` | 原pending保留，接受不重驗新性向 |
| `MS-GAP-28` | `MS-BDD-067` | `MS-UT-054`、`MS-API-028` | 新搜尋與邀請使用最新性向 |
| `MS-GAP-29` | `MS-BDD-068` | `MS-UT-055`、`MS-ET-018` | 登入後狀態分流與API不確定 |
| `MS-GAP-30` | `MS-BDD-069` | `MS-UT-056`、`MS-API-029` | 排序後分頁，按需GET安全候選 |
| `MS-GAP-31` | `MS-BDD-070` | `MS-UT-057`、`MS-IT-060` | 真D1單帳號唯一占用與rollback |
| `MS-GAP-32` | `MS-BDD-071` | `MS-UT-058`、`MS-IT-061` | 遊戲結束後失格玩家不得被探索 |
| `MS-GAP-33` | `MS-BDD-072` | `MS-UT-059`、`MS-ET-019` | pending incoming/outgoing保留行動差異 |
| `MS-GAP-34` | `MS-BDD-073` | `MS-IT-062`、`MS-API-030` | 清除非正式測試資料並重建不做ETL |
| `MS-GAP-35` | `MS-BDD-074` | `MS-IT-063`、`MS-API-031` | 配對相關投影同步0changes必須fail-closed；無關個資不需同步 |

### 2026-11-06 新增缺口1項／2項 TDD（未執行）

| 缺口 ID | BDD | TDD ID | 斷言 |
|---|---|---|---|
| `MS-GAP-36` | `MS-BDD-075` | `MS-UT-060`、`MS-IT-064` | 照片排序／名片分享設定等非配對異動即使使 Profile revision 增加，也不更新 match_conditions，且玩家仍可被探索 |

## 四、使用者已確認決策（2026-11-05）

| 決策 | 使用者選擇 | 實際功能語意 | 回寫 |
|---|---|---|---|
| **RQ-01** | **A（已確認）** | 「永遠不再互相配對」僅綁定原有兩個 `accountId` 所構成的 pair。既有帳號換裝置／改個人資料不解除；刪除後新註冊的不同帳號不做真人辨識或跨帳號持久追蹤。這不代表系統保證同一真人換帳號仍被封鎖。 | MVP 配對決策、SDD §4.1／§5、BDD-038、TDD MS-IT-038／MS-IT-054 |
| **RQ-02** | **A（已確認）** | 邀請 `invalidated` 需保存受控原因 `other_round_started` 或 `eligibility_changed`，非失效狀態原因必須 NULL。前者顯示「對方目前無法配對，這次邀請已失效」，後者顯示「配對條件已變更，請重新搜尋」；不顯示對方正在和誰玩遊戲，也不外洩性向／私人偏好；兩者都不是永久婉拒。 | MVP、SDD §3／§6.2／§8、BDD-057／066／067、TDD MS-IT-056／059、MS-ET-009 |

RQ-01 的身分邊界、RQ-02 的資料欄位及文案已明確到可以交接 well-done。**沒有待使用者回答的問題**。其他12項技術風險已依本稽核表中的緩解方式及 TDD 測試作為實作驗收門檻，不能視為測試已通過。

### 2026-11-06 配對投影精簡決策（MS-D-064）
- 移除 `match_conditions.source_profile_revision`，不以 user_profiles.revision 與投影版本相等判定是否可以被探索。user_profiles.revision 保留作為原有 Profile CAS，不修改其職責。
- 僅配對資格與計分所需欄位的有效值實際變更時，同 D1 原子新增／更新／刪除 match_conditions；照片排序、私人照片管理（不影響正式化身時）、工作、自介及分享設定等非配對資料變更不更新投影，亦不影響被探索。
- 新增 BDD-075／MS-UT-060／MS-IT-064 真正驗證版本增加但條件表完全不變；配對相關更新失敗仍須原子回滾。

### 2026-11-06 追加業務與資料決策（已確認）
- 不做暫停被探索，不新增手動開關。match_conditions 合格且沒有 game_round_participants 占用即能被探索。
- 已有pending後改性向／偏好不處理原邀請，仍可在期限內按原邀請效力接受；之後新探索／新邀請只採最新資料。僅帳號停用、成年／有效化身等基本硬性資格失效可轉 eligibility_changed。
- 尚未上線，僅針對已確認DatingHigh非正式環境清除資料、重建四表及測資並清理相應R2；不要ETL，不設舊新相容，也未在本次實際清除。
- 四表正式規劃：match_conditions（只Ready資料且原子投影）、match_invitations、game_rounds、game_round_participants（account_id UNIQUE）。登入分流、全量先排序後分頁、按需安全人物卡新增第九端點。

## 五、已完成規劃風險處理與後續邊界

1. **已完成**：使用者選擇 RQ-01=A、RQ-02=A；SDD 補入 `accountId pair` 永久互斥的身分範圍及 `match_invitations.invalidated_reason` 資料欄位／CHECK／安全文案；BDD 同步相關場景。無需再請使用者決定。
2. **已完成規劃**：舊24項補強、前輪11項缺口／22項測試及本輪1項缺口／2項測試均已寫入TDD。原172項測試ID保持，總共174項（Unit60／Integration64／API31／E2E19），完成數仍為0；BDD共75場景，無任何實作完成。
3. **緩解與下游責任**：上表20項風險以已確認 A 與可執行測試作為實作契約；要用真 Miniflare D1 驗資料競態、0列UPDATE的 fail-close、狀態持久化及跨 pair 單人一場。真實退出的 UI 與完整 Web／Android E2E 待 `StoryDialogueAndExit` 接續，不能將其當成目前功能已完成或目前已通過。
4. **規劃交接**：完整交接紀錄已持久化於 [MatchingSessions TDD：規劃交接紀錄](../tdd/SPEC-001-MatchingSessions-TDD.md#規劃交接紀錄)；狀態 `Ready for well-done`，阻斷項為無。本輪沒有修改業務程式碼、API、schema/migration 或 UI，也沒有執行功能測試，停止於單一 SPEC，等待後續 `well-done`。

**稽核結論**：20項風險已記錄決策及緩解；原24項與新增12項缺口／24項補強測試**已回寫、尚未實作**。Q1～Q4、RQ-01=A、RQ-02=A及本次三項業務決策已確認；目前BDD0/75、TDD0/174，可交接 `well-done`。
