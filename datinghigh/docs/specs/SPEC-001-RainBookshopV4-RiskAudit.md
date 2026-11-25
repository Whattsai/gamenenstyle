# SPEC-001-RainBookshopV4 — 實作前風險與缺漏稽核

**範圍**：[MVP-001](../requirements/MVP-001-LoveGameDatingApp.md) 第6份 SPEC；[作者 JSON](../requirements/rain-bookshop-v4-draft.json)、[SDD](./SPEC-001-RainBookshopV4.md)、[BDD](../bdd/SPEC-001-RainBookshopV4-BDD.md)、[TDD](../tdd/SPEC-001-RainBookshopV4-TDD.md)。
**狀態**：RA-Q1～Q4 全 A 已確認；12項風險均已補回文件，16項缺漏已補入 TDD；Ready for well-done（未實作／未驗證）。
**已確認基線**：SDD RQ-01～04 全 A，倒數可配置，21表／0新欄／0 Trigger／0新公開 API；作者原文與劇本不改。非 V4 的其餘 MVP SPEC 不列本輪缺漏。

## 一、需求追溯摘要

15/15 SPEC AC、58/58 BDD 場景均有 TDD 對應（100% ID 層級追溯，非實作通過率）；42個 @frontend 場景均有 Web、Android 規劃。337個測試 ID 唯一，無孤立 BDD 或 AC 不一致；Unit 175、Integration 57、API 18、E2E 87（含1個人工 Gate B），實作0/337。下表基礎測試範圍及補強 ID 按主要 AC 統計；其他關聯場景見各 G 項。

| MVP／決策 | SPEC | BDD 場景 | TDD 測試 |
|---|---|---|---|
| AC-005-36 | RB4-AC-001 | RB4-BDD-001～RB4-BDD-004（4） | RB4-T-001～020（20） |
| AC-005-37 | RB4-AC-002 | RB4-BDD-005～RB4-BDD-008（4） | RB4-T-021～043（23） |
| AC-005-38 | RB4-AC-003 | RB4-BDD-009～RB4-BDD-012（4） | RB4-T-044～065、RB4-T-332（23） |
| AC-005-39 | RB4-AC-004 | RB4-BDD-013～RB4-BDD-016（4） | RB4-T-066～089（24） |
| AC-005-40 | RB4-AC-005 | RB4-BDD-017～RB4-BDD-019（3） | RB4-T-090～106（17） |
| AC-005-41 | RB4-AC-006 | RB4-BDD-020～RB4-BDD-020（1） | RB4-T-107～112（6） |
| AC-005-42 | RB4-AC-007 | RB4-BDD-021～RB4-BDD-022（2） | RB4-T-113～123（11） |
| AC-005-43；RQ-01、durationSeconds | RB4-AC-008 | RB4-BDD-023～RB4-BDD-033（11） | RB4-T-124～188、RB4-T-322、RB4-T-327、RB4-T-329、RB4-T-330、RB4-T-323、RB4-T-326、RB4-T-328、RB4-T-331、RB4-T-324（74） |
| AC-005-44 | RB4-AC-009 | RB4-BDD-034～RB4-BDD-037（4） | RB4-T-189～211、RB4-T-325、RB4-T-335（25） |
| AC-005-45 | RB4-AC-010 | RB4-BDD-038～RB4-BDD-041（4） | RB4-T-212～235（24） |
| AC-005-46；RQ-02/03 | RB4-AC-011 | RB4-BDD-042～RB4-BDD-046（5） | RB4-T-236～266（31） |
| AC-005-14、22、36～46；平台/安全 | RB4-AC-012 | RB4-BDD-047～RB4-BDD-051（5） | RB4-T-267～294、RB4-T-333、RB4-T-337（30） |
| AC-005-14、22；RQ-04 | RB4-AC-013 | RB4-BDD-052～RB4-BDD-054（3） | RB4-T-295～303、RB4-T-334（10） |
| AC-005-14、22 | RB4-AC-014 | RB4-BDD-055～RB4-BDD-055（1） | RB4-T-304～309（6） |
| V4 JSON 唯一權威；AC-005-36～46 | RB4-AC-015 | RB4-BDD-056～RB4-BDD-058（3） | RB4-T-310～321、RB4-T-336（13） |

作者 JSON 逐項追溯要求：scene areas/cameras/assets/audio → AC001/003/012/015；20本 books → AC002/004/008/010；4 ambient + NPC → AC003/006；I15/A13 nodes、9 bindings → AC001/004/006/007；questionCard、directorFloodInterrupt、rescueReadyGate、timedCoopRescue → AC005/007/008/009；clerkAftermath/bookmarkRitual/finalWish/endings → AC006/010/011；dynamicChatSuggestions/memoryReceipt/uiCopy → AC005/011/015。原稿 SHA 為 SPEC §3.6 指定值。此處為規劃映射；正式內容尚未編譯，不宣稱逐字 runtime 已驗證。

## 二、技術風險（按嚴重度）

| ID | 嚴重度 | 來源與具體影響 | 可執行方案 | 狀態 |
|---|---|---|---|---|
| RA-01 | 高 | SPEC §3.7/RQ-01；BDD031–033/037。閒置暫緩後如果只有有效操作才可恢復，但暫緩拒所有操作，會永遠卡住；晚到 alarm 也可能多扣時間。 | 暫緩期間提供受控的前景可操作／本人重新操作信號，不另加恢復按鈕；原操作不偷跑、回權威快照，閒置者重新參與才恢復。以15秒門檻時刻及 deadline 的先後比較，雙方恢復時重建活動基準。 | 已補回文件（RA-Q1=A） |
| RA-02 | 高 | SPEC §3.7；BDD033/037；現行 planTrackAction 以 actor submission 及單 instance 為核心，NULL actor/client_request_id 的 UNIQUE 不足以去重系統事件。 | 固定私有 system reconcile、同 D1 batch 原子驗 active Round/claims、Session、phase/revision、deadline及 operation identity；重複 alarm／跨Worker／退出競態須只有一個結果。若真 D1 時鐘 guard 或單批容量證明不足，停止提出最小方案。 | 已補回文件（RA-Q4=A） |
| RA-03 | 高 | SPEC §6.4；BDD024/030/042。縮短倒數可能讓75秒播報或30秒稱號不可達；原文有明確30/15秒。 | 全部時間參數同一釘選版本，發版驗有效範圍及數字文案；90/120合法版本、縮短越界拒發，修改既有場次拒絕。 | 已補回文件（RA-Q4=A） |
| RA-04 | 高 | SPEC §3.6；BDD025/027/056。草稿 set-a-starlight 第1與3本均在 shelves；set-b-rainlight 四個不同 Area，導演原文仍說「四個乾燥書台」。若實作強制四個不同 Area 會改動題組或原稿。 | 保留 set A/B 原始 targetAreaId 與所有原文，四個書台理解為四個取書位置而非四個不同 Area；同一 shelves 允許兩個不同合法位置，不重排書單。 | 已補回文件（RA-Q2=A） |
| RA-05 | 高 | SPEC §3.7；BDD027/028。草稿 wrongLockFeedback 要再試，但未明定錯序後已扣好的扣件是否保留、也未明定恢復中持物狀態。 | 錯扣不加分、重置本次鎖扣進度至0，已放置書仍保留；合法持物及進度於暫緩／重連權威還原，不重做整場。 | 已補回文件（RA-Q3=A） |
| RA-06 | 高 | SPEC §3.8/RQ-03；BDD012/044。背景 GET 或偽造已看見可能錯發印章；技術上不能證明真人眼睛實際注視。 | 客戶端只有窗區前景且合法符號實際渲染時送見證；server 驗本人非作者、版本、Area、phase、授權，重放冪等；將「看見」定義為可核證的實際呈現，不用眼球追蹤。 | 已補回文件（RA-Q4=A） |
| RA-07 | 高 | SPEC §3.6/3.8；BDD005/006/017/038/047/056。原稿欄位與 v2 的 speaker enum、trim、params 固定ID 不相容，盲書及私密答案可能藉 raw R2、event feed 或早期 DTO 外洩。 | 以 versioned schema 明確接受作者原文／有限 speaker，逐 scalar 比對；欄位白名單、未揭封 metadata 隔離、私密事件不可透過回放／通知泄漏，bookmark 短語只有授權結局讀取；小票永不包含玩家自由輸入。 | 已補回文件（RA-Q4=A） |
| RA-08 | 高 | SPEC §5/RQ-04；BDD052–055。Round 可有混合版本歷史、邀請永久排除及共享素材；若以 prefix 刪或留孤立 Round 會影響其他玩家。 | 精確具名清理集合、FK 拓樸及保護指紋，先驗混合版本 Round；若牽涉非驗收資料或未知環境拒絕並列出衝突，R2 只清無剩餘引用的 key，保留失敗可重試清單。 | 已補回文件（RA-Q4=A） |
| RA-09 | 中 | SPEC §3.7；BDD037/047。既有 DO alarm nonce GC、WS ticket refresh、Web 多分頁可能彼此覆蓋或把舊連線當有效活動。 | 最早到期排程，role 層有效連線與前景狀態聚合；權杖過期/撤銷、失焦、另一合法分頁、舊 session generation 逐項驗。 | 已補回文件（RA-Q4=A） |
| RA-10 | 中 | SPEC §3.6/6.1；BDD056–058。現行 graph 50,000 state、JSON 16,384/512KiB/4MiB、素材8MiB；20本書、探索重複事件與計時若直接展開笛卡兒積可能超限。 | 用有界狀態抽象合併純呈現／非阻塞資料而保留關鍵條件，實測最壞合法序列、計時及兩題組；超限不放寬 guard、不捨棄原文。 | 已補回文件（RA-Q4=A） |
| RA-11 | 中 | SPEC §3.5/3.9；BDD004/048–051。資產損壞、真 Gemini 與原生腳本搬移前路徑、背景音效、裝置效能可能使 Gate A 不可重跑。 | 核對現行 wrapper、APK、ADB、素材 decode/遮罩、記憶體與失焦停止；真供應商只驗必要已授權靜態路徑，故障不重產、不以 mock 冒充。 | 已補回文件（RA-Q4=A） |
| RA-12 | 中 | SPEC §3.5；BDD005/056/051。書目及原創自譯須核實使用地法域；音樂及封面同樣要確認權利，不把作者死亡逾70年當作所有法域一律可用。 | 實作前逐16經典與每項音樂／封面核權利證據，權利不明不發布且提出使用者決策；不能自行替換原文或使用商業譯本。 | 已補回文件（RA-Q4=A） |

## 三、TDD 缺漏測試（已補入對應層級）

每一列對應一項已補入的 TDD 案例；基線321＋16＝337。補強測試尚未執行，位置以既有模組為主。

| 缺漏 | 對應風險／來源 | 層級／優先 | 建議測試名稱 | 具體斷言 |
|---|---|---|---|---|
| G01 → RB4-T-322 | RA-01／BDD031–032 | Unit／高 | Resume_IdleRoleReturns_AutomaticallyRestartsClock | 暫緩狀態仍可核證重新參與；不以ping解除；不要求另按恢復 |
| G02 → RB4-T-323 | RA-01／BDD031–033 | Integration／高 | Reconcile_DelayedAlarm_UsesEarliestBoundary | 14999/15000ms與deadline先後；晚喚醒按應暫緩時刻計剩餘時間，無晚暫緩逆轉結算 |
| G03 → RB4-T-324 | RA-01／BDD032 | E2E／高 | Resume_RepeatedIdle_WebAndAndroidNoDeadlock | 兩真人前景實際重入、多次閒置／斷線自動恢復、原操作不重複；兩平台獨立證據 |
| G04 → RB4-T-325 | RA-02／BDD033/037 | Integration／高 | SystemCommit_NullActorReplay_ExactlyOneEvent | 真D1跨Worker重送，NULL actor 不靠 UNIQUE 去重，revision/eventSeq/結算唯一 |
| G05 → RB4-T-326 | RA-02／BDD033/046 | Integration／高 | Commit_DeadlineExitRace_RollsBackLosingMutation | 最後毫秒、系統結算、退出跨Worker競態；敗方無副作用 |
| G06 → RB4-T-327 | RA-03／BDD024/030/042 | Unit／高 | Compile_DurationThresholdMismatch_RejectsPublication | 正整數、溢位、0／負數、75門檻越界、數字文案一致；90及120合法 |
| G07 → RB4-T-328 | RA-03／BDD024 | Integration／高 | Publish_NewDuration_OldDeadlineStaysPinned | 新版120、舊版90及正在暫緩的舊版恢復，讀取舊SHA不改時間 |
| G08 → RB4-T-329 | RA-04／BDD025/056 | Unit／高 | Compile_SetARepeatedArea_PreservesFourTargets | set A 的 shelves 兩本各自正確位置，set B 四Area，不任意移書或改原文 |
| G09 → RB4-T-330 | RA-05／BDD027/028 | Unit／高 | Lock_WrongOrder_RetryWithoutLosingStoredBooks | 錯扣重置鎖扣而非已救數或已放置書，正確序列才完成 |
| G10 → RB4-T-331 | RA-05／BDD032 | Integration／高 | Restore_PausedMidHandoff_PreservesHolderAndLatch | 暫緩/重連跨持書、拖袋、扣件中間狀態；同ID不重複計數 |
| G11 → RB4-T-332 | RA-06／BDD012/044 | API／高 | Witness_StaleHiddenOrSelfSymbol_DeniesBadge | 同作者/舊版/錯區/後台 GET/失權拒發；合法目前呈現重送只一事實 |
| G12 → RB4-T-333 | RA-07／BDD006/017/038/047 | API／高 | Projection_ReplayAndRawAssets_NoPrivateDisclosure | 盲書未撕、答案未揭曉、note未授權、跨帳戶R2/WS/event feed 均無私密資料 |
| G13 → RB4-T-334 | RA-08／BDD053/054 | Integration／高 | Cleanup_MixedRoundAndSharedReference_BlocksUnsafeDeletion | 非測試輪混合版本或未知引用拒清，具名測試清理保護FK及R2共享SHA |
| G14 → RB4-T-335 | RA-09／BDD037 | Integration／中 | Alarm_NonceRefreshAndMultipleTabs_UsesEarliestDue | 多分頁、權杖撤銷、DO重啟、新nonce、deadline/idle不覆蓋更早排程 |
| G15 → RB4-T-336 | RA-10／BDD056/058 | Integration／中 | Publish_WorstReachableState_WithinExistingBounds | 最壞合法序列含探索重複、兩題組、四結局；實測JSON及graph，超限fail closed |
| G16 → RB4-T-337 | RA-11/12／BDD048–051/056 | E2E／高 | GateA_RealAssetsAndRightsAndNativeRunner_RequiresEvidence | 真Web/Android正式素材、可重跑路徑、必要供應商品質/成本、逐書與音樂權利核對均有證據；缺項不代簽 |

## 四、使用者決策（已確認）

| 決策 | 確認內容 | 回寫 |
|---|---|---|
| RA-Q1=A | 閒置者實際操作或斷線者回到可操作畫面自動恢復；仍活動方不需操作；首次恢復只同步、不計救書；晚到 alarm 依門檻時刻計算。 | MVP／SPEC §6.3、BDD031–033/037、G01–03 |
| RA-Q2=A | 四個書台為四個不同取書位置；題組 A 主書牆兩本、題組 B 原區域及所有原文保留。 | MVP／SPEC §6.3、BDD025/027/056、G08 |
| RA-Q3=A | 錯扣只重置三扣順序，已放書及已救數保留；正常倒數，不額外扣秒；重連恢復權威中間狀態。 | MVP／SPEC §6.3、BDD027/028/032、G09–10 |
| RA-Q4=A | 接受其餘技術風險處理與全部16項補強；若真環境證明不足或權利／清理衝突，停止提出最小方案，不降低 Gate 或改原稿。 | SPEC §6.3–6.4、相關 BDD、G04–07/G11–16 |

12 項風險已補回文件，16 項缺漏已逐項補入對應層級；規劃交接以 [TDD 末尾唯一紀錄](../tdd/SPEC-001-RainBookshopV4-TDD.md#規劃交接紀錄) 為準。風險已確認不等於技術風險已實際排除；所有測試尚未執行。
