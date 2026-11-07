# SPEC-001-StoryDialogueAndExit — TDD 測試清單

> **來源 MVP**：[MVP-001-LoveGameDatingApp](../requirements/MVP-001-LoveGameDatingApp.md)；**已確認 SDD**：[SPEC-001-StoryDialogueAndExit](../specs/SPEC-001-StoryDialogueAndExit.md)；**BDD**：[79 項場景](../bdd/SPEC-001-StoryDialogueAndExit-BDD.md)
> **建立日期**：2026-11-08；**狀態**：perfect-plan Phase 3，**全部未實作／未驗收**；RiskAudit 審查及決策未完成時不可標為 Ready。

## 開發進度總覽

```text
📦 StoryDialogueAndExit / Red-Green-Refactor
├─ 狀態：⏸️ 未開始
├─ BDD：0/79（0%）
├─ TDD：0/187（0%）
├─ 第一場內容：scene-01 雨聲書店完整 Gate A + 人工 Gate B 尚未執行
└─ 驗收環境：規劃 Web／Android 本地真雙端；未驗證不標成功
```

| 層級 | 已完成 | 待驗收 | 狀態 |
|---|---:|---:|---|
| Unit（純政策／UI 狀態） | 0/50 | 50 | ⏸️ |
| Integration（真 Miniflare D1） | 0/61 | 61 | ⏸️ |
| API（HTTP／WS 授權契約） | 0/37 | 37 | ⏸️ |
| E2E（Web／Android 真人） | 0/39 | 39 | ⏸️ |
| **合計** | **0/187** | **187** | **0%** |

### 實作順序與里程碑

- [ ] M1：真 D1 `0005` 向前 migration、`game_active_round_claims` 更名（不重建或合併既有表）；新增恰好四表，Round 7→9 欄並以真 D1 驗證原配對接受 rollback。
- [ ] M2：StoryRecommendation／StorySelection 純 Domain，N=0／1／2／3+ 的同交易建立或投票結算；`game_round_events` 最新有效票不使用 Offers／Votes 表。
- [ ] M3：HTTP、WebSocket DO Hibernation、標準訊息協定、一次性 ticket、事件授權投影、Cursor 補漏及 Cloudflare 中立 `IRoundRealtimeNotifier`。
- [ ] M4：已發布 `scene-01` 完整 node graph／支線／兩種結尾、兩種共用互動、Web／Android 視覺與等待體驗。
- [ ] M5：任一方平順二次確認 End；真 SQL end/write 競態、永久排除該 pair、結束後不可讀私人聊天／名片。
- [ ] M6：Gate A 真技術證據與 Gate B 使用者人工實玩分別確認；九場仍未完成不能勾原 MVP 十場 AC。

**跨層規則**：最先寫失敗測試後實作；純 UT、HTTP fixture 不得冒充 D1 原子性。HTTP／WebSocket 同用 Application，Client 不相信自身或 DO 的角色聲稱；事件只在 D1 commit 後廣播。iOS 暫緩；無障礙專項與 History／Housekeeping／保留天數均不在此 SPEC。

## 1️⃣ 單元測試（Unit）

**測試位置**：`backend/tests/DatingHigh.Unit.Tests/`、`frontend/client/tests/unit/`，以 Domain 規則／Fake notifier 驗證邊界；不驗 D1 SQL。

- [ ] **SD-UT-001** — `StartSingleStory_SDBDD001_FollowsDomainRule`（SD-AC-002、SD-AC-017、SD-AC-018）
  - **來源**：`SD-BDD-001` → `SD-AC-002`、`SD-AC-017`、`SD-AC-018`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：配對雙方合格且只有scene-01正式可玩。
  - **執行**：受邀方接受配對。
  - **斷言**：用純規則／Fake 測得『同批建立Round、唯一候選與StorySession』；並驗『兩端直接進劇情不投票』，不以假 SQL 宣稱交易原子性。

- [ ] **SD-UT-002** — `OfferTwoStories_SDBDD002_FollowsDomainRule`（SD-AC-002、SD-AC-016、SD-AC-018）
  - **來源**：`SD-BDD-002` → `SD-AC-002`、`SD-AC-016`、`SD-AC-018`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：正式有兩個可玩story_id。
  - **執行**：受邀方接受邀請。
  - **斷言**：用純規則／Fake 測得『Round同批鎖定兩個版本Catalog ID』；並驗『兩端顯示同序兩卡且必須兩人選擇』，不以假 SQL 宣稱交易原子性。

- [ ] **SD-UT-003** — `RankTopThreeStories_SDBDD003_FollowsDomainRule`（SD-AC-002、SD-AC-016、SD-AC-018）
  - **來源**：`SD-BDD-003` → `SD-AC-002`、`SD-AC-016`、`SD-AC-018`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：正式有四個可玩story_id。
  - **執行**：受邀方接受邀請。
  - **斷言**：用純規則／Fake 測得『根據兩方興趣固定排名前三個Catalog ID』；並驗『未被推薦的第四個不可投票』，不以假 SQL 宣稱交易原子性。

- [ ] **SD-UT-004** — `RankSharedInterests_SDBDD004_FollowsDomainRule`（SD-AC-002）
  - **來源**：`SD-BDD-004` → `SD-AC-002`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：雙方興趣及故事tag已合法發布。
  - **執行**：建立新配對Round。
  - **斷言**：用純規則／Fake 測得『依共同命中、兩方較少命中、總命中排序』；並驗『推薦priority與story_id決定最後同分』，不以假 SQL 宣稱交易原子性。

- [ ] **SD-UT-005** — `ResolveSameVotes_SDBDD005_FollowsDomainRule`（SD-AC-016、SD-AC-017）
  - **來源**：`SD-BDD-005` → `SD-AC-016`、`SD-AC-017`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：N為2且A已選X。
  - **執行**：B也選X。
  - **斷言**：用純規則／Fake 測得『D1只建立一筆X的StorySession』；並驗『兩端讀取相同story.selected結果』，不以假 SQL 宣稱交易原子性。

- [ ] **SD-UT-006** — `ResolveDifferentVotes_SDBDD006_FollowsDomainRule`（SD-AC-016、SD-AC-017）
  - **來源**：`SD-BDD-006` → `SD-AC-016`、`SD-AC-017`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：B是原始邀請方且A是受邀方。
  - **執行**：A選X而B選Y。
  - **斷言**：用純規則／Fake 測得『決議選Y且記錄原邀請方勝出理由』；並驗『不以先投票或ID大小替代邀請身分』，不以假 SQL 宣稱交易原子性。

- [ ] **SD-UT-007** — `RenderIntroScene_SDBDD007_FollowsDomainRule`（SD-AC-003）
  - **來源**：`SD-BDD-007` → `SD-AC-003`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：兩名玩家已進入scene-01。
  - **執行**：開啟第一個劇情節點。
  - **斷言**：用純規則／Fake 測得『顯示專屬背景、3:4人物、旁白與逐句演出』；並驗『呈現原型粉玫瑰深紫與半透明視覺』，不以假 SQL 宣稱交易原子性。

- [ ] **SD-UT-008** — `CommitSuggestedMessage_SDBDD008_FollowsDomainRule`（SD-AC-004）
  - **來源**：`SD-BDD-008` → `SD-AC-004`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：A與B在書店破冰節點。
  - **執行**：A選觀察型話題。
  - **斷言**：用純規則／Fake 測得『訊息actor是A且文字取自已釘選版次』；並驗『B只收到A真實發出的訊息』，不以假 SQL 宣稱交易原子性。

- [ ] **SD-UT-009** — `CommitFreeMessage_SDBDD009_FollowsDomainRule`（SD-AC-004、SD-AC-005）
  - **來源**：`SD-BDD-009` → `SD-AC-004`、`SD-AC-005`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：A與B在相同active Round並已連線。
  - **執行**：A送出合法文字。
  - **斷言**：用純規則／Fake 測得『D1成功後ACK再向B廣播相同事件序號』；並驗『無系統扮演B也無假已讀』，不以假 SQL 宣稱交易原子性。

- [ ] **SD-UT-010** — `ExploreWhilePending_SDBDD010_FollowsDomainRule`（SD-AC-006、SD-AC-014）
  - **來源**：`SD-BDD-010` → `SD-AC-006`、`SD-AC-014`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：A在線但B暫離。
  - **執行**：A調查書籤物件。
  - **斷言**：用純規則／Fake 測得『A取得自己的探索結果』；並驗『雙人閘門仍必須等B真人提交』，不以假 SQL 宣稱交易原子性。

- [ ] **SD-UT-011** — `ResolveCooperativeSame_SDBDD011_FollowsDomainRule`（SD-AC-006）
  - **來源**：`SD-BDD-011` → `SD-AC-006`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：雙方已進入cooperative-choice。
  - **執行**：兩人分別提交同選項。
  - **斷言**：用純規則／Fake 測得『模組結算並依故事圖推進』；並驗『不重用另一個節點互動的答題』，不以假 SQL 宣稱交易原子性。

- [ ] **SD-UT-012** — `ResolveCooperativeDifferent_SDBDD012_FollowsDomainRule`（SD-AC-006）
  - **來源**：`SD-BDD-012` → `SD-AC-006`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：兩人處於有分歧規則的合作節點。
  - **執行**：各自選擇不同答案。
  - **斷言**：用純規則／Fake 測得『依InteractionDefinition的已發布規則推進』；並驗『不套用選劇情的邀請方優先規則』，不以假 SQL 宣稱交易原子性。

- [ ] **SD-UT-013** — `AdvanceStoryBranch_SDBDD013_FollowsDomainRule`（SD-AC-007）
  - **來源**：`SD-BDD-013` → `SD-AC-007`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：主線有可達書籤支線。
  - **執行**：玩家完成支線觸發條件。
  - **斷言**：用純規則／Fake 測得『進入支線後回到指定rejoin節點』；並驗『雙方重連後主線節點一致』，不以假 SQL 宣稱交易原子性。

- [ ] **SD-UT-014** — `ResolveMultipleEndings_SDBDD014_FollowsDomainRule`（SD-AC-007）
  - **來源**：`SD-BDD-014` → `SD-AC-007`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：兩組隔離Round選擇不同分支。
  - **執行**：各自完成整章。
  - **斷言**：用純規則／Fake 測得『可達兩種不同結語及視覺結果』；並驗『不以單一intro假裝故事完成』，不以假 SQL 宣稱交易原子性。

- [ ] **SD-UT-015** — `CompleteStoryChapter_SDBDD015_FollowsDomainRule`（SD-AC-007）
  - **來源**：`SD-BDD-015` → `SD-AC-007`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：兩名玩家完成scene-01結尾。
  - **執行**：伺服器提交chapter.completed。
  - **斷言**：用純規則／Fake 測得『故事標completed而Round仍active』；並驗『兩人可繼續自由聊天不釋放Claims』，不以假 SQL 宣稱交易原子性。

- [ ] **SD-UT-016** — `EndRoundWithConfirmation_SDBDD016_FollowsDomainRule`（SD-AC-008、SD-AC-009）
  - **來源**：`SD-BDD-016` → `SD-AC-008`、`SD-AC-009`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：兩人仍在active Round。
  - **執行**：一方點結束並確認。
  - **斷言**：用純規則／Fake 測得『D1標ended且恰好釋放雙方Claims』；並驗『原account pair永遠不得再配』，不以假 SQL 宣稱交易原子性。

- [ ] **SD-UT-017** — `ProjectEndedRound_SDBDD017_FollowsDomainRule`（SD-AC-010、SD-AC-011）
  - **來源**：`SD-BDD-017` → `SD-AC-010`、`SD-AC-011`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：本輪已正式結束。
  - **執行**：原成員查status及舊聊天。
  - **斷言**：用純規則／Fake 測得『status可見ended但聊天不可取回』；並驗『不能讀取結束後新的真人名片』，不以假 SQL 宣稱交易原子性。

- [ ] **SD-UT-018** — `RecoverRealtimeCursor_SDBDD018_FollowsDomainRule`（SD-AC-012、SD-AC-019）
  - **來源**：`SD-BDD-018` → `SD-AC-012`、`SD-AC-019`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：玩家已保存上次eventSeq。
  - **執行**：WebSocket斷線後重新授權。
  - **斷言**：用純規則／Fake 測得『藉安全snapshot與游標補齊已提交事件』；並驗『不產生重複訊息或順序倒置』，不以假 SQL 宣稱交易原子性。

- [ ] **SD-UT-019** — `LoadPinnedManifest_SDBDD019_FollowsDomainRule`（SD-AC-013）
  - **來源**：`SD-BDD-019` → `SD-AC-013`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：Round已固定勝出StoryVersion。
  - **執行**：玩家開啟故事及推進節點。
  - **斷言**：用純規則／Fake 測得『取得鎖定hash的首屏與必要素材』；並驗『未選故事的巨大圖片不提前載入』，不以假 SQL 宣稱交易原子性。

- [ ] **SD-UT-020** — `VerifyFirstStoryGate_SDBDD020_FollowsDomainRule`（SD-AC-015）
  - **來源**：`SD-BDD-020` → `SD-AC-015`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：scene-01已達所有分支和互動技術條件。
  - **執行**：真人完成Web與Android實玩。
  - **斷言**：用純規則／Fake 測得『分別保留Gate A與Gate B實際證據』；並驗『其餘九場仍列未交付直到真的完成』，不以假 SQL 宣稱交易原子性。

- [ ] **SD-UT-021** — `ValidateGameContentSchema_SDBDD021_FollowsDomainRule`（SD-AC-020）
  - **來源**：`SD-BDD-021` → `SD-AC-020`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：即將套用本SPEC的migration。
  - **執行**：檢視D1 Schema。
  - **斷言**：用純規則／Fake 測得『只建一張content_與三張game_新表』；並驗『不建立Offers或Votes表或額外內容定義表』，不以假 SQL 宣稱交易原子性。

- [ ] **SD-UT-022** — `RenameActiveClaims_SDBDD022_FollowsDomainRule`（SD-AC-020）
  - **來源**：`SD-BDD-022` → `SD-AC-020`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：原0004已有game_round_participants。
  - **執行**：套用更名migration。
  - **斷言**：用純規則／Fake 測得『變為game_active_round_claims且四欄與account_id UNIQUE不變』；並驗『Matching與維運路徑同步改名』，不以假 SQL 宣稱交易原子性。

- [ ] **SD-UT-023** — `FreezeCandidateOffers_SDBDD023_FollowsDomainRule`（SD-AC-002）
  - **來源**：`SD-BDD-023` → `SD-AC-002`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：既有Round固定N個候選。
  - **執行**：玩家修改興趣或發布新版故事。
  - **斷言**：用純規則／Fake 測得『既有Catalog ID與推薦順序不變』；並驗『只有新Round可見新排名』，不以假 SQL 宣稱交易原子性。

- [ ] **SD-UT-024** — `BalanceUnsharedInterests_SDBDD024_FollowsDomainRule`（SD-AC-002）
  - **來源**：`SD-BDD-024` → `SD-AC-002`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：兩人的合法興趣沒有交集。
  - **執行**：進行新Round推薦。
  - **斷言**：用純規則／Fake 測得『先兼顧各別興趣再按priority補足』；並驗『不發明不存在的tag或假劇本』，不以假 SQL 宣稱交易原子性。

- [ ] **SD-UT-025** — `ProjectLatestVote_SDBDD025_FollowsDomainRule`（SD-AC-016）
  - **來源**：`SD-BDD-025` → `SD-AC-016`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：A已選X但B尚未選。
  - **執行**：A改選Y。
  - **斷言**：用純規則／Fake 測得『共用事件多一筆且A最新票是Y』；並驗『B仍只知道A已選』，不以假 SQL 宣稱交易原子性。

- [ ] **SD-UT-026** — `KeepPendingWhenOffline_SDBDD026_FollowsDomainRule`（SD-AC-016）
  - **來源**：`SD-BDD-026` → `SD-AC-016`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：A已選而B離線。
  - **執行**：A重新登入等待。
  - **斷言**：用純規則／Fake 測得『狀態仍是pending_story_selection』；並驗『沒有超時自動補票』，不以假 SQL 宣稱交易原子性。

- [ ] **SD-UT-027** — `DetectExitIntent_SDBDD027_FollowsDomainRule`（SD-AC-008）
  - **來源**：`SD-BDD-027` → `SD-AC-008`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：A輸入先到這邊。
  - **執行**：A觸發送出。
  - **斷言**：用純規則／Fake 測得『只有A看到是否想結束的提示』；並驗『B不知道A尚在考慮退出』，不以假 SQL 宣稱交易原子性。

- [ ] **SD-UT-028** — `ContinueAfterExitPrompt_SDBDD028_FollowsDomainRule`（SD-AC-008）
  - **來源**：`SD-BDD-028` → `SD-AC-008`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：本人看到離場語境提示。
  - **執行**：點繼續傳送。
  - **斷言**：用純規則／Fake 測得『Round保持active且訊息仍可由本人送出』；並驗『不擅自結束或通知對方』，不以假 SQL 宣稱交易原子性。

- [ ] **SD-UT-029** — `CancelEndConfirmation_SDBDD029_FollowsDomainRule`（SD-AC-008、SD-AC-009）
  - **來源**：`SD-BDD-029` → `SD-AC-008`、`SD-AC-009`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：正式結束確認Dialog已開啟。
  - **執行**：A點取消。
  - **斷言**：用純規則／Fake 測得『不呼叫end且Round仍active』；並驗『Claims及聊天不變』，不以假 SQL 宣稱交易原子性。

- [ ] **SD-UT-030** — `ReadRetiredPinnedVersion_SDBDD030_FollowsDomainRule`（SD-AC-013）
  - **來源**：`SD-BDD-030` → `SD-AC-013`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：Round已鎖定Published版本。
  - **執行**：該Catalog版本被標Retired。
  - **斷言**：用純規則／Fake 測得『舊Round仍讀原immutable版本』；並驗『新Round不再推薦退休版本』，不以假 SQL 宣稱交易原子性。

- [ ] **SD-UT-031** — `ResumeCooperativeInteraction_SDBDD031_FollowsDomainRule`（SD-AC-014）
  - **來源**：`SD-BDD-031` → `SD-AC-014`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：A已提交互動但B未選。
  - **執行**：B重登後提交真選擇。
  - **斷言**：用純規則／Fake 測得『合作依兩份有效真人答覆結算』；並驗『等待期間A仍可探索與聊天』，不以假 SQL 宣稱交易原子性。

- [ ] **SD-UT-032** — `LabelNpcAndSystem_SDBDD032_FollowsDomainRule`（SD-AC-003、SD-AC-014）
  - **來源**：`SD-BDD-032` → `SD-AC-003`、`SD-AC-014`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：故事包含系統與NPC台詞。
  - **執行**：呈現對話場景。
  - **斷言**：用純規則／Fake 測得『NPC與系統標註清楚』；並驗『沒有任何B的人物自動發言』，不以假 SQL 宣稱交易原子性。

- [ ] **SD-UT-033** — `RejectNoPublishedStory_SDBDD033_FollowsDomainRule`（SD-AC-002、SD-AC-018）
  - **來源**：`SD-BDD-033` → `SD-AC-002`、`SD-AC-018`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：存在pending邀請但沒有published完整故事。
  - **執行**：B嘗試接受。
  - **斷言**：用純規則／Fake 測得『回NO_PLAYABLE_STORY且邀請不變accepted』；並驗『沒有孤兒Round或Claims』，不以假 SQL 宣稱交易原子性。

- [ ] **SD-UT-034** — `RejectSecondPublishedVersion_SDBDD034_FollowsDomainRule`（SD-AC-002、SD-AC-020）
  - **來源**：`SD-BDD-034` → `SD-AC-002`、`SD-AC-020`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：同story_id的v1已發布。
  - **執行**：管理者把v2也設為Published。
  - **斷言**：用純規則／Fake 測得『D1部分唯一索引拒絕重複published』；並驗『舊Round仍可引用v1』，不以假 SQL 宣稱交易原子性。

- [ ] **SD-UT-035** — `StabilizeTiedRecommendation_SDBDD035_FollowsDomainRule`（SD-AC-002）
  - **來源**：`SD-BDD-035` → `SD-AC-002`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：多場故事命中指標完全相同。
  - **執行**：資料競態導致重新排名。
  - **斷言**：用純規則／Fake 測得『依priority及story_id得到同序』；並驗『兩端不見隨機結果』，不以假 SQL 宣稱交易原子性。

- [ ] **SD-UT-036** — `ValidateUnicodeMessageLength_SDBDD036_FollowsDomainRule`（SD-AC-005）
  - **來源**：`SD-BDD-036` → `SD-AC-005`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：A在合法聊天室輸入中文及emoji。
  - **執行**：分別送出1、500、501個Unicode scalar。
  - **斷言**：用純規則／Fake 測得『1及500合規而501拒絕』；並驗『不以UTF-16 code unit錯判emoji』，不以假 SQL 宣稱交易原子性。

- [ ] **SD-UT-037** — `AllocateRoundSequence_SDBDD037_FollowsDomainRule`（SD-AC-005、SD-AC-017）
  - **來源**：`SD-BDD-037` → `SD-AC-005`、`SD-AC-017`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：同Round並行發話及投票。
  - **執行**：兩端同時送出。
  - **斷言**：用純規則／Fake 測得『last_event_seq與事件sequence無重複』；並驗『同ID重播只讀原結果』，不以假 SQL 宣稱交易原子性。

- [ ] **SD-UT-038** — `SettleConcurrentVotes_SDBDD038_FollowsDomainRule`（SD-AC-017）
  - **來源**：`SD-BDD-038` → `SD-AC-017`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：兩人於N2同時選擇。
  - **執行**：並行提交D1。
  - **斷言**：用純規則／Fake 測得『UNIQUE round僅一個StorySession與一次決議』；並驗『兩端結果完全一致』，不以假 SQL 宣稱交易原子性。

- [ ] **SD-UT-039** — `ResolveLastCommittedVote_SDBDD039_FollowsDomainRule`（SD-AC-017）
  - **來源**：`SD-BDD-039` → `SD-AC-017`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：A先選X再改Y且B未投票。
  - **執行**：B提交X。
  - **斷言**：用純規則／Fake 測得『依A最後有效Y和B有效X結算』；並驗『原邀請方決勝且不可重算』，不以假 SQL 宣稱交易原子性。

- [ ] **SD-UT-040** — `RejectParallelRoundClaim_SDBDD040_FollowsDomainRule`（SD-AC-020）
  - **來源**：`SD-BDD-040` → `SD-AC-020`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：A同時收到兩組配對邀請。
  - **執行**：兩筆接受並行提交。
  - **斷言**：用純規則／Fake 測得『Claim.account_id UNIQUE防第二場』；並驗『失敗接受批次無殘留accepted』，不以假 SQL 宣稱交易原子性。

- [ ] **SD-UT-041** — `ValidateInteractionSessionForeignKey_SDBDD041_FollowsDomainRule`（SD-AC-020）
  - **來源**：`SD-BDD-041` → `SD-AC-020`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：一個故事有多節點互動。
  - **執行**：建立本節點實例。
  - **斷言**：用純規則／Fake 測得『UNIQUE(story_session_id,node_id,definition_id)防重』；並驗『不額外存round_id或story_id』，不以假 SQL 宣稱交易原子性。

### 2026-11-08 [補強] 非正式測試資料清理目標防呆

- [ ] **SD-UT-042** — `ValidateOldGamePurgeTarget_SDBDD071_RejectsUnknownOrProduction`（critical）
  - **來源**：`SD-BDD-071` → `SD-AC-020`、`SD-RQ-02=A`；**位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs` 或已有受控本地操作 policy 模組的等價測試位置。
  - **前置**：已知非正式 DatingHigh 測試 DB、未知環境或標示為正式的 DB。
  - **執行**：規劃中的舊遊戲資料清除操作進行環境及允許清理範圍檢查。
  - **斷言**：只有可核實的非正式 DatingHigh DB 可進行清理；未知環境及正式 DB 拒絕；帳號、Profile、無關資料不屬於清理集合。此項僅驗純規則，不能替代真 D1。

### 2026-11-08 [補強] SD-RQ-01=B 多場次純政策（8 項）

**界線**：這些純規則測試只證資料可擴充性；第二場 App／API 不開放。

- [ ] **SD-UT-043** — `ValidateEpisodeSequence_AfterFirstComplete_AllowsSecondSession`（critical）
  - **來源**：`SD-BDD-072` → `SD-AC-017/020`，`SD-RQ-01=B`；**位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`。
  - **前置**：同 Round 已有 completed episodeSeq=1。
  - **執行**：建立 episodeSeq=2 的純政策流程。
  - **斷言**：不同 episode 可擁有不同 storySessionId、版次與進度，episode>=1 且不把章節分支視為新場。

- [ ] **SD-UT-044** — `ValidateSinglePlayingEpisode_WithPreviousPlaying_RejectsNext`（critical）
  - **來源**：`SD-BDD-073` → `SD-AC-017/020`，`SD-RQ-01=B`；**位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`。
  - **前置**：同 Round episodeSeq=1 為 playing。
  - **執行**：嘗試再開 episodeSeq=2。
  - **斷言**：純政策拒絕同輪兩個 playing，合法完成後可新增下一場。

- [ ] **SD-UT-045** — `FreezeLaterEpisodeOffers_UsesRoundEventNotRoundJson`（critical）
  - **來源**：`SD-BDD-074` → `SD-AC-017/020`，`SD-RQ-01=B`；**位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`。
  - **前置**：Round 初始候選已鎖定且第 1 場 completed。
  - **執行**：規劃下一場可玩故事排名快照。
  - **斷言**：新場候選放 episodeSeq=2 的 offers.frozen event，初始候選 JSON 保留不變。

- [ ] **SD-UT-046** — `ResolveVotes_ByEpisodeAndActor_DoesNotReadEarlierVotes`（critical）
  - **來源**：`SD-BDD-075` → `SD-AC-017/020`，`SD-RQ-01=B`；**位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`。
  - **前置**：同 Round 第 1 場和第 2 場有分別的已提交投票事件。
  - **執行**：取得第 2 場 A、B 最後有效票。
  - **斷言**：從同 episode 的選票重建決議，禁止跨 episode／先舊重播覆蓋新票。

- [ ] **SD-UT-047** — `ValidateStoryAction_WithForeignStorySession_RejectsCrossEpisode`（critical）
  - **來源**：`SD-BDD-076` → `SD-AC-017/020`，`SD-RQ-01=B`；**位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`。
  - **前置**：第 1 場與第 2 場 Session ID／node／revision 不同。
  - **執行**：以第 1 場動作提交第 2 場。
  - **斷言**：拒絕錯 Session，Round chat 仍不強制綁 storySessionId。

- [ ] **SD-UT-048** — `ValidateCurrentEditionEpisode_AboveOne_IsDisabled`（critical）
  - **來源**：`SD-BDD-077` → `SD-AC-017/020`，`SD-RQ-01=B`；**位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`。
  - **前置**：本期功能旗標固定只開第 1 場，Episode2 未啟用。
  - **執行**：Client 嘗試發送第二場啟動／投票／互動。
  - **斷言**：伺服器政策拒絕 episodeSeq>1，不產生假 StorySession。

- [ ] **SD-UT-049** — `ValidateNewEpisodeStart_WhenPriorIncompleteOrEnded_Rejects`（critical）
  - **來源**：`SD-BDD-078` → `SD-AC-017/020`，`SD-RQ-01=B`；**位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`。
  - **前置**：前一場 playing、待選或 Round ended。
  - **執行**：評估未來凍結新場候選。
  - **斷言**：只在 Round active 且前一場 completed 且兩 Claims 有效時允許資料層測試建立後續場次。

- [ ] **SD-UT-050** — `ProjectStoryEvents_WithEpisodeSeq_PreservesFirstAndFuture`（critical）
  - **來源**：`SD-BDD-079` → `SD-AC-017/020`，`SD-RQ-01=B`；**位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`。
  - **前置**：事件流包含第 1 場及隔離測試的第 2 場選場與 node 事件。
  - **執行**：伺服器組合 experience／snapshot。
  - **斷言**：episodeSeq=1 與 2 不混淆，故事事件攜帶 storySessionId，Round chat 不被強制歸屬故事。

## 2️⃣ 集成測試（Integration）

**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts` 等真 Miniflare D1、`tests/integration/story-dialogue-live.test.mjs`。包括交易失敗注入、migration／改名、跨 Round、D1 commit 與 DO 廣播失敗、完整 eventSeq。

- [ ] **SD-IT-001** — `StartSingleStory_SDBDD001_CommitsAtomically`（SD-AC-002、SD-AC-017、SD-AC-018）
  - **來源**：`SD-BDD-001` → `SD-AC-002`、`SD-AC-017`、`SD-AC-018`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：配對雙方合格且只有scene-01正式可玩。
  - **執行**：受邀方接受配對。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『同批建立Round、唯一候選與StorySession』與『兩端直接進劇情不投票』；檢查沒有部分提交。

- [ ] **SD-IT-002** — `OfferTwoStories_SDBDD002_CommitsAtomically`（SD-AC-002、SD-AC-016、SD-AC-018）
  - **來源**：`SD-BDD-002` → `SD-AC-002`、`SD-AC-016`、`SD-AC-018`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：正式有兩個可玩story_id。
  - **執行**：受邀方接受邀請。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『Round同批鎖定兩個版本Catalog ID』與『兩端顯示同序兩卡且必須兩人選擇』；檢查沒有部分提交。

- [ ] **SD-IT-003** — `RankTopThreeStories_SDBDD003_CommitsAtomically`（SD-AC-002、SD-AC-016、SD-AC-018）
  - **來源**：`SD-BDD-003` → `SD-AC-002`、`SD-AC-016`、`SD-AC-018`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：正式有四個可玩story_id。
  - **執行**：受邀方接受邀請。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『根據兩方興趣固定排名前三個Catalog ID』與『未被推薦的第四個不可投票』；檢查沒有部分提交。

- [ ] **SD-IT-004** — `RankSharedInterests_SDBDD004_CommitsAtomically`（SD-AC-002）
  - **來源**：`SD-BDD-004` → `SD-AC-002`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：雙方興趣及故事tag已合法發布。
  - **執行**：建立新配對Round。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『依共同命中、兩方較少命中、總命中排序』與『推薦priority與story_id決定最後同分』；檢查沒有部分提交。

- [ ] **SD-IT-005** — `ResolveSameVotes_SDBDD005_CommitsAtomically`（SD-AC-016、SD-AC-017）
  - **來源**：`SD-BDD-005` → `SD-AC-016`、`SD-AC-017`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：N為2且A已選X。
  - **執行**：B也選X。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『D1只建立一筆X的StorySession』與『兩端讀取相同story.selected結果』；檢查沒有部分提交。

- [ ] **SD-IT-006** — `ResolveDifferentVotes_SDBDD006_CommitsAtomically`（SD-AC-016、SD-AC-017）
  - **來源**：`SD-BDD-006` → `SD-AC-016`、`SD-AC-017`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：B是原始邀請方且A是受邀方。
  - **執行**：A選X而B選Y。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『決議選Y且記錄原邀請方勝出理由』與『不以先投票或ID大小替代邀請身分』；檢查沒有部分提交。

- [ ] **SD-IT-007** — `EndRoundWithConfirmation_SDBDD016_CommitsAtomically`（SD-AC-008、SD-AC-009）
  - **來源**：`SD-BDD-016` → `SD-AC-008`、`SD-AC-009`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：兩人仍在active Round。
  - **執行**：一方點結束並確認。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『D1標ended且恰好釋放雙方Claims』與『原account pair永遠不得再配』；檢查沒有部分提交。

- [ ] **SD-IT-008** — `RecoverRealtimeCursor_SDBDD018_CommitsAtomically`（SD-AC-012、SD-AC-019）
  - **來源**：`SD-BDD-018` → `SD-AC-012`、`SD-AC-019`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：玩家已保存上次eventSeq。
  - **執行**：WebSocket斷線後重新授權。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『藉安全snapshot與游標補齊已提交事件』與『不產生重複訊息或順序倒置』；檢查沒有部分提交。

- [ ] **SD-IT-009** — `ValidateGameContentSchema_SDBDD021_CommitsAtomically`（SD-AC-020）
  - **來源**：`SD-BDD-021` → `SD-AC-020`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：即將套用本SPEC的migration。
  - **執行**：檢視D1 Schema。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『只建一張content_與三張game_新表』與『不建立Offers或Votes表或額外內容定義表』；檢查沒有部分提交。

- [ ] **SD-IT-010** — `RenameActiveClaims_SDBDD022_CommitsAtomically`（SD-AC-020）
  - **來源**：`SD-BDD-022` → `SD-AC-020`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：原0004已有game_round_participants。
  - **執行**：套用更名migration。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『變為game_active_round_claims且四欄與account_id UNIQUE不變』與『Matching與維運路徑同步改名』；檢查沒有部分提交。

- [ ] **SD-IT-011** — `FreezeCandidateOffers_SDBDD023_CommitsAtomically`（SD-AC-002）
  - **來源**：`SD-BDD-023` → `SD-AC-002`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：既有Round固定N個候選。
  - **執行**：玩家修改興趣或發布新版故事。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『既有Catalog ID與推薦順序不變』與『只有新Round可見新排名』；檢查沒有部分提交。

- [ ] **SD-IT-012** — `BalanceUnsharedInterests_SDBDD024_CommitsAtomically`（SD-AC-002）
  - **來源**：`SD-BDD-024` → `SD-AC-002`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：兩人的合法興趣沒有交集。
  - **執行**：進行新Round推薦。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『先兼顧各別興趣再按priority補足』與『不發明不存在的tag或假劇本』；檢查沒有部分提交。

- [ ] **SD-IT-013** — `ProjectLatestVote_SDBDD025_CommitsAtomically`（SD-AC-016）
  - **來源**：`SD-BDD-025` → `SD-AC-016`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：A已選X但B尚未選。
  - **執行**：A改選Y。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『共用事件多一筆且A最新票是Y』與『B仍只知道A已選』；檢查沒有部分提交。

- [ ] **SD-IT-014** — `ReadRetiredPinnedVersion_SDBDD030_CommitsAtomically`（SD-AC-013）
  - **來源**：`SD-BDD-030` → `SD-AC-013`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：Round已鎖定Published版本。
  - **執行**：該Catalog版本被標Retired。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『舊Round仍讀原immutable版本』與『新Round不再推薦退休版本』；檢查沒有部分提交。

- [ ] **SD-IT-015** — `RejectNoPublishedStory_SDBDD033_CommitsAtomically`（SD-AC-002、SD-AC-018）
  - **來源**：`SD-BDD-033` → `SD-AC-002`、`SD-AC-018`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：存在pending邀請但沒有published完整故事。
  - **執行**：B嘗試接受。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『回NO_PLAYABLE_STORY且邀請不變accepted』與『沒有孤兒Round或Claims』；檢查沒有部分提交。

- [ ] **SD-IT-016** — `RejectSecondPublishedVersion_SDBDD034_CommitsAtomically`（SD-AC-002、SD-AC-020）
  - **來源**：`SD-BDD-034` → `SD-AC-002`、`SD-AC-020`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：同story_id的v1已發布。
  - **執行**：管理者把v2也設為Published。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『D1部分唯一索引拒絕重複published』與『舊Round仍可引用v1』；檢查沒有部分提交。

- [ ] **SD-IT-017** — `StabilizeTiedRecommendation_SDBDD035_CommitsAtomically`（SD-AC-002）
  - **來源**：`SD-BDD-035` → `SD-AC-002`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：多場故事命中指標完全相同。
  - **執行**：資料競態導致重新排名。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『依priority及story_id得到同序』與『兩端不見隨機結果』；檢查沒有部分提交。

- [ ] **SD-IT-018** — `ValidateUnicodeMessageLength_SDBDD036_CommitsAtomically`（SD-AC-005）
  - **來源**：`SD-BDD-036` → `SD-AC-005`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：A在合法聊天室輸入中文及emoji。
  - **執行**：分別送出1、500、501個Unicode scalar。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『1及500合規而501拒絕』與『不以UTF-16 code unit錯判emoji』；檢查沒有部分提交。

- [ ] **SD-IT-019** — `AllocateRoundSequence_SDBDD037_CommitsAtomically`（SD-AC-005、SD-AC-017）
  - **來源**：`SD-BDD-037` → `SD-AC-005`、`SD-AC-017`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：同Round並行發話及投票。
  - **執行**：兩端同時送出。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『last_event_seq與事件sequence無重複』與『同ID重播只讀原結果』；檢查沒有部分提交。

- [ ] **SD-IT-020** — `SettleConcurrentVotes_SDBDD038_CommitsAtomically`（SD-AC-017）
  - **來源**：`SD-BDD-038` → `SD-AC-017`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：兩人於N2同時選擇。
  - **執行**：並行提交D1。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『UNIQUE round僅一個StorySession與一次決議』與『兩端結果完全一致』；檢查沒有部分提交。

- [ ] **SD-IT-021** — `ResolveLastCommittedVote_SDBDD039_CommitsAtomically`（SD-AC-017）
  - **來源**：`SD-BDD-039` → `SD-AC-017`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：A先選X再改Y且B未投票。
  - **執行**：B提交X。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『依A最後有效Y和B有效X結算』與『原邀請方決勝且不可重算』；檢查沒有部分提交。

- [ ] **SD-IT-022** — `RejectParallelRoundClaim_SDBDD040_CommitsAtomically`（SD-AC-020）
  - **來源**：`SD-BDD-040` → `SD-AC-020`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：A同時收到兩組配對邀請。
  - **執行**：兩筆接受並行提交。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『Claim.account_id UNIQUE防第二場』與『失敗接受批次無殘留accepted』；檢查沒有部分提交。

- [ ] **SD-IT-023** — `ValidateInteractionSessionForeignKey_SDBDD041_CommitsAtomically`（SD-AC-020）
  - **來源**：`SD-BDD-041` → `SD-AC-020`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：一個故事有多節點互動。
  - **執行**：建立本節點實例。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『UNIQUE(story_session_id,node_id,definition_id)防重』與『不額外存round_id或story_id』；檢查沒有部分提交。

- [ ] **SD-IT-024** — `AuthorizeRoundMember_SDBDD042_CommitsAtomically`（SD-AC-001）
  - **來源**：`SD-BDD-042` → `SD-AC-001`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：C不是本Round成員。
  - **執行**：C查experience、events、ticket和WS。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『各入口拒絕且不洩漏房間內容』與『無故事、人物或私有資料外洩』；檢查沒有部分提交。

- [ ] **SD-IT-025** — `RejectRevokedSession_SDBDD043_CommitsAtomically`（SD-AC-001、SD-AC-012）
  - **來源**：`SD-BDD-043` → `SD-AC-001`、`SD-AC-012`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：A新裝置登入撤銷舊family。
  - **執行**：舊裝置繼續發WS命令。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『D1拒寫且連線被重驗或關閉』與『無舊身份發話』；檢查沒有部分提交。

- [ ] **SD-IT-026** — `RejectUnsafeChatPayload_SDBDD044_CommitsAtomically`（SD-AC-005）
  - **來源**：`SD-BDD-044` → `SD-AC-005`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：A輸入危險控制字元或HTML。
  - **執行**：呼叫文字提交。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『回INVALID_STORY_REQUEST且沒有事件』與『客戶端亦不執行HTML』；檢查沒有部分提交。

- [ ] **SD-IT-027** — `RejectForeignVoteCatalog_SDBDD045_CommitsAtomically`（SD-AC-016、SD-AC-017）
  - **來源**：`SD-BDD-045` → `SD-AC-016`、`SD-AC-017`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：本Round候選是X與Y。
  - **執行**：A提交catalogId Z並假稱B為actor。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『伺服器依A Session及Round白名單拒絕』與『沒有事件或Session狀態改變』；檢查沒有部分提交。

- [ ] **SD-IT-028** — `RedactPrivateVoteEvent_SDBDD046_CommitsAtomically`（SD-AC-016）
  - **來源**：`SD-BDD-046` → `SD-AC-016`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：A已選X而B還沒選。
  - **執行**：B用events query、snapshot及WS恢復。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『B只能知道A已選而不知Catalog ID』與『原始story.vote.submitted的payload不得外洩』；檢查沒有部分提交。

- [ ] **SD-IT-029** — `RejectVoteAfterSelected_SDBDD047_CommitsAtomically`（SD-AC-017）
  - **來源**：`SD-BDD-047` → `SD-AC-017`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：N1已在接受邀請時直接開始。
  - **執行**：任何成員呼叫story/vote。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『回STORY_ALREADY_SELECTED』與『不生成虛構選票』；檢查沒有部分提交。

- [ ] **SD-IT-030** — `RejectAfterRoundEnd_SDBDD048_CommitsAtomically`（SD-AC-010）
  - **來源**：`SD-BDD-048` → `SD-AC-010`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：A的end與B的聊天交錯。
  - **執行**：end先提交成功。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『B收到ROUND_NOT_ACTIVE』與『不產生ended後新事件』；檢查沒有部分提交。

- [ ] **SD-IT-031** — `DenyEndedEventHistory_SDBDD049_CommitsAtomically`（SD-AC-010、SD-AC-011）
  - **來源**：`SD-BDD-049` → `SD-AC-010`、`SD-AC-011`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：原成員留有舊eventSeq。
  - **執行**：結束後查events或experience。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『無法取得先前私人聊天及互動』與『仍可查安全ended狀態』；檢查沒有部分提交。

- [ ] **SD-IT-032** — `ValidateSingleUseTicket_SDBDD050_CommitsAtomically`（SD-AC-012）
  - **來源**：`SD-BDD-050` → `SD-AC-012`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：A曾使用合法短效ticket。
  - **執行**：重播或換Round／裝置使用。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『WS Upgrade拒絕』與『長效Access與Refresh絕不載入URL』；檢查沒有部分提交。

- [ ] **SD-IT-033** — `RecoverAfterMissedBroadcast_SDBDD051_CommitsAtomically`（SD-AC-012）
  - **來源**：`SD-BDD-051` → `SD-AC-012`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：D1已commit一則聊天。
  - **執行**：DO在推播前崩潰。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『B重連取得該筆且不重複』與『A用同requestId只讀原receipt』；檢查沒有部分提交。

- [ ] **SD-IT-034** — `ValidateStoryGraphManifest_SDBDD052_CommitsAtomically`（SD-AC-013）
  - **來源**：`SD-BDD-052` → `SD-AC-013`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：草稿缺ending或參照無效。
  - **執行**：內容工具檢查發布。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『Catalog不得標published』與『不出現在推薦候選』；檢查沒有部分提交。

- [ ] **SD-IT-035** — `RejectPrivateMediaAsset_SDBDD053_CommitsAtomically`（SD-AC-013、SD-AC-020）
  - **來源**：`SD-BDD-053` → `SD-AC-013`、`SD-AC-020`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：劇情manifest指向私人會員照片key。
  - **執行**：嘗試發布或由公開路由讀取。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『拒絕存取與洩漏key』與『只有核准公開劇情資產可讀』；檢查沒有部分提交。

- [ ] **SD-IT-036** — `VerifyRenamedClaimQueries_SDBDD054_CommitsAtomically`（SD-AC-020）
  - **來源**：`SD-BDD-054` → `SD-AC-020`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：schema已更名為game_active_round_claims。
  - **執行**：執行Matching與維運真D1完整測試。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『舊表名存取必失敗而非誤判通過』與『占用及釋放仍同批保障』；檢查沒有部分提交。

- [ ] **SD-IT-037** — `MeasureRealtimeIsolation_SDBDD070_CommitsAtomically`（SD-AC-005、SD-AC-012、SD-AC-019）
  - **來源**：`SD-BDD-070` → `SD-AC-005`、`SD-AC-012`、`SD-AC-019`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：隔離兩個Round與WebSocket。
  - **執行**：並行發訊與重連。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『各房間事件只推本房間』與『記錄commit到顯示、DO喚醒、Container冷啟動量測』；檢查沒有部分提交。

- [ ] **SD-IT-038** — `StartSingleStory_SDBDD001_RollsBackAtAnyStep`（SD-AC-002、SD-AC-017、SD-AC-018）
  - **來源**：`SD-BDD-001` → `SD-AC-002`、`SD-AC-017`、`SD-AC-018`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：接收邀請 transaction 依次寫 accepted、Round、Claims、候選、StorySession、event。
  - **執行**：注入任一步 0 changes、FK、UNIQUE 或 SQL error。
  - **斷言**：任一步失敗整個 D1 batch 回滾；無 accepted／孤兒 Round／Claims／部分事件。

- [ ] **SD-IT-039** — `OfferTwoStories_SDBDD002_VerifiesInterestSnapshotDuringAccept`（SD-AC-002、SD-AC-016、SD-AC-018）
  - **來源**：`SD-BDD-002` → `SD-AC-002`、`SD-AC-016`、`SD-AC-018`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：配對 accept 前已有合法興趣與內容快照。
  - **執行**：在預查與 commit 間改變 Profile 的配對興趣。
  - **斷言**：不得用過期排名成功接受；重算後才建立 Round。

- [ ] **SD-IT-040** — `RankTopThreeStories_SDBDD003_RejectsCatalogPublishRace`（SD-AC-002、SD-AC-016、SD-AC-018）
  - **來源**：`SD-BDD-003` → `SD-AC-002`、`SD-AC-016`、`SD-AC-018`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：排名時有三個 published Catalog。
  - **執行**：提交前其中一個 retired 或改版。
  - **斷言**：同批 guard 拒用舊候選且無部分寫入。

- [ ] **SD-IT-041** — `RenameActiveClaims_SDBDD022_PreservesExistingActiveClaims`（SD-AC-020）
  - **來源**：`SD-BDD-022` → `SD-AC-020`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：原始0004已有active Round與Claim。
  - **執行**：在測試 D1 套用更名 migration 並跑 list/get/end。
  - **斷言**：舊四欄、帳號 UNIQUE、兩筆釋放及既有紀錄完整。

- [ ] **SD-IT-042** — `ProjectLatestVote_SDBDD025_ReconstructsLatestCommittedVote`（SD-AC-016）
  - **來源**：`SD-BDD-025` → `SD-AC-016`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：A多次改票且最後事件包含正確actor。
  - **執行**：B投票與A再次改票競態。
  - **斷言**：按 sequence 線性化讀兩人各自最新有效票；舊冪等不能覆寫。

- [ ] **SD-IT-043** — `SettleConcurrentVotes_SDBDD038_SettlesTwoVotesOnce`（SD-AC-017）
  - **來源**：`SD-BDD-038` → `SD-AC-017`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：兩端 vote 與 end 競態。
  - **執行**：並行提交兩份票與 end。
  - **斷言**：只有已成功提交於 end 前的業務有效，StorySession 不可在 ended 後出生。

- [ ] **SD-IT-044** — `RedactPrivateVoteEvent_SDBDD046_KeepsCursorDespiteRedaction`（SD-AC-016）
  - **來源**：`SD-BDD-046` → `SD-AC-016`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：A已投票且B需從 afterSeq 重連。
  - **執行**：過濾對方原始投票再增量翻頁。
  - **斷言**：游標不漏後續授權事件、不洩漏A選的Catalog ID或hidden payload。

- [ ] **SD-IT-045** — `RecoverAfterMissedBroadcast_SDBDD051_ReadsSameReceiptAfterCrash`（SD-AC-012）
  - **來源**：`SD-BDD-051` → `SD-AC-012`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：D1 commit 成功但DO廣播前消失。
  - **執行**：A以同 clientRequestId 查回receipt。
  - **斷言**：只有一筆原事件，重推或補漏不重複。

- [ ] **SD-IT-046** — `ValidateStoryGraphManifest_SDBDD052_PublishesVersionAtomically`（SD-AC-013）
  - **來源**：`SD-BDD-052` → `SD-AC-013`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：首發內容圖、語言、節點及checksum齊全。
  - **執行**：publish前後更新同Story版次。
  - **斷言**：immutable的舊版保留，unique published及R2 manifest hash符合。

- [ ] **SD-IT-047** — `RejectPrivateMediaAsset_SDBDD053_BlocksPrivateR2ViaPublicRoute`（SD-AC-013、SD-AC-020）
  - **來源**：`SD-BDD-053` → `SD-AC-013`、`SD-AC-020`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：同時存在私人FILES與公開story資產。
  - **執行**：透過story content route試探私人照片key。
  - **斷言**：回拒絕且不得曝光PRIVATE URL、明文key或其他人的照片。

### 2026-11-08 [補強] 舊遊戲資料清理及新版 Schema 驗證

- [ ] **SD-IT-048** — `RebuildOldGameData_SDBDD071_UsesFreshSchemaOnly`（critical）
  - **來源**：`SD-BDD-071` → `SD-AC-020`、`SD-RQ-02=A`；**位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`、受控 local DB 建置測試。
  - **前置**：明確非正式測試 DB 中預先建立舊 active／ended Round、兩筆 Claims 與必要關聯邀請，同時建立不相關帳號與 Profile。
  - **執行**：實作期依正式受控清理程序清除全部舊遊戲資料及必要依賴，再套用 0005 並建立新版單故事與雙候選 Round 測資。
  - **斷言**：舊 Round／Claims／依賴測資已清理，沒有孤兒 accepted 邀請；帳號／Profile 保留；新版必填候選可正常建立並受 FK／UNIQUE 約束保護；不為舊 Round 偽造版本資料。

- [ ] **SD-IT-049** — `RebuildOldGameData_SDBDD071_FailsClosedAndRollsBack`（critical）
  - **來源**：`SD-BDD-071` → `SD-AC-020`、`SD-RQ-02=A`；**位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`、受控 local DB 建置測試。
  - **前置**：在受控 DB 建立舊遊戲記錄、外鍵依賴與非遊戲使用者資料。
  - **執行**：對清理操作注入零列／SQL 錯誤，並對未知環境執行清理防護負例。
  - **斷言**：失敗即回滾而不產生半清理狀態；未知環境不得刪除任何資料；即使清理舊遊戲，也不改動帳號／Profile 或其他專案資料。

### 2026-11-08 [補強] SD-RQ-01=B 真 D1 多場次資料／競態（12 項）

**界線**：本期只透過隔離 fixture 驗 episode 2 的資料表、事件格式、關聯、唯一索引與 fail-closed；不新增正式第二場啟動功能。

- [ ] **SD-IT-050** — `PersistSequentialStorySessions_SameRound_DistinctEpisode`（critical）
  - **來源**：`SD-BDD-072` → `SD-AC-017/020`，`SD-RQ-01=B`；**位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`（真 Miniflare D1，不使用 HTTP fixture 假裝 SQL 交易）。
  - **前置**：真 Miniflare D1 已有第一場 completed Session。
  - **執行**：插入 episodeSeq=2 playing Session。
  - **斷言**：兩筆共存、各自保留 node／version 且沒有第五張表。

- [ ] **SD-IT-051** — `InsertSecondPlayingSession_WhileFirstPlaying_RollsBack`（critical）
  - **來源**：`SD-BDD-073` → `SD-AC-017/020`，`SD-RQ-01=B`；**位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`（真 Miniflare D1，不使用 HTTP fixture 假裝 SQL 交易）。
  - **前置**：同輪第 1 場狀態 playing。
  - **執行**：並行插入第二場 playing。
  - **斷言**：部分 UNIQUE playing 索引阻止雙開，D1 batch 全回滾。

- [ ] **SD-IT-052** — `FreezeEpisodeTwoCandidates_WithRoundEvent_PreservesInitialJson`（critical）
  - **來源**：`SD-BDD-074` → `SD-AC-017/020`，`SD-RQ-01=B`；**位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`（真 Miniflare D1，不使用 HTTP fixture 假裝 SQL 交易）。
  - **前置**：初始候選 JSON 為第 1 場固定 A/B，第一場完成。
  - **執行**：注入有效 episodeSeq=2 offers.frozen 系統事件。
  - **斷言**：第 2 場候選可從事件重建、Round JSON 仍是原 A/B。

- [ ] **SD-IT-053** — `SelectSecondEpisode_WithEarlierVotes_UsesOnlyCurrentVote`（critical）
  - **來源**：`SD-BDD-075` → `SD-AC-017/020`，`SD-RQ-01=B`；**位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`（真 Miniflare D1，不使用 HTTP fixture 假裝 SQL 交易）。
  - **前置**：兩位玩家在第 1 場各有票、第二場各有新票。
  - **執行**：結算第 2 場並解析 A/B 每人最後有效票。
  - **斷言**：不採舊票或跨場選項；同回合事件序號有序。

- [ ] **SD-IT-054** — `SubmitInteraction_WithWrongStorySession_RejectsAndRollsBack`（critical）
  - **來源**：`SD-BDD-076` → `SD-AC-017/020`，`SD-RQ-01=B`；**位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`（真 Miniflare D1，不使用 HTTP fixture 假裝 SQL 交易）。
  - **前置**：兩個不同 Session 各有互動實例及不同節點。
  - **執行**：把舊場次 interactionInstance 或 nodeId 指向新場次。
  - **斷言**：FK／SQL guard 拒絕跨 Session 寫入，不改動任何節點進度。

- [ ] **SD-IT-055** — `FreezeNextEpisode_BeforePriorCompleted_FailsClosed`（critical）
  - **來源**：`SD-BDD-078` → `SD-AC-017/020`，`SD-RQ-01=B`；**位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`（真 Miniflare D1，不使用 HTTP fixture 假裝 SQL 交易）。
  - **前置**：同 Round 前一場 playing。
  - **執行**：嘗試追加新場 offers.frozen 並建立新 Session。
  - **斷言**：SQL guard 必須 fail closed，不能留下孤兒投票／事件。

- [ ] **SD-IT-056** — `CommitInitialEpisodeOne_UsesScopedEventPayload`（critical）
  - **來源**：`SD-BDD-079` → `SD-AC-017/020`，`SD-RQ-01=B`；**位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`（真 Miniflare D1，不使用 HTTP fixture 假裝 SQL 交易）。
  - **前置**：真 D1 測試 N1 接受與 N2 兩票結算各一輪。
  - **執行**：檢查 story.selected 和 story.vote.submitted 事件。
  - **斷言**：均攜帶 episodeSeq=1；選定事件綁 storySessionId，符合最後有效票。

- [ ] **SD-IT-057** — `InsertDuplicateEpisodeSequence_InSameRound_Rejects`（critical）
  - **來源**：`SD-BDD-072` → `SD-AC-017/020`，`SD-RQ-01=B`；**位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`（真 Miniflare D1，不使用 HTTP fixture 假裝 SQL 交易）。
  - **前置**：真 D1 已存在 (roundId,episodeSeq=1)。
  - **執行**：插入相同 roundId 與 episodeSeq=1 的第二筆。
  - **斷言**：UNIQUE(round_id,episode_seq) 拒絕且原 StorySession 未變。

- [ ] **SD-IT-058** — `CompleteFirstThenCreateSecond_PartialUniqueReleases`（critical）
  - **來源**：`SD-BDD-073` → `SD-AC-017/020`，`SD-RQ-01=B`；**位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`（真 Miniflare D1，不使用 HTTP fixture 假裝 SQL 交易）。
  - **前置**：第 1 場 playing，第二場尚未存在。
  - **執行**：原子 completed 第一場後建立 episodeSeq=2 playing。
  - **斷言**：資料庫允許新 playing、歷史完成場次保留；只有一場 playing。

- [ ] **SD-IT-059** — `FreezeSameEpisodeTwice_InRacingBatches_Rejects`（critical）
  - **來源**：`SD-BDD-074` → `SD-AC-017/020`，`SD-RQ-01=B`；**位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`（真 Miniflare D1，不使用 HTTP fixture 假裝 SQL 交易）。
  - **前置**：第 1 場 completed，兩個並行流程都想建立第 2 場 offers。
  - **執行**：使用 Round last_event_seq CAS 與同批最大 episode guard。
  - **斷言**：只一組第 2 場候選凍結成功，第二組回滾且不改 Round JSON。

- [ ] **SD-IT-060** — `ReplayedOldEpisodeVote_DoesNotOverrideCurrentEpisode`（critical）
  - **來源**：`SD-BDD-075` → `SD-AC-017/020`，`SD-RQ-01=B`；**位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`（真 Miniflare D1，不使用 HTTP fixture 假裝 SQL 交易）。
  - **前置**：已有第 2 場新票，舊第 1 場選票請求延遲重送。
  - **執行**：重放相同 clientRequestId 並嘗試改 payload 及 episodeSeq。
  - **斷言**：相同 payload 回原 receipt；不同 payload 409；不得使第 2 場選票變動。

- [ ] **SD-IT-061** — `FreezeNextEpisode_AfterEndOrWithoutClaims_Rejects`（critical）
  - **來源**：`SD-BDD-078` → `SD-AC-017/020`，`SD-RQ-01=B`；**位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`（真 Miniflare D1，不使用 HTTP fixture 假裝 SQL 交易）。
  - **前置**：Round 已 ended 或只有零到一筆 Claims。
  - **執行**：嘗試未來多場凍結及選定 D1 batch。
  - **斷言**：失敗封閉並完整回滾，不重建 Claims、不產生新 episode。

## 3️⃣ API 與 WebSocket 測試

**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`、`cloudflare/tests/story-dialogue-websocket.test.ts`。覆蓋 `POST realtime-ticket`、`GET experience`、`GET story/offers`、`POST story/vote`、`POST events/query`、`POST end`、`GET status`、`GET ws` Upgrade，以及已定義所有 WS commands/events；保留現有 Origin／no-store／ProblemDetails。

- [ ] **SD-API-001** — `AuthorizeRoundMember_SDBDD042_ReturnsSafeContract`（SD-AC-001）
  - **來源**：`SD-BDD-042` → `SD-AC-001`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：C不是本Round成員。
  - **執行**：C查experience、events、ticket和WS。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『各入口拒絕且不洩漏房間內容』；錯誤狀態不能洩漏資料且維持 no-store。

- [ ] **SD-API-002** — `RejectRevokedSession_SDBDD043_ReturnsSafeContract`（SD-AC-001、SD-AC-012）
  - **來源**：`SD-BDD-043` → `SD-AC-001`、`SD-AC-012`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：A新裝置登入撤銷舊family。
  - **執行**：舊裝置繼續發WS命令。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『D1拒寫且連線被重驗或關閉』；錯誤狀態不能洩漏資料且維持 no-store。

- [ ] **SD-API-003** — `RejectUnsafeChatPayload_SDBDD044_ReturnsSafeContract`（SD-AC-005）
  - **來源**：`SD-BDD-044` → `SD-AC-005`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：A輸入危險控制字元或HTML。
  - **執行**：呼叫文字提交。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『回INVALID_STORY_REQUEST且沒有事件』；錯誤狀態不能洩漏資料且維持 no-store。

- [ ] **SD-API-004** — `RejectForeignVoteCatalog_SDBDD045_ReturnsSafeContract`（SD-AC-016、SD-AC-017）
  - **來源**：`SD-BDD-045` → `SD-AC-016`、`SD-AC-017`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：本Round候選是X與Y。
  - **執行**：A提交catalogId Z並假稱B為actor。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『伺服器依A Session及Round白名單拒絕』；錯誤狀態不能洩漏資料且維持 no-store。

- [ ] **SD-API-005** — `RedactPrivateVoteEvent_SDBDD046_ReturnsSafeContract`（SD-AC-016）
  - **來源**：`SD-BDD-046` → `SD-AC-016`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：A已選X而B還沒選。
  - **執行**：B用events query、snapshot及WS恢復。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『B只能知道A已選而不知Catalog ID』；錯誤狀態不能洩漏資料且維持 no-store。

- [ ] **SD-API-006** — `RejectVoteAfterSelected_SDBDD047_ReturnsSafeContract`（SD-AC-017）
  - **來源**：`SD-BDD-047` → `SD-AC-017`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：N1已在接受邀請時直接開始。
  - **執行**：任何成員呼叫story/vote。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『回STORY_ALREADY_SELECTED』；錯誤狀態不能洩漏資料且維持 no-store。

- [ ] **SD-API-007** — `RejectAfterRoundEnd_SDBDD048_ReturnsSafeContract`（SD-AC-010）
  - **來源**：`SD-BDD-048` → `SD-AC-010`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：A的end與B的聊天交錯。
  - **執行**：end先提交成功。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『B收到ROUND_NOT_ACTIVE』；錯誤狀態不能洩漏資料且維持 no-store。

- [ ] **SD-API-008** — `DenyEndedEventHistory_SDBDD049_ReturnsSafeContract`（SD-AC-010、SD-AC-011）
  - **來源**：`SD-BDD-049` → `SD-AC-010`、`SD-AC-011`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：原成員留有舊eventSeq。
  - **執行**：結束後查events或experience。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『無法取得先前私人聊天及互動』；錯誤狀態不能洩漏資料且維持 no-store。

- [ ] **SD-API-009** — `ValidateSingleUseTicket_SDBDD050_ReturnsSafeContract`（SD-AC-012）
  - **來源**：`SD-BDD-050` → `SD-AC-012`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：A曾使用合法短效ticket。
  - **執行**：重播或換Round／裝置使用。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『WS Upgrade拒絕』；錯誤狀態不能洩漏資料且維持 no-store。

- [ ] **SD-API-010** — `RecoverAfterMissedBroadcast_SDBDD051_ReturnsSafeContract`（SD-AC-012）
  - **來源**：`SD-BDD-051` → `SD-AC-012`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：D1已commit一則聊天。
  - **執行**：DO在推播前崩潰。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『B重連取得該筆且不重複』；錯誤狀態不能洩漏資料且維持 no-store。

- [ ] **SD-API-011** — `ValidateStoryGraphManifest_SDBDD052_ReturnsSafeContract`（SD-AC-013）
  - **來源**：`SD-BDD-052` → `SD-AC-013`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：草稿缺ending或參照無效。
  - **執行**：內容工具檢查發布。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『Catalog不得標published』；錯誤狀態不能洩漏資料且維持 no-store。

- [ ] **SD-API-012** — `RejectPrivateMediaAsset_SDBDD053_ReturnsSafeContract`（SD-AC-013、SD-AC-020）
  - **來源**：`SD-BDD-053` → `SD-AC-013`、`SD-AC-020`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：劇情manifest指向私人會員照片key。
  - **執行**：嘗試發布或由公開路由讀取。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『拒絕存取與洩漏key』；錯誤狀態不能洩漏資料且維持 no-store。

- [ ] **SD-API-013** — `VerifyRenamedClaimQueries_SDBDD054_ReturnsSafeContract`（SD-AC-020）
  - **來源**：`SD-BDD-054` → `SD-AC-020`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：schema已更名為game_active_round_claims。
  - **執行**：執行Matching與維運真D1完整測試。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『舊表名存取必失敗而非誤判通過』；錯誤狀態不能洩漏資料且維持 no-store。

- [ ] **SD-API-014** — `ShowSingleStoryScene_SDBDD055_ReturnsSafeContract`（SD-AC-003、SD-AC-018）
  - **來源**：`SD-BDD-055` → `SD-AC-003`、`SD-AC-018`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：唯一正式故事為scene-01且Round已接受。
  - **執行**：玩家從首頁進場。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『直接顯示書店開場』；錯誤狀態不能洩漏資料且維持 no-store。

- [ ] **SD-API-015** — `ShowTwoOfferCards_SDBDD056_ReturnsSafeContract`（SD-AC-002、SD-AC-016）
  - **來源**：`SD-BDD-056` → `SD-AC-002`、`SD-AC-016`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：Round固定兩個Catalog ID。
  - **執行**：兩名玩家開啟選場。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『兩端只有兩張相同順序合法卡片』；錯誤狀態不能洩漏資料且維持 no-store。

- [ ] **SD-API-016** — `ShowThreeSafePreviews_SDBDD057_ReturnsSafeContract`（SD-AC-002、SD-AC-016）
  - **來源**：`SD-BDD-057` → `SD-AC-002`、`SD-AC-016`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：Round固定三個Catalog ID。
  - **執行**：兩端開啟選場畫面。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『只呈現三個已授權公開預覽』；錯誤狀態不能洩漏資料且維持 no-store。

- [ ] **SD-API-017** — `PreventRepeatedVoteClick_SDBDD058_ReturnsSafeContract`（SD-AC-016）
  - **來源**：`SD-BDD-058` → `SD-AC-016`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：玩家按下提交候選。
  - **執行**：同一按鈕被快速連點。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『按鈕Loading且不重複提交』；錯誤狀態不能洩漏資料且維持 no-store。

- [ ] **SD-API-018** — `ShowPendingPartnerStatus_SDBDD059_ReturnsSafeContract`（SD-AC-016）
  - **來源**：`SD-BDD-059` → `SD-AC-016`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：A已投票B未提交。
  - **執行**：A觀看選場等待。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『顯示等待另一方選擇』；錯誤狀態不能洩漏資料且維持 no-store。

- [ ] **SD-API-019** — `DisplayInitiatorDecision_SDBDD060_ReturnsSafeContract`（SD-AC-016）
  - **來源**：`SD-BDD-060` → `SD-AC-016`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：雙方投票不同且已結算。
  - **執行**：打開結果畫面。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『顯示採原邀請方的選擇』；錯誤狀態不能洩漏資料且維持 no-store。

- [ ] **SD-API-020** — `ShowPendingMessageReceipt_SDBDD061_ReturnsSafeContract`（SD-AC-004、SD-AC-005）
  - **來源**：`SD-BDD-061` → `SD-AC-004`、`SD-AC-005`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：玩家送出合法文字。
  - **執行**：D1還未回覆ACK。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『泡泡顯示送出中直到已提交』；錯誤狀態不能洩漏資料且維持 no-store。

- [ ] **SD-API-021** — `ShowRealtimeReconnect_SDBDD062_ReturnsSafeContract`（SD-AC-012）
  - **來源**：`SD-BDD-062` → `SD-AC-012`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：WebSocket意外斷開。
  - **執行**：玩家回前景且網路恢復。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『顯示重新連線中直到補齊』；錯誤狀態不能洩漏資料且維持 no-store。

- [ ] **SD-API-022** — `RestoreCoopWaitingCard_SDBDD063_ReturnsSafeContract`（SD-AC-006、SD-AC-014）
  - **來源**：`SD-BDD-063` → `SD-AC-006`、`SD-AC-014`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：A已選而B未選。
  - **執行**：A返回場景。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『顯示等待另一方選擇』；錯誤狀態不能洩漏資料且維持 no-store。

- [ ] **SD-API-023** — `RenderAdvEndingFlow_SDBDD064_ReturnsSafeContract`（SD-AC-003、SD-AC-007）
  - **來源**：`SD-BDD-064` → `SD-AC-003`、`SD-AC-007`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：書店有主線支線合流與結尾。
  - **執行**：玩家逐節點完成故事。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『立繪動畫音效與結果按已提交分支呈現』；錯誤狀態不能洩漏資料且維持 no-store。

- [ ] **SD-API-024** — `ShowExitPhrasePrompt_SDBDD065_ReturnsSafeContract`（SD-AC-008）
  - **來源**：`SD-BDD-065` → `SD-AC-008`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：A輸入不想繼續。
  - **執行**：本人看到語境提示。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『提供繼續、返回編輯與結束按鈕』；錯誤狀態不能洩漏資料且維持 no-store。

- [ ] **SD-API-025** — `ShowPermanentPairWarning_SDBDD066_ReturnsSafeContract`（SD-AC-008、SD-AC-009）
  - **來源**：`SD-BDD-066` → `SD-AC-008`、`SD-AC-009`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：玩家在任意階段按結束本輪。
  - **執行**：彈出二次確認。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『顯示原pair永久不能再配對』；錯誤狀態不能洩漏資料且維持 no-store。

- [ ] **SD-API-026** — `ShowEndedRoom_SDBDD067_ReturnsSafeContract`（SD-AC-009、SD-AC-011）
  - **來源**：`SD-BDD-067` → `SD-AC-009`、`SD-AC-011`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：一方已確認結束且D1成功。
  - **執行**：兩端收到ended狀態。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『兩端不得再操作舊聊天』；錯誤狀態不能洩漏資料且維持 no-store。

- [ ] **SD-API-027** — `RecoverUncertainSubmit_SDBDD068_ReturnsSafeContract`（SD-AC-001、SD-AC-005）
  - **來源**：`SD-BDD-068` → `SD-AC-001`、`SD-AC-005`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：發訊遇503或結果不明。
  - **執行**：玩家選重新同步。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『顯示目前無法確認送出結果請重新同步』；錯誤狀態不能洩漏資料且維持 no-store。

- [ ] **SD-API-028** — `ShowTwoStoriesAfterPublish_SDBDD069_ReturnsSafeContract`（SD-AC-018）
  - **來源**：`SD-BDD-069` → `SD-AC-018`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：第一場已完整且後來第二場Published。
  - **執行**：新一組配對成功。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『新Round自然進入二選一』；錯誤狀態不能洩漏資料且維持 no-store。

- [ ] **SD-API-029** — `AuthorizeRoundMember_SDBDD042_RejectsNonmemberOnAllEndpoints`（SD-AC-001）
  - **來源**：`SD-BDD-042` → `SD-AC-001`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：第三人有有效Access卻不是Round成員。
  - **執行**：依序呼叫七個受限HTTP端點及WS握手。
  - **斷言**：所有敏感結果403／404且無私有資料，合法同輪參與者仍可使用。

- [ ] **SD-API-030** — `RejectRevokedSession_SDBDD043_RejectsStaleFamilyForEveryCommand`（SD-AC-001、SD-AC-012）
  - **來源**：`SD-BDD-043` → `SD-AC-001`、`SD-AC-012`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：既有Session family已撤銷。
  - **執行**：逐一用舊憑證呼叫vote、end、events及ticket。
  - **斷言**：401 SESSION_REVOKED；不得產生Event或StorySession。

- [ ] **SD-API-031** — `RejectVoteAfterSelected_SDBDD047_ValidatesVotePayloadStrictly`（SD-AC-017）
  - **來源**：`SD-BDD-047` → `SD-AC-017`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：本人N2的Round仍待選。
  - **執行**：POST vote傳非本輪Catalog、額外欄位、重複鍵或非法ID。
  - **斷言**：400 INVALID_STORY_VOTE或對應409，未知body拒絕且無DB寫入。

- [ ] **SD-API-032** — `DenyEndedEventHistory_SDBDD049_DeniesEndedHistoryRegardlessOfCursor`（SD-AC-010、SD-AC-011）
  - **來源**：`SD-BDD-049` → `SD-AC-010`、`SD-AC-011`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：ended Round有大量舊訊息。
  - **執行**：POST events/query帶任意beforeSeq或afterSeq。
  - **斷言**：不能返還ended前內容，僅status安全摘要。

- [ ] **SD-API-033** — `ValidateSingleUseTicket_SDBDD050_RejectsTicketReplayAndWrongOrigin`（SD-AC-012）
  - **來源**：`SD-BDD-050` → `SD-AC-012`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：同票據已使用／Origin不可信。
  - **執行**：發起WS Upgrade。
  - **斷言**：拒重播與跨裝置ticket；不將秘密置入可記錄的URL。

- [ ] **SD-API-034** — `ShowTwoOfferCards_SDBDD056_ReturnsSortedCatalogPreviews`（SD-AC-002、SD-AC-016）
  - **來源**：`SD-BDD-056` → `SD-AC-002`、`SD-AC-016`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：Round N2/N3 JSON 已固定Catalog IDs。
  - **執行**：GET story/offers 與 experience。
  - **斷言**：嚴格固定排序和安全欄位，不重算興趣或顯示private score。

- [ ] **SD-API-035** — `ShowPendingMessageReceipt_SDBDD061_RecoversUnknownMessageOutcome`（SD-AC-004、SD-AC-005）
  - **來源**：`SD-BDD-061` → `SD-AC-004`、`SD-AC-005`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：POST或WS命令結果未知。
  - **執行**：用原clientRequestId重查。
  - **斷言**：不自動以不同requestId重送；重試與receipt一致。

### 2026-11-08 [補強] 本期 API／WS 不允許第二場（2 項）

- [ ] **SD-API-036** — `RejectSecondEpisodeStart_OnCurrentHttpAndWsCommands`（critical）
  - **來源**：`SD-BDD-077`；**位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`／`cloudflare/tests/story-dialogue-websocket.test.ts`。
  - **前置**：第 1 場 completed 且合法登入、Schema 可存多場。
  - **執行**：呼叫本期公開 HTTP/WS 嘗試第二場／提交 episodeSeq=2。
  - **斷言**：不支援的未來行為拒絕，不能透過手填 body 繞過；保留正常聊天與 Round 授權。

- [ ] **SD-API-037** — `ExposeEpisodeOneFields_InCurrentExperienceAndAck`（critical）
  - **來源**：`SD-BDD-079`；**位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`／`cloudflare/tests/story-dialogue-websocket.test.ts`。
  - **前置**：N1 或 N2 已結算第一場且 D1 儲存 episodeSeq=1。
  - **執行**：GET experience 與接收 WS story.selected／ACK。
  - **斷言**：有 episodeSeq=1、storySessionId 且版次／節點正確，不洩露第 2 場測試資料。

## 4️⃣ E2E（Web／Android）

**測試位置**：`tests/e2e/web/story-dialogue.spec.ts`、`tests/e2e/android/story-dialogue.mjs`；以兩個獨立真人帳號與真後端分別記錄平台證據。情境不可只用原型人物或受控 UI mock 代替，Android 使用既有隔離 E2E host 而不動其他專案。

- [ ] **SD-ET-001** — `RenderIntroScene_SDBDD007_RendersRealUserFlow`（SD-AC-003）
  - **來源**：`SD-BDD-007` → `SD-AC-003`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：兩名玩家已進入scene-01。
  - **執行**：開啟第一個劇情節點。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『顯示專屬背景、3:4人物、旁白與逐句演出』；另一端畫面與回復符合『呈現原型粉玫瑰深紫與半透明視覺』，不得以截圖或 mock 當 SQL 證據。

- [ ] **SD-ET-002** — `CommitSuggestedMessage_SDBDD008_RendersRealUserFlow`（SD-AC-004）
  - **來源**：`SD-BDD-008` → `SD-AC-004`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：A與B在書店破冰節點。
  - **執行**：A選觀察型話題。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『訊息actor是A且文字取自已釘選版次』；另一端畫面與回復符合『B只收到A真實發出的訊息』，不得以截圖或 mock 當 SQL 證據。

- [ ] **SD-ET-003** — `CommitFreeMessage_SDBDD009_RendersRealUserFlow`（SD-AC-004、SD-AC-005）
  - **來源**：`SD-BDD-009` → `SD-AC-004`、`SD-AC-005`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：A與B在相同active Round並已連線。
  - **執行**：A送出合法文字。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『D1成功後ACK再向B廣播相同事件序號』；另一端畫面與回復符合『無系統扮演B也無假已讀』，不得以截圖或 mock 當 SQL 證據。

- [ ] **SD-ET-004** — `ExploreWhilePending_SDBDD010_RendersRealUserFlow`（SD-AC-006、SD-AC-014）
  - **來源**：`SD-BDD-010` → `SD-AC-006`、`SD-AC-014`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：A在線但B暫離。
  - **執行**：A調查書籤物件。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『A取得自己的探索結果』；另一端畫面與回復符合『雙人閘門仍必須等B真人提交』，不得以截圖或 mock 當 SQL 證據。

- [ ] **SD-ET-005** — `ResolveCooperativeSame_SDBDD011_RendersRealUserFlow`（SD-AC-006）
  - **來源**：`SD-BDD-011` → `SD-AC-006`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：雙方已進入cooperative-choice。
  - **執行**：兩人分別提交同選項。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『模組結算並依故事圖推進』；另一端畫面與回復符合『不重用另一個節點互動的答題』，不得以截圖或 mock 當 SQL 證據。

- [ ] **SD-ET-006** — `ResolveCooperativeDifferent_SDBDD012_RendersRealUserFlow`（SD-AC-006）
  - **來源**：`SD-BDD-012` → `SD-AC-006`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：兩人處於有分歧規則的合作節點。
  - **執行**：各自選擇不同答案。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『依InteractionDefinition的已發布規則推進』；另一端畫面與回復符合『不套用選劇情的邀請方優先規則』，不得以截圖或 mock 當 SQL 證據。

- [ ] **SD-ET-007** — `AdvanceStoryBranch_SDBDD013_RendersRealUserFlow`（SD-AC-007）
  - **來源**：`SD-BDD-013` → `SD-AC-007`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：主線有可達書籤支線。
  - **執行**：玩家完成支線觸發條件。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『進入支線後回到指定rejoin節點』；另一端畫面與回復符合『雙方重連後主線節點一致』，不得以截圖或 mock 當 SQL 證據。

- [ ] **SD-ET-008** — `ResolveMultipleEndings_SDBDD014_RendersRealUserFlow`（SD-AC-007）
  - **來源**：`SD-BDD-014` → `SD-AC-007`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：兩組隔離Round選擇不同分支。
  - **執行**：各自完成整章。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『可達兩種不同結語及視覺結果』；另一端畫面與回復符合『不以單一intro假裝故事完成』，不得以截圖或 mock 當 SQL 證據。

- [ ] **SD-ET-009** — `CompleteStoryChapter_SDBDD015_RendersRealUserFlow`（SD-AC-007）
  - **來源**：`SD-BDD-015` → `SD-AC-007`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：兩名玩家完成scene-01結尾。
  - **執行**：伺服器提交chapter.completed。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『故事標completed而Round仍active』；另一端畫面與回復符合『兩人可繼續自由聊天不釋放Claims』，不得以截圖或 mock 當 SQL 證據。

- [ ] **SD-ET-010** — `ProjectEndedRound_SDBDD017_RendersRealUserFlow`（SD-AC-010、SD-AC-011）
  - **來源**：`SD-BDD-017` → `SD-AC-010`、`SD-AC-011`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：本輪已正式結束。
  - **執行**：原成員查status及舊聊天。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『status可見ended但聊天不可取回』；另一端畫面與回復符合『不能讀取結束後新的真人名片』，不得以截圖或 mock 當 SQL 證據。

- [ ] **SD-ET-011** — `LoadPinnedManifest_SDBDD019_RendersRealUserFlow`（SD-AC-013）
  - **來源**：`SD-BDD-019` → `SD-AC-013`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：Round已固定勝出StoryVersion。
  - **執行**：玩家開啟故事及推進節點。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『取得鎖定hash的首屏與必要素材』；另一端畫面與回復符合『未選故事的巨大圖片不提前載入』，不得以截圖或 mock 當 SQL 證據。

- [ ] **SD-ET-012** — `VerifyFirstStoryGate_SDBDD020_RendersRealUserFlow`（SD-AC-015）
  - **來源**：`SD-BDD-020` → `SD-AC-015`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：scene-01已達所有分支和互動技術條件。
  - **執行**：真人完成Web與Android實玩。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『分別保留Gate A與Gate B實際證據』；另一端畫面與回復符合『其餘九場仍列未交付直到真的完成』，不得以截圖或 mock 當 SQL 證據。

- [ ] **SD-ET-013** — `KeepPendingWhenOffline_SDBDD026_RendersRealUserFlow`（SD-AC-016）
  - **來源**：`SD-BDD-026` → `SD-AC-016`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：A已選而B離線。
  - **執行**：A重新登入等待。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『狀態仍是pending_story_selection』；另一端畫面與回復符合『沒有超時自動補票』，不得以截圖或 mock 當 SQL 證據。

- [ ] **SD-ET-014** — `DetectExitIntent_SDBDD027_RendersRealUserFlow`（SD-AC-008）
  - **來源**：`SD-BDD-027` → `SD-AC-008`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：A輸入先到這邊。
  - **執行**：A觸發送出。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『只有A看到是否想結束的提示』；另一端畫面與回復符合『B不知道A尚在考慮退出』，不得以截圖或 mock 當 SQL 證據。

- [ ] **SD-ET-015** — `ContinueAfterExitPrompt_SDBDD028_RendersRealUserFlow`（SD-AC-008）
  - **來源**：`SD-BDD-028` → `SD-AC-008`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：本人看到離場語境提示。
  - **執行**：點繼續傳送。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『Round保持active且訊息仍可由本人送出』；另一端畫面與回復符合『不擅自結束或通知對方』，不得以截圖或 mock 當 SQL 證據。

- [ ] **SD-ET-016** — `CancelEndConfirmation_SDBDD029_RendersRealUserFlow`（SD-AC-008、SD-AC-009）
  - **來源**：`SD-BDD-029` → `SD-AC-008`、`SD-AC-009`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：正式結束確認Dialog已開啟。
  - **執行**：A點取消。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『不呼叫end且Round仍active』；另一端畫面與回復符合『Claims及聊天不變』，不得以截圖或 mock 當 SQL 證據。

- [ ] **SD-ET-017** — `ResumeCooperativeInteraction_SDBDD031_RendersRealUserFlow`（SD-AC-014）
  - **來源**：`SD-BDD-031` → `SD-AC-014`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：A已提交互動但B未選。
  - **執行**：B重登後提交真選擇。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『合作依兩份有效真人答覆結算』；另一端畫面與回復符合『等待期間A仍可探索與聊天』，不得以截圖或 mock 當 SQL 證據。

- [ ] **SD-ET-018** — `LabelNpcAndSystem_SDBDD032_RendersRealUserFlow`（SD-AC-003、SD-AC-014）
  - **來源**：`SD-BDD-032` → `SD-AC-003`、`SD-AC-014`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：故事包含系統與NPC台詞。
  - **執行**：呈現對話場景。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『NPC與系統標註清楚』；另一端畫面與回復符合『沒有任何B的人物自動發言』，不得以截圖或 mock 當 SQL 證據。

- [ ] **SD-ET-019** — `ShowSingleStoryScene_SDBDD055_RendersRealUserFlow`（SD-AC-003、SD-AC-018）
  - **來源**：`SD-BDD-055` → `SD-AC-003`、`SD-AC-018`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：唯一正式故事為scene-01且Round已接受。
  - **執行**：玩家從首頁進場。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『直接顯示書店開場』；另一端畫面與回復符合『沒有多餘單場選擇頁』，不得以截圖或 mock 當 SQL 證據。

- [ ] **SD-ET-020** — `ShowTwoOfferCards_SDBDD056_RendersRealUserFlow`（SD-AC-002、SD-AC-016）
  - **來源**：`SD-BDD-056` → `SD-AC-002`、`SD-AC-016`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：Round固定兩個Catalog ID。
  - **執行**：兩名玩家開啟選場。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『兩端只有兩張相同順序合法卡片』；另一端畫面與回復符合『第三張空卡不出現』，不得以截圖或 mock 當 SQL 證據。

- [ ] **SD-ET-021** — `ShowThreeSafePreviews_SDBDD057_RendersRealUserFlow`（SD-AC-002、SD-AC-016）
  - **來源**：`SD-BDD-057` → `SD-AC-002`、`SD-AC-016`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：Round固定三個Catalog ID。
  - **執行**：兩端開啟選場畫面。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『只呈現三個已授權公開預覽』；另一端畫面與回復符合『不曝露私人tag及推薦計分』，不得以截圖或 mock 當 SQL 證據。

- [ ] **SD-ET-022** — `PreventRepeatedVoteClick_SDBDD058_RendersRealUserFlow`（SD-AC-016）
  - **來源**：`SD-BDD-058` → `SD-AC-016`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：玩家按下提交候選。
  - **執行**：同一按鈕被快速連點。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『按鈕Loading且不重複提交』；另一端畫面與回復符合『未知結果以同ID確認』，不得以截圖或 mock 當 SQL 證據。

- [ ] **SD-ET-023** — `ShowPendingPartnerStatus_SDBDD059_RendersRealUserFlow`（SD-AC-016）
  - **來源**：`SD-BDD-059` → `SD-AC-016`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：A已投票B未提交。
  - **執行**：A觀看選場等待。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『顯示等待另一方選擇』；另一端畫面與回復符合『不顯示B選項或假倒數』，不得以截圖或 mock 當 SQL 證據。

- [ ] **SD-ET-024** — `DisplayInitiatorDecision_SDBDD060_RendersRealUserFlow`（SD-AC-016）
  - **來源**：`SD-BDD-060` → `SD-AC-016`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：雙方投票不同且已結算。
  - **執行**：打開結果畫面。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『顯示採原邀請方的選擇』；另一端畫面與回復符合『兩端載入同一故事』，不得以截圖或 mock 當 SQL 證據。

- [ ] **SD-ET-025** — `ShowPendingMessageReceipt_SDBDD061_RendersRealUserFlow`（SD-AC-004、SD-AC-005）
  - **來源**：`SD-BDD-061` → `SD-AC-004`、`SD-AC-005`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：玩家送出合法文字。
  - **執行**：D1還未回覆ACK。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『泡泡顯示送出中直到已提交』；另一端畫面與回復符合『沒有實際讀取證據不顯示已讀』，不得以截圖或 mock 當 SQL 證據。

- [ ] **SD-ET-026** — `ShowRealtimeReconnect_SDBDD062_RendersRealUserFlow`（SD-AC-012）
  - **來源**：`SD-BDD-062` → `SD-AC-012`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：WebSocket意外斷開。
  - **執行**：玩家回前景且網路恢復。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『顯示重新連線中直到補齊』；另一端畫面與回復符合『未確認結果不宣稱已送達』，不得以截圖或 mock 當 SQL 證據。

- [ ] **SD-ET-027** — `RestoreCoopWaitingCard_SDBDD063_RendersRealUserFlow`（SD-AC-006、SD-AC-014）
  - **來源**：`SD-BDD-063` → `SD-AC-006`、`SD-AC-014`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：A已選而B未選。
  - **執行**：A返回場景。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『顯示等待另一方選擇』；另一端畫面與回復符合『可以探索且再打開卡保留答覆』，不得以截圖或 mock 當 SQL 證據。

- [ ] **SD-ET-028** — `RenderAdvEndingFlow_SDBDD064_RendersRealUserFlow`（SD-AC-003、SD-AC-007）
  - **來源**：`SD-BDD-064` → `SD-AC-003`、`SD-AC-007`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：書店有主線支線合流與結尾。
  - **執行**：玩家逐節點完成故事。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『立繪動畫音效與結果按已提交分支呈現』；另一端畫面與回復符合『不能只有一個intro冒稱完成』，不得以截圖或 mock 當 SQL 證據。

- [ ] **SD-ET-029** — `ShowExitPhrasePrompt_SDBDD065_RendersRealUserFlow`（SD-AC-008）
  - **來源**：`SD-BDD-065` → `SD-AC-008`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：A輸入不想繼續。
  - **執行**：本人看到語境提示。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『提供繼續、返回編輯與結束按鈕』；另一端畫面與回復符合『不通知B本人尚在考慮退出』，不得以截圖或 mock 當 SQL 證據。

- [ ] **SD-ET-030** — `ShowPermanentPairWarning_SDBDD066_RendersRealUserFlow`（SD-AC-008、SD-AC-009）
  - **來源**：`SD-BDD-066` → `SD-AC-008`、`SD-AC-009`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：玩家在任意階段按結束本輪。
  - **執行**：彈出二次確認。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『顯示原pair永久不能再配對』；另一端畫面與回復符合『取消不修改任何狀態』，不得以截圖或 mock 當 SQL 證據。

- [ ] **SD-ET-031** — `ShowEndedRoom_SDBDD067_RendersRealUserFlow`（SD-AC-009、SD-AC-011）
  - **來源**：`SD-BDD-067` → `SD-AC-009`、`SD-AC-011`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：一方已確認結束且D1成功。
  - **執行**：兩端收到ended狀態。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『兩端不得再操作舊聊天』；另一端畫面與回復符合『返回鍵不能開舊對話』，不得以截圖或 mock 當 SQL 證據。

- [ ] **SD-ET-032** — `RecoverUncertainSubmit_SDBDD068_RendersRealUserFlow`（SD-AC-001、SD-AC-005）
  - **來源**：`SD-BDD-068` → `SD-AC-001`、`SD-AC-005`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：發訊遇503或結果不明。
  - **執行**：玩家選重新同步。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『顯示目前無法確認送出結果請重新同步』；另一端畫面與回復符合『不得新requestId重寫同句話』，不得以截圖或 mock 當 SQL 證據。

- [ ] **SD-ET-033** — `ShowTwoStoriesAfterPublish_SDBDD069_RendersRealUserFlow`（SD-AC-018）
  - **來源**：`SD-BDD-069` → `SD-AC-018`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：第一場已完整且後來第二場Published。
  - **執行**：新一組配對成功。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『新Round自然進入二選一』；另一端畫面與回復符合『舊Round保持原版不變』，不得以截圖或 mock 當 SQL 證據。

- [ ] **SD-ET-034** — `MeasureRealtimeIsolation_SDBDD070_RendersRealUserFlow`（SD-AC-005、SD-AC-012、SD-AC-019）
  - **來源**：`SD-BDD-070` → `SD-AC-005`、`SD-AC-012`、`SD-AC-019`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：隔離兩個Round與WebSocket。
  - **執行**：並行發訊與重連。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『各房間事件只推本房間』；另一端畫面與回復符合『記錄commit到顯示、DO喚醒、Container冷啟動量測』，不得以截圖或 mock 當 SQL 證據。

- [ ] **SD-ET-035** — `EndRoundWithConfirmation_SDBDD016_EndsRoundWebToAndroid`（SD-AC-008、SD-AC-009）
  - **來源**：`SD-BDD-016` → `SD-AC-008`、`SD-AC-009`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：Web A與Android B均在線。
  - **執行**：A二次確認結束。
  - **斷言**：Android收到room.ended且舊UI不能恢復，兩邊Claims釋放。

- [ ] **SD-ET-036** — `VerifyFirstStoryGate_SDBDD020_CompletesRealScene01Gate`（SD-AC-015）
  - **來源**：`SD-BDD-020` → `SD-AC-015`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：兩名真帳號且scene01所有分支／音畫可玩。
  - **執行**：實際跑完整兩種結尾及等待中操作。
  - **斷言**：Gate A與人工Gate B證據分開記錄，未驗即不得標已完成。

- [ ] **SD-ET-037** — `ShowRealtimeReconnect_SDBDD062_RestoresOnAndroidForeground`（SD-AC-012）
  - **來源**：`SD-BDD-062` → `SD-AC-012`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：Android B在待選或故事節點轉背景。
  - **執行**：A在Web提交事件、B恢復前景。
  - **斷言**：B補游標／snapshot後正確進度、不得洩漏未結算選票。

### 2026-11-08 [補強] 雙端首場唯一與後續功能不提前開啟（2 項）

- [ ] **SD-ET-038** — `OnlyFirstEpisodeAvailable_OnWebAndAndroid`（critical）
  - **來源**：`SD-BDD-077`；**位置**：`tests/e2e/web/story-dialogue.spec.ts`＋`tests/e2e/android/story-dialogue.mjs`。
  - **前置**：真雙帳號在本期 scene-01 的 chapter completed。
  - **執行**：Web 與 Android 分別檢查遊戲畫面與互動入口。
  - **斷言**：只允許 Round 聊天，沒有再選其他獨立劇本按鈕、也不以 API 隱藏入口繞過。

- [ ] **SD-ET-039** — `InitialEpisodeOne_FollowsSameIdsAcrossClients`（critical）
  - **來源**：`SD-BDD-079`；**位置**：`tests/e2e/web/story-dialogue.spec.ts`＋`tests/e2e/android/story-dialogue.mjs`。
  - **前置**：真雙帳號 Web↔Android 在第 1 場 N1 或 N2 完成選場。
  - **執行**：兩端同時進場、聊天、斷線重連。
  - **斷言**：都投影 episodeSeq=1 和同一 storySessionId；不會重建 Episode2。

## 需求追溯（79 個 Gherkin 場景 → 187 個測試 ID）

| BDD | SDD AC | Unit／Integration／API／E2E ID |
|---|---|---|
| `SD-BDD-001` | `SD-AC-002`、`SD-AC-017`、`SD-AC-018` | `SD-UT-001`、`SD-IT-001`、`SD-IT-038` |
| `SD-BDD-002` | `SD-AC-002`、`SD-AC-016`、`SD-AC-018` | `SD-UT-002`、`SD-IT-002`、`SD-IT-039` |
| `SD-BDD-003` | `SD-AC-002`、`SD-AC-016`、`SD-AC-018` | `SD-UT-003`、`SD-IT-003`、`SD-IT-040` |
| `SD-BDD-004` | `SD-AC-002` | `SD-UT-004`、`SD-IT-004` |
| `SD-BDD-005` | `SD-AC-016`、`SD-AC-017` | `SD-UT-005`、`SD-IT-005` |
| `SD-BDD-006` | `SD-AC-016`、`SD-AC-017` | `SD-UT-006`、`SD-IT-006` |
| `SD-BDD-007` | `SD-AC-003` | `SD-UT-007`、`SD-ET-001` |
| `SD-BDD-008` | `SD-AC-004` | `SD-UT-008`、`SD-ET-002` |
| `SD-BDD-009` | `SD-AC-004`、`SD-AC-005` | `SD-UT-009`、`SD-ET-003` |
| `SD-BDD-010` | `SD-AC-006`、`SD-AC-014` | `SD-UT-010`、`SD-ET-004` |
| `SD-BDD-011` | `SD-AC-006` | `SD-UT-011`、`SD-ET-005` |
| `SD-BDD-012` | `SD-AC-006` | `SD-UT-012`、`SD-ET-006` |
| `SD-BDD-013` | `SD-AC-007` | `SD-UT-013`、`SD-ET-007` |
| `SD-BDD-014` | `SD-AC-007` | `SD-UT-014`、`SD-ET-008` |
| `SD-BDD-015` | `SD-AC-007` | `SD-UT-015`、`SD-ET-009` |
| `SD-BDD-016` | `SD-AC-008`、`SD-AC-009` | `SD-UT-016`、`SD-IT-007`、`SD-ET-035` |
| `SD-BDD-017` | `SD-AC-010`、`SD-AC-011` | `SD-UT-017`、`SD-ET-010` |
| `SD-BDD-018` | `SD-AC-012`、`SD-AC-019` | `SD-UT-018`、`SD-IT-008` |
| `SD-BDD-019` | `SD-AC-013` | `SD-UT-019`、`SD-ET-011` |
| `SD-BDD-020` | `SD-AC-015` | `SD-UT-020`、`SD-ET-012`、`SD-ET-036` |
| `SD-BDD-021` | `SD-AC-020` | `SD-UT-021`、`SD-IT-009` |
| `SD-BDD-022` | `SD-AC-020` | `SD-UT-022`、`SD-IT-010`、`SD-IT-041` |
| `SD-BDD-023` | `SD-AC-002` | `SD-UT-023`、`SD-IT-011` |
| `SD-BDD-024` | `SD-AC-002` | `SD-UT-024`、`SD-IT-012` |
| `SD-BDD-025` | `SD-AC-016` | `SD-UT-025`、`SD-IT-013`、`SD-IT-042` |
| `SD-BDD-026` | `SD-AC-016` | `SD-UT-026`、`SD-ET-013` |
| `SD-BDD-027` | `SD-AC-008` | `SD-UT-027`、`SD-ET-014` |
| `SD-BDD-028` | `SD-AC-008` | `SD-UT-028`、`SD-ET-015` |
| `SD-BDD-029` | `SD-AC-008`、`SD-AC-009` | `SD-UT-029`、`SD-ET-016` |
| `SD-BDD-030` | `SD-AC-013` | `SD-UT-030`、`SD-IT-014` |
| `SD-BDD-031` | `SD-AC-014` | `SD-UT-031`、`SD-ET-017` |
| `SD-BDD-032` | `SD-AC-003`、`SD-AC-014` | `SD-UT-032`、`SD-ET-018` |
| `SD-BDD-033` | `SD-AC-002`、`SD-AC-018` | `SD-UT-033`、`SD-IT-015` |
| `SD-BDD-034` | `SD-AC-002`、`SD-AC-020` | `SD-UT-034`、`SD-IT-016` |
| `SD-BDD-035` | `SD-AC-002` | `SD-UT-035`、`SD-IT-017` |
| `SD-BDD-036` | `SD-AC-005` | `SD-UT-036`、`SD-IT-018` |
| `SD-BDD-037` | `SD-AC-005`、`SD-AC-017` | `SD-UT-037`、`SD-IT-019` |
| `SD-BDD-038` | `SD-AC-017` | `SD-UT-038`、`SD-IT-020`、`SD-IT-043` |
| `SD-BDD-039` | `SD-AC-017` | `SD-UT-039`、`SD-IT-021` |
| `SD-BDD-040` | `SD-AC-020` | `SD-UT-040`、`SD-IT-022` |
| `SD-BDD-041` | `SD-AC-020` | `SD-UT-041`、`SD-IT-023` |
| `SD-BDD-042` | `SD-AC-001` | `SD-IT-024`、`SD-API-001`、`SD-API-029` |
| `SD-BDD-043` | `SD-AC-001`、`SD-AC-012` | `SD-IT-025`、`SD-API-002`、`SD-API-030` |
| `SD-BDD-044` | `SD-AC-005` | `SD-IT-026`、`SD-API-003` |
| `SD-BDD-045` | `SD-AC-016`、`SD-AC-017` | `SD-IT-027`、`SD-API-004` |
| `SD-BDD-046` | `SD-AC-016` | `SD-IT-028`、`SD-IT-044`、`SD-API-005` |
| `SD-BDD-047` | `SD-AC-017` | `SD-IT-029`、`SD-API-006`、`SD-API-031` |
| `SD-BDD-048` | `SD-AC-010` | `SD-IT-030`、`SD-API-007` |
| `SD-BDD-049` | `SD-AC-010`、`SD-AC-011` | `SD-IT-031`、`SD-API-008`、`SD-API-032` |
| `SD-BDD-050` | `SD-AC-012` | `SD-IT-032`、`SD-API-009`、`SD-API-033` |
| `SD-BDD-051` | `SD-AC-012` | `SD-IT-033`、`SD-IT-045`、`SD-API-010` |
| `SD-BDD-052` | `SD-AC-013` | `SD-IT-034`、`SD-IT-046`、`SD-API-011` |
| `SD-BDD-053` | `SD-AC-013`、`SD-AC-020` | `SD-IT-035`、`SD-IT-047`、`SD-API-012` |
| `SD-BDD-054` | `SD-AC-020` | `SD-IT-036`、`SD-API-013` |
| `SD-BDD-055` | `SD-AC-003`、`SD-AC-018` | `SD-API-014`、`SD-ET-019` |
| `SD-BDD-056` | `SD-AC-002`、`SD-AC-016` | `SD-API-015`、`SD-API-034`、`SD-ET-020` |
| `SD-BDD-057` | `SD-AC-002`、`SD-AC-016` | `SD-API-016`、`SD-ET-021` |
| `SD-BDD-058` | `SD-AC-016` | `SD-API-017`、`SD-ET-022` |
| `SD-BDD-059` | `SD-AC-016` | `SD-API-018`、`SD-ET-023` |
| `SD-BDD-060` | `SD-AC-016` | `SD-API-019`、`SD-ET-024` |
| `SD-BDD-061` | `SD-AC-004`、`SD-AC-005` | `SD-API-020`、`SD-API-035`、`SD-ET-025` |
| `SD-BDD-062` | `SD-AC-012` | `SD-API-021`、`SD-ET-026`、`SD-ET-037` |
| `SD-BDD-063` | `SD-AC-006`、`SD-AC-014` | `SD-API-022`、`SD-ET-027` |
| `SD-BDD-064` | `SD-AC-003`、`SD-AC-007` | `SD-API-023`、`SD-ET-028` |
| `SD-BDD-065` | `SD-AC-008` | `SD-API-024`、`SD-ET-029` |
| `SD-BDD-066` | `SD-AC-008`、`SD-AC-009` | `SD-API-025`、`SD-ET-030` |
| `SD-BDD-067` | `SD-AC-009`、`SD-AC-011` | `SD-API-026`、`SD-ET-031` |
| `SD-BDD-068` | `SD-AC-001`、`SD-AC-005` | `SD-API-027`、`SD-ET-032` |
| `SD-BDD-069` | `SD-AC-018` | `SD-API-028`、`SD-ET-033` |
| `SD-BDD-070` | `SD-AC-005`、`SD-AC-012`、`SD-AC-019` | `SD-IT-037`、`SD-ET-034` |

| `SD-BDD-071` | `SD-AC-020`；`SD-RQ-02=A` | `SD-UT-042`、`SD-IT-048`、`SD-IT-049` |

| `SD-BDD-072` | 依 BDD §SD-BDD-072 的原始 SDD 驗收條件 | `SD-UT-043`、`SD-IT-050`、`SD-IT-057` |
| `SD-BDD-073` | 依 BDD §SD-BDD-073 的原始 SDD 驗收條件 | `SD-UT-044`、`SD-IT-051`、`SD-IT-058` |
| `SD-BDD-074` | 依 BDD §SD-BDD-074 的原始 SDD 驗收條件 | `SD-UT-045`、`SD-IT-052`、`SD-IT-059` |
| `SD-BDD-075` | 依 BDD §SD-BDD-075 的原始 SDD 驗收條件 | `SD-UT-046`、`SD-IT-053`、`SD-IT-060` |
| `SD-BDD-076` | 依 BDD §SD-BDD-076 的原始 SDD 驗收條件 | `SD-UT-047`、`SD-IT-054` |
| `SD-BDD-077` | 依 BDD §SD-BDD-077 的原始 SDD 驗收條件 | `SD-UT-048`、`SD-API-036`、`SD-ET-038` |
| `SD-BDD-078` | 依 BDD §SD-BDD-078 的原始 SDD 驗收條件 | `SD-UT-049`、`SD-IT-055`、`SD-IT-061` |
| `SD-BDD-079` | 依 BDD §SD-BDD-079 的原始 SDD 驗收條件 | `SD-UT-050`、`SD-IT-056`、`SD-API-037`、`SD-ET-039` |

## 測試清單使用說明

- 一個測試 ID 表示一組**具體前置、動作與斷言**，不是以測試函式或單行 Gherkin 的數量代替完成度。
- 每項需記 Red（真失敗證據）→ Green → Refactor → 真 Miniflare／Web／Android 可重驗證據；不能因標題有測試 ID 而勾選。
- 演算法先用 UT，但任何 atomic accept／claim release／event sequence／race 都需真 Miniflare D1；HTTP fixture 僅代表 API 層。
- **第 1 場候選**只用 `game_rounds.story_offer_catalog_ids_json`；未來第 2 場起用共用 `game_round_events(kind='story.episode.offers.frozen')` 凍結，不覆寫 Round JSON。真玩家選票、勝出事件都帶 `episodeSeq`，按 episode 區隔、劇情動作另綁 `storySessionId`。**禁止新建 Episode／Offers／Votes 專用表**；本期只支援 episode=1 入口。
- 對方未投票完成前，raw `story.vote.submitted` 只能本人看；HTTP Events Query、WS snapshot／重連及游標必做伺服器端安全投影。
- 完成第一場且使用者人工接受之前不製作其他九個劇本；但 N=2／N=3 規則可用隔離測試資料證明，不能宣稱測試假故事對真玩家可玩。
- 未發布 production、未做雲端真服務驗證，必須保留環境邊界與限制。

## 2026-11-08 實作前風險稽核補強與追溯核對

- **已確認決策**：`SD-RQ-01=B`（同輪多獨立 StorySession 的預留 Schema；本期 App 僅第 1 場）、`SD-RQ-02=A`（未上線、非正式舊遊戲測資未來實作時清除重建）。
- **已補回缺漏**：`SD-GAP-01`、`SD-GAP-02`，共 **2 項**；無剩餘待確認產品問題。
- **新補強**：前次 71 BDD／163 TDD，新增 BDD-072～079 **8 場景**與 UT-043～050 **8 項**、IT-050～061 **12 項**、API-036～037 **2 項**、ET-038～039 **2 項**，合計 **24 個新 TDD ID**。
- **規劃總數**：BDD **79/79 已與驗收條件建立追溯**；TDD **187 項**（Unit 50／Integration 61／API 37／E2E 39）；**已實際驗收 0/187**。
- **實作前風險**：10 項高風險、6 項中風險；所有項目均有使用者確認的需求決策或已確認 SDD 的必要技術緩解及對應測試，詳見 RiskAudit。注意：風險「已完成規劃處置」不表示實作驗證通過。

## 規劃交接紀錄

**交接狀態**：**Ready for well-done（規劃完成、尚未開始實作）**

**最後確認日期**：2026-11-08

**建議實作順序**：MVP-001 第 4 份 `SPEC-001-StoryDialogueAndExit`，依賴 `SPEC-001-PlatformFoundation`、`SPEC-001-AvatarAndPreferences`、`SPEC-001-MatchingSessions`；本輪完成後**不得自行進入第 5 份 AffectionAndFeedback**。

### 文件包

| 類型 | 精確路徑 | 規劃狀態 |
|---|---|---|
| MVP | `datinghigh/docs/requirements/MVP-001-LoveGameDatingApp.md` | 使用者已確認需求與八份切分 |
| SPEC | `datinghigh/docs/specs/SPEC-001-StoryDialogueAndExit.md` | SDD 已確認；含 SD-RQ-01=B、SD-RQ-02=A |
| BDD | `datinghigh/docs/bdd/SPEC-001-StoryDialogueAndExit-BDD.md` | 79 個已追溯場景；執行 0 |
| TDD | `datinghigh/docs/tdd/SPEC-001-StoryDialogueAndExit-TDD.md` | 187 個待執行測試；本文件 |
| RiskAudit | `datinghigh/docs/specs/SPEC-001-StoryDialogueAndExit-RiskAudit.md` | 10 高＋6 中風險已規劃處置；兩題已確認 |

### 已確認風險（16 項）

| 風險 ID | 風險摘要 | 使用者決策／已確認設計處置 | 文件／TDD 回寫位置 | Well-Done 實作注意事項 |
|---|---|---|---|---|
| `SD-RA-01` | 多獨立故事資料模型／唯一場次 | SD-RQ-01=B，新增 episode_seq；本期只啟動第 1 場 | SDD §4.3～4.4；BDD-072～079；TDD UT-043～050、IT-050～061 | 一輪可有已完成多場；同輪最多一個 playing；初始候選不可覆寫 |
| `SD-RA-02` | 尚未上線舊遊戲測資與新版必填欄位衝突 | SD-RQ-02=A；受控非正式資料清除舊遊戲測資並重建 | SDD §4.3；BDD-071；UT-042、IT-048～049 | 不做轉換；本期不清庫；不得碰未知／正式 DB |
| `SD-RA-03` | Matching 接受 transaction 的 changes() guard | 依 SDD 同批 fail closed，真 D1 驗證 | SDD §4.3；SD-IT-001～003、038～040 | 不能產生 accepted 但沒有完整 Round 的半成功 |
| `SD-RA-04` | 同人最後有效投票／邀請方決勝 | 依已確認 SDD 依 episodeSeq+actor 讀最後有效票 | SDD §2/§4.4；SD-IT-013、021、042、053、060 | 跨場舊選票不得覆蓋新場；防同 ID 異 payload |
| `SD-RA-05` | 未決議時另一人選擇隱私 | 依已確認 SDD 伺服器投影，不直接返原事件 | SDD §5；SD-API-005、SD-IT-028、044 | WS／HTTPS／游標皆不得洩漏對方 catalogId |
| `SD-RA-06` | 投票事件隱藏後游標跳漏 | 依已確認 SDD 全域 seq 與授權投影分離 | SDD §5；SD-IT-044、056 | 游標依真 seq 前進，不以可見陣列索引排序 |
| `SD-RA-07` | 舊 Session family 與 WebSocket ticket | 依已確認 SDD 伺服器每次重新驗證 | SDD §4.1；SD-API-002、030、033 | DO attachment 不是身份權威 |
| `SD-RA-08` | D1 提交後 DO 廣播失敗 | 依已確認 SDD 同 requestId receipt + cursor 恢復 | SDD §4.1；SD-IT-033、045 | 不可用新 requestId 自動重送同業務動作 |
| `SD-RA-09` | 原帳號占用表更名連鎖影響 | 依已確認 SDD 只更名，不移除 UNIQUE | SDD §4.3；SD-IT-010、041 | 更新 matching／CLI／查詢與回歸 |
| `SD-RA-10` | end 與其他 mutation 並行 | 依已確認 SDD 真 SQL active／Session／Claim guard | SDD §2/§4.4；SD-IT-030、043、055、061 | 已 ended 不得再送訊或開第二場 |
| `SD-RA-11` | 候選 JSON 無逐元素 FK | 依已確認 SDD 候選在同 batch 驗 published／distinct | SDD §4.3/4.4；SD-IT-003、052、059 | 第 1 場在 Round JSON，後續場次在事件 |
| `SD-RA-12` | 故事版次與私人素材安全 | 依已確認 SDD immutable manifest／R2 hash | SDD §6；SD-IT-014、034、046、047 | retired 版保留已鎖定 Round 存取 |
| `SD-RA-13` | 雙人等待時不可虛構對方回應 | 依已確認 SDD 只顯示真人實際提交 | SDD §2；SD-ET-004～006、027 | 等待中仍可本人探索和聊天 |
| `SD-RA-14` | 首發完整故事與總十場進度混算 | 依已確認 SDD Gate A + Gate B 分別驗收 | SDD §6/§8；SD-ET-012、036 | 未人工完整實玩前不能擴做九場 |
| `SD-RA-15` | 未來搬離 Cloudflare 的通訊綁定 | 依已確認 SDD notifier port + Cloudflare adapter | SDD §4.1.2；SD-UT-018、SD-IT-037 | 只實作當前 DO Adapter，不預做另一套 |
| `SD-RA-16` | end 後事件／名片及 History 排除 | 依已確認 SDD 只保留安全 status 投影 | SDD §2.14；SD-API-008、032 | History/Housekeeping 留未來 MVP，不做清除方案 |

### 已補回缺漏（2 項）

| 缺漏 ID | 缺漏來源 | 補入文件位置 | 補入項目 | 狀態 |
|---|---|---|---|---|
| `SD-GAP-01` | `SD-RA-01` | SDD §2／§4.3～4.4／§5／§8；BDD-072～079；TDD UT-043～050、IT-050～061、API-036～037、ET-038～039 | `game_story_sessions` 九欄含 episode_seq、`UNIQUE(round_id,episode_seq)`、同輪 playing 部分 UNIQUE；第 2 場起候選與每場選票依 `episodeSeq` 存共用 event；本期端點只允許第 1 場 | **已補回文件，未實作** |
| `SD-GAP-02` | `SD-RA-02` | SDD §4.3／§7；BDD-071；TDD UT-042、IT-048～049 | 在已確認的非正式 DatingHigh DB 清除舊遊戲 Round／占用／必要依賴測資，再用新版 Schema 測試，無舊資料轉換或假 Catalog ID；正式／未知環境不可碰 | **已補回文件，未清除資料** |

### 實作注意事項

1. **先做 DB 與 Matching 回歸**：沿用原 `0004` 基線，不修改既有已部署 migration；在新 migration 更名 `game_round_participants` → `game_active_round_claims`、保留四欄及 account_id UNIQUE；Round 7→9 欄，新增四表（**不可增加 Episode／Offers／Votes 表**）。未上線舊遊戲測資依已確認非正式環境的安全範圍清理並以真 D1 檢驗，不碰帳號與 Profile。
2. **多場次只預留資料，不提前開啟功能**：`game_story_sessions` 每輪有 `episode_seq`、`UNIQUE(round_id,episode_seq)`，同輪最多一筆 `chapter_status=playing`；第 1 場候選固定於 Round JSON，未來第 2 場以上候選事件 `story.episode.offers.frozen` 承接；每場最後有效票、`story.selected`、節點及互動要依 episode／storySessionId 隔離。**本期不提供開始第二場的公開 API／WS command／App 入口**；第 2 場只透過隔離 D1 fixture 驗模型。不得把這項預留視為已完成未來續玩。
3. **D1 必須真驗**：Matching accept 中 `changes()=1` guards、`last_event_seq` CAS、UNIQUE、部分唯一索引、雙人 Claims、Round end 競態、舊 episode 投票重播、失敗 rollback；HTTP mock 或內存 fake 不算原子性證據。
4. **即時安全／資料隱私**：WebSocket Hibernation DO 僅為 transport；`.NET` Application/D1 才是權威。短效一次 ticket、family 被撤、未結算票不洩漏、events/query 分頁游標、未知提交 receipt 回查、DO crash 後補漏必須獨立驗證。保持 `IRoundRealtimeNotifier` 與 client WS JSON 契約可攜，未來搬雲只換 Adapter。
5. **先完成真正可玩的 `scene-01 雨聲書店`**：節點圖含主線、支線、合流、兩種結局，兩種共用互動模組，背景／立繪／音效與真人雙端聊天，Web↔Web、Android↔Web 個別證據。Gate A 技術驗證後由使用者 Gate B 完整實玩確認；**沒有確認前不要開始其他九個故事**。只有 N=1 的真故事可玩時正常直接開始，不設第二／第三場才能上線的額外 Gate。
6. **Round ended 與未來模組**：任何故事／聊天／合作／後續名片等變更在同一真 SQL batch 重新檢查 active／Claims／有效 Session。結束後不可回讀私人對話／互動；僅安全 ended 狀態；原 pair 永久排除。History／Housekeeping／保留天數由未來 MVP 處理，不在此期清理／設計。
7. **驗收證據分清**：Unit/Integration/API/E2E 及 Web/Android 各自有有效證據才按完整 TDD ID 勾選，不能用規劃測試代替通過；目前 0/187。iOS 依已確認範圍暫緩，無障礙專項不列本 MVP。雲端／staging 尚未執行不得標通過。

### 不得進入開發的阻斷項

- **無**（僅表示規劃決策已完成；實作與正式驗收仍須依 Well-Done 執行）。

**Perfect-plan 停止點**：此 SPEC 文件鏈已完成使用者決策回寫及規劃交接，接續請使用 `well-done`；本次未修改 Runtime、未做 migration／清庫／部署／測試執行，不延伸下一份 SPEC。
