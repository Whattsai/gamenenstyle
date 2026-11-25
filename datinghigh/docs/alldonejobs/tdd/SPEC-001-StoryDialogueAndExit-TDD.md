# SPEC-001-StoryDialogueAndExit — TDD 結案核證清單

**狀態：使用者已於 2026-11-25 確認驗收完成。** 原始已核證 211 項保留，原未核證 84 項不冒充測試通過；其功能依現行實作對照，已取代或未實作的舊測試計畫不再作開發待辦。既有核證屬原執行版本，與本次使用者驗收分開記錄。

現行功能：真雙向聊天／重連／冪等、候選類別選擇、雙方同意續場、共用場景與靜態角色、個人探索與合作、正式結束及授權撤銷。V3 已由使用者驗收；V4 內容及新 Gate、後續九條由各自 SPEC 負責。正式第二個內容及雲端冷啟動／成本量測未列本次已核證。

[現行 SPEC](../specs/SPEC-001-StoryDialogueAndExit.md)／[驗證與結案對照](../verification/SPEC-001-StoryDialogueAndExit-Verification.md)

## 原已核證案例（211 項）

- [x] **SD-UT-001** — `StartSingleStory_SDBDD001_FollowsDomainRule`（SD-AC-002、SD-AC-017、SD-AC-018）
  - **來源**：`SD-BDD-001` → `SD-AC-002`、`SD-AC-017`、`SD-AC-018`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：配對雙方合格且只有scene-01正式可玩。
  - **執行**：受邀方接受配對。
  - **斷言**：用純規則／Fake 測得『同批建立Round、唯一候選與StorySession』；並驗『兩端直接進劇情不投票』，不以假 SQL 宣稱交易原子性。

- [x] **SD-UT-002** — `OfferTwoStories_SDBDD002_FollowsDomainRule`（SD-AC-002、SD-AC-016、SD-AC-018）
  - **來源**：`SD-BDD-002` → `SD-AC-002`、`SD-AC-016`、`SD-AC-018`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：正式有兩個可玩story_id。
  - **執行**：受邀方接受邀請。
  - **斷言**：用純規則／Fake 測得『Round同批鎖定兩個版本Catalog ID』；並驗『兩端顯示同序兩卡且必須兩人選擇』，不以假 SQL 宣稱交易原子性。

- [x] **SD-UT-003** — `RankTopThreeStories_SDBDD003_FollowsDomainRule`（SD-AC-002、SD-AC-016、SD-AC-018）
  - **來源**：`SD-BDD-003` → `SD-AC-002`、`SD-AC-016`、`SD-AC-018`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：正式有四個可玩story_id。
  - **執行**：受邀方接受邀請。
  - **斷言**：用純規則／Fake 測得『根據兩方興趣固定排名前三個Catalog ID』；並驗『未被推薦的第四個不可投票』，不以假 SQL 宣稱交易原子性。

- [x] **SD-UT-004** — `RankSharedInterests_SDBDD004_FollowsDomainRule`（SD-AC-002）
  - **來源**：`SD-BDD-004` → `SD-AC-002`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：雙方興趣及故事tag已合法發布。
  - **執行**：建立新配對Round。
  - **斷言**：用純規則／Fake 測得『依共同命中、兩方較少命中、總命中排序』；並驗『推薦priority與story_id決定最後同分』，不以假 SQL 宣稱交易原子性。

- [x] **SD-UT-005** — `ResolveSameVotes_SDBDD005_FollowsDomainRule`（SD-AC-016、SD-AC-017）
  - **來源**：`SD-BDD-005` → `SD-AC-016`、`SD-AC-017`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：N為2且A已選X。
  - **執行**：B也選X。
  - **斷言**：用純規則／Fake 測得『D1只建立一筆X的StorySession』；並驗『兩端讀取相同story.selected結果』，不以假 SQL 宣稱交易原子性。

- [x] **SD-UT-006** — `ResolveDifferentVotes_SDBDD006_FollowsDomainRule`（SD-AC-016、SD-AC-017）
  - **來源**：`SD-BDD-006` → `SD-AC-016`、`SD-AC-017`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：B是原始邀請方且A是受邀方。
  - **執行**：A選X而B選Y。
  - **斷言**：用純規則／Fake 測得『決議選Y且記錄原邀請方勝出理由』；並驗『不以先投票或ID大小替代邀請身分』，不以假 SQL 宣稱交易原子性。

- [x] **SD-UT-007** — `RenderIntroScene_SDBDD007_FollowsDomainRule`（SD-AC-003）
  - **來源**：`SD-BDD-007` → `SD-AC-003`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：兩名玩家已進入scene-01。
  - **執行**：開啟第一個劇情節點。
  - **斷言**：用純規則／Fake 測得『顯示專屬背景、3:4人物、旁白與逐句演出』；並驗『呈現原型粉玫瑰深紫與半透明視覺』，不以假 SQL 宣稱交易原子性。

- [x] **SD-UT-008** — `CommitSuggestedMessage_SDBDD008_FollowsDomainRule`（SD-AC-004）
  - **來源**：`SD-BDD-008` → `SD-AC-004`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：A與B在書店破冰節點。
  - **執行**：A選觀察型話題。
  - **斷言**：用純規則／Fake 測得『訊息actor是A且文字取自已釘選版次』；並驗『B只收到A真實發出的訊息』，不以假 SQL 宣稱交易原子性。

- [x] **SD-UT-009** — `CommitFreeMessage_SDBDD009_FollowsDomainRule`（SD-AC-004、SD-AC-005）
  - **來源**：`SD-BDD-009` → `SD-AC-004`、`SD-AC-005`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：A與B在相同active Round並已連線。
  - **執行**：A送出合法文字。
  - **斷言**：用純規則／Fake 測得『D1成功後ACK再向B廣播相同事件序號』；並驗『無系統扮演B也無假已讀』，不以假 SQL 宣稱交易原子性。

- [x] **SD-UT-010** — `ExploreWhilePending_SDBDD010_FollowsDomainRule`（SD-AC-006、SD-AC-014）
  - **來源**：`SD-BDD-010` → `SD-AC-006`、`SD-AC-014`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：A在線但B暫離。
  - **執行**：A調查書籤物件。
  - **斷言**：用純規則／Fake 測得『A取得自己的探索結果』；並驗『雙人閘門仍必須等B真人提交』，不以假 SQL 宣稱交易原子性。

- [x] **SD-UT-011** — `ResolveCooperativeSame_SDBDD011_FollowsDomainRule`（SD-AC-006）
  - **來源**：`SD-BDD-011` → `SD-AC-006`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：雙方已進入cooperative-choice。
  - **執行**：兩人分別提交同選項。
  - **斷言**：用純規則／Fake 測得『模組結算並依故事圖推進』；並驗『不重用另一個節點互動的答題』，不以假 SQL 宣稱交易原子性。

- [x] **SD-UT-012** — `ResolveCooperativeDifferent_SDBDD012_FollowsDomainRule`（SD-AC-006）
  - **來源**：`SD-BDD-012` → `SD-AC-006`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：兩人處於有分歧規則的合作節點。
  - **執行**：各自選擇不同答案。
  - **斷言**：用純規則／Fake 測得『依InteractionDefinition的已發布規則推進』；並驗『不套用選劇情的邀請方優先規則』，不以假 SQL 宣稱交易原子性。

- [x] **SD-UT-013** — `AdvanceStoryBranch_SDBDD013_FollowsDomainRule`（SD-AC-007）
  - **來源**：`SD-BDD-013` → `SD-AC-007`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：主線有可達書籤支線。
  - **執行**：玩家完成支線觸發條件。
  - **斷言**：用純規則／Fake 測得『進入支線後回到指定rejoin節點』；並驗『雙方重連後主線節點一致』，不以假 SQL 宣稱交易原子性。

- [x] **SD-UT-014** — `ResolveMultipleEndings_SDBDD014_FollowsDomainRule`（SD-AC-007）
  - **來源**：`SD-BDD-014` → `SD-AC-007`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：兩組隔離Round選擇不同分支。
  - **執行**：各自完成整章。
  - **斷言**：用純規則／Fake 測得『可達兩種不同結語及視覺結果』；並驗『不以單一intro假裝故事完成』，不以假 SQL 宣稱交易原子性。

- [x] **SD-UT-015** — `CompleteStoryChapter_SDBDD015_FollowsDomainRule`（SD-AC-007）
  - **來源**：`SD-BDD-015` → `SD-AC-007`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：兩名玩家完成scene-01結尾。
  - **執行**：伺服器提交chapter.completed。
  - **斷言**：用純規則／Fake 測得『故事標completed而Round仍active』；並驗『兩人可繼續自由聊天不釋放Claims』，不以假 SQL 宣稱交易原子性。

- [x] **SD-UT-016** — `EndRoundWithConfirmation_SDBDD016_FollowsDomainRule`（SD-AC-008、SD-AC-009）
  - **來源**：`SD-BDD-016` → `SD-AC-008`、`SD-AC-009`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：兩人仍在active Round。
  - **執行**：一方點結束並確認。
  - **斷言**：用純規則／Fake 測得『D1標ended且恰好釋放雙方Claims』；並驗『原account pair永遠不得再配』，不以假 SQL 宣稱交易原子性。

- [x] **SD-UT-017** — `ProjectEndedRound_SDBDD017_FollowsDomainRule`（SD-AC-010、SD-AC-011）
  - **來源**：`SD-BDD-017` → `SD-AC-010`、`SD-AC-011`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：本輪已正式結束。
  - **執行**：原成員查status及舊聊天。
  - **斷言**：用純規則／Fake 測得『status可見ended但聊天不可取回』；並驗『不能讀取結束後新的真人名片』，不以假 SQL 宣稱交易原子性。

- [x] **SD-UT-018** — `RecoverRealtimeCursor_SDBDD018_FollowsDomainRule`（SD-AC-012、SD-AC-019）
  - **來源**：`SD-BDD-018` → `SD-AC-012`、`SD-AC-019`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：玩家已保存上次eventSeq。
  - **執行**：WebSocket斷線後重新授權。
  - **斷言**：用純規則／Fake 測得『藉安全snapshot與游標補齊已提交事件』；並驗『不產生重複訊息或順序倒置』，不以假 SQL 宣稱交易原子性。

- [x] **SD-UT-019** — `LoadPinnedManifest_SDBDD019_FollowsDomainRule`（SD-AC-013）
  - **來源**：`SD-BDD-019` → `SD-AC-013`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：Round已固定勝出StoryVersion。
  - **執行**：玩家開啟故事及推進節點。
  - **斷言**：用純規則／Fake 測得『取得鎖定hash的首屏與必要素材』；並驗『未選故事的巨大圖片不提前載入』，不以假 SQL 宣稱交易原子性。

- [x] **SD-UT-021** — `ValidateGameContentSchema_SDBDD021_FollowsDomainRule`（SD-AC-020）
  - **來源**：`SD-BDD-021` → `SD-AC-020`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：即將套用本SPEC的migration。
  - **執行**：檢視D1 Schema。
  - **斷言**：用純規則／Fake 測得『只建一張content_與三張game_新表』；並驗『不建立Offers或Votes表或額外內容定義表』，不以假 SQL 宣稱交易原子性。

- [x] **SD-UT-022** — `RenameActiveClaims_SDBDD022_FollowsDomainRule`（SD-AC-020）
  - **來源**：`SD-BDD-022` → `SD-AC-020`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：原0004已有game_round_participants。
  - **執行**：套用更名migration。
  - **斷言**：用純規則／Fake 測得『變為game_active_round_claims且四欄與account_id UNIQUE不變』；並驗『Matching與維運路徑同步改名』，不以假 SQL 宣稱交易原子性。

- [x] **SD-UT-023** — `FreezeCandidateOffers_SDBDD023_FollowsDomainRule`（SD-AC-002）
  - **來源**：`SD-BDD-023` → `SD-AC-002`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：既有Round固定N個候選。
  - **執行**：玩家修改興趣或發布新版故事。
  - **斷言**：用純規則／Fake 測得『既有Catalog ID與推薦順序不變』；並驗『只有新Round可見新排名』，不以假 SQL 宣稱交易原子性。

- [x] **SD-UT-024** — `BalanceUnsharedInterests_SDBDD024_FollowsDomainRule`（SD-AC-002）
  - **來源**：`SD-BDD-024` → `SD-AC-002`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：兩人的合法興趣沒有交集。
  - **執行**：進行新Round推薦。
  - **斷言**：用純規則／Fake 測得『先兼顧各別興趣再按priority補足』；並驗『不發明不存在的tag或假劇本』，不以假 SQL 宣稱交易原子性。

- [x] **SD-UT-025** — `ProjectLatestVote_SDBDD025_FollowsDomainRule`（SD-AC-016）
  - **來源**：`SD-BDD-025` → `SD-AC-016`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：A已選X但B尚未選。
  - **執行**：A改選Y。
  - **斷言**：用純規則／Fake 測得『共用事件多一筆且A最新票是Y』；並驗『B仍只知道A已選』，不以假 SQL 宣稱交易原子性。

- [x] **SD-UT-026** — `KeepPendingWhenOffline_SDBDD026_FollowsDomainRule`（SD-AC-016）
  - **來源**：`SD-BDD-026` → `SD-AC-016`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：A已選而B離線。
  - **執行**：A重新登入等待。
  - **斷言**：用純規則／Fake 測得『狀態仍是pending_story_selection』；並驗『沒有超時自動補票』，不以假 SQL 宣稱交易原子性。

- [x] **SD-UT-027** — `DetectExitIntent_SDBDD027_FollowsDomainRule`（SD-AC-008）
  - **來源**：`SD-BDD-027` → `SD-AC-008`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：A輸入先到這邊。
  - **執行**：A觸發送出。
  - **斷言**：用純規則／Fake 測得『只有A看到是否想結束的提示』；並驗『B不知道A尚在考慮退出』，不以假 SQL 宣稱交易原子性。

- [x] **SD-UT-028** — `ContinueAfterExitPrompt_SDBDD028_FollowsDomainRule`（SD-AC-008）
  - **來源**：`SD-BDD-028` → `SD-AC-008`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：本人看到離場語境提示。
  - **執行**：點繼續傳送。
  - **斷言**：用純規則／Fake 測得『Round保持active且訊息仍可由本人送出』；並驗『不擅自結束或通知對方』，不以假 SQL 宣稱交易原子性。

- [x] **SD-UT-029** — `CancelEndConfirmation_SDBDD029_FollowsDomainRule`（SD-AC-008、SD-AC-009）
  - **來源**：`SD-BDD-029` → `SD-AC-008`、`SD-AC-009`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：正式結束確認Dialog已開啟。
  - **執行**：A點取消。
  - **斷言**：用純規則／Fake 測得『不呼叫end且Round仍active』；並驗『Claims及聊天不變』，不以假 SQL 宣稱交易原子性。

- [x] **SD-UT-030** — `ReadRetiredPinnedVersion_SDBDD030_FollowsDomainRule`（SD-AC-013）
  - **來源**：`SD-BDD-030` → `SD-AC-013`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：Round已鎖定Published版本。
  - **執行**：該Catalog版本被標Retired。
  - **斷言**：用純規則／Fake 測得『舊Round仍讀原immutable版本』；並驗『新Round不再推薦退休版本』，不以假 SQL 宣稱交易原子性。

- [x] **SD-UT-031** — `ResumeCooperativeInteraction_SDBDD031_FollowsDomainRule`（SD-AC-014）
  - **來源**：`SD-BDD-031` → `SD-AC-014`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：A已提交互動但B未選。
  - **執行**：B重登後提交真選擇。
  - **斷言**：用純規則／Fake 測得『合作依兩份有效真人答覆結算』；並驗『等待期間A仍可探索與聊天』，不以假 SQL 宣稱交易原子性。

- [x] **SD-UT-032** — `LabelNpcAndSystem_SDBDD032_FollowsDomainRule`（SD-AC-003、SD-AC-014）
  - **來源**：`SD-BDD-032` → `SD-AC-003`、`SD-AC-014`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：故事包含系統與NPC台詞。
  - **執行**：呈現對話場景。
  - **斷言**：用純規則／Fake 測得『NPC與系統標註清楚』；並驗『沒有任何B的人物自動發言』，不以假 SQL 宣稱交易原子性。

- [x] **SD-UT-033** — `RejectNoPublishedStory_SDBDD033_FollowsDomainRule`（SD-AC-002、SD-AC-018）
  - **來源**：`SD-BDD-033` → `SD-AC-002`、`SD-AC-018`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：存在pending邀請但沒有published完整故事。
  - **執行**：B嘗試接受。
  - **斷言**：用純規則／Fake 測得『回NO_PLAYABLE_STORY且邀請不變accepted』；並驗『沒有孤兒Round或Claims』，不以假 SQL 宣稱交易原子性。

- [x] **SD-UT-034** — `RejectSecondPublishedVersion_SDBDD034_FollowsDomainRule`（SD-AC-002、SD-AC-020）
  - **來源**：`SD-BDD-034` → `SD-AC-002`、`SD-AC-020`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：同story_id的v1已發布。
  - **執行**：管理者把v2也設為Published。
  - **斷言**：用純規則／Fake 測得『D1部分唯一索引拒絕重複published』；並驗『舊Round仍可引用v1』，不以假 SQL 宣稱交易原子性。

- [x] **SD-UT-035** — `StabilizeTiedRecommendation_SDBDD035_FollowsDomainRule`（SD-AC-002）
  - **來源**：`SD-BDD-035` → `SD-AC-002`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：多場故事命中指標完全相同。
  - **執行**：資料競態導致重新排名。
  - **斷言**：用純規則／Fake 測得『依priority及story_id得到同序』；並驗『兩端不見隨機結果』，不以假 SQL 宣稱交易原子性。

- [x] **SD-UT-036** — `ValidateUnicodeMessageLength_SDBDD036_FollowsDomainRule`（SD-AC-005）
  - **來源**：`SD-BDD-036` → `SD-AC-005`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：A在合法聊天室輸入中文及emoji。
  - **執行**：分別送出1、500、501個Unicode scalar。
  - **斷言**：用純規則／Fake 測得『1及500合規而501拒絕』；並驗『不以UTF-16 code unit錯判emoji』，不以假 SQL 宣稱交易原子性。

- [x] **SD-UT-037** — `AllocateRoundSequence_SDBDD037_FollowsDomainRule`（SD-AC-005、SD-AC-017）
  - **來源**：`SD-BDD-037` → `SD-AC-005`、`SD-AC-017`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：同Round並行發話及投票。
  - **執行**：兩端同時送出。
  - **斷言**：用純規則／Fake 測得『last_event_seq與事件sequence無重複』；並驗『同ID重播只讀原結果』，不以假 SQL 宣稱交易原子性。

- [x] **SD-UT-038** — `SettleConcurrentVotes_SDBDD038_FollowsDomainRule`（SD-AC-017）
  - **來源**：`SD-BDD-038` → `SD-AC-017`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：兩人於N2同時選擇。
  - **執行**：並行提交D1。
  - **斷言**：用純規則／Fake 測得『UNIQUE round僅一個StorySession與一次決議』；並驗『兩端結果完全一致』，不以假 SQL 宣稱交易原子性。

- [x] **SD-UT-039** — `ResolveLastCommittedVote_SDBDD039_FollowsDomainRule`（SD-AC-017）
  - **來源**：`SD-BDD-039` → `SD-AC-017`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：A先選X再改Y且B未投票。
  - **執行**：B提交X。
  - **斷言**：用純規則／Fake 測得『依A最後有效Y和B有效X結算』；並驗『原邀請方決勝且不可重算』，不以假 SQL 宣稱交易原子性。

- [x] **SD-UT-040** — `RejectParallelRoundClaim_SDBDD040_FollowsDomainRule`（SD-AC-020）
  - **來源**：`SD-BDD-040` → `SD-AC-020`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：A同時收到兩組配對邀請。
  - **執行**：兩筆接受並行提交。
  - **斷言**：用純規則／Fake 測得『Claim.account_id UNIQUE防第二場』；並驗『失敗接受批次無殘留accepted』，不以假 SQL 宣稱交易原子性。

- [x] **SD-UT-041** — `ValidateInteractionSessionForeignKey_SDBDD041_FollowsDomainRule`（SD-AC-020）
  - **來源**：`SD-BDD-041` → `SD-AC-020`；**測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`
  - **前置**：一個故事有多節點互動。
  - **執行**：建立本節點實例。
  - **斷言**：用純規則／Fake 測得『UNIQUE(story_session_id,node_id,definition_id)防重』；並驗『不額外存round_id或story_id』，不以假 SQL 宣稱交易原子性。

- [x] **SD-UT-042** — `ValidateOldGamePurgeTarget_SDBDD071_RejectsUnknownOrProduction`（critical）
  - **來源**：`SD-BDD-071` → `SD-AC-020`、`SD-RQ-02=A`；**位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs` 或已有受控本地操作 policy 模組的等價測試位置。
  - **前置**：已知非正式 DatingHigh 測試 DB、未知環境或標示為正式的 DB。
  - **執行**：規劃中的舊遊戲資料清除操作進行環境及允許清理範圍檢查。
  - **斷言**：只有可核實的非正式 DatingHigh DB 可進行清理；未知環境及正式 DB 拒絕；帳號、Profile、無關資料不屬於清理集合。此項僅驗純規則，不能替代真 D1。

- [x] **SD-UT-043** — `ValidateEpisodeSequence_AfterFirstComplete_AllowsSecondSession`（critical）
  - **來源**：`SD-BDD-072` → `SD-AC-017/020`，`SD-RQ-01=B`；**位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`。
  - **前置**：同 Round 已有 completed episodeSeq=1。
  - **執行**：建立 episodeSeq=2 的純政策流程。
  - **斷言**：不同 episode 可擁有不同 storySessionId、版次與進度，episode>=1 且不把章節分支視為新場。

- [x] **SD-UT-044** — `ValidateSinglePlayingEpisode_WithPreviousPlaying_RejectsNext`（critical）
  - **來源**：`SD-BDD-073` → `SD-AC-017/020`，`SD-RQ-01=B`；**位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`。
  - **前置**：同 Round episodeSeq=1 為 playing。
  - **執行**：嘗試再開 episodeSeq=2。
  - **斷言**：純政策拒絕同輪兩個 playing，合法完成後可新增下一場。

- [x] **SD-UT-045** — `FreezeLaterEpisodeOffers_UsesRoundEventNotRoundJson`（critical）
  - **來源**：`SD-BDD-074` → `SD-AC-017/020`，`SD-RQ-01=B`；**位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`。
  - **前置**：Round 初始候選已鎖定且第 1 場 completed。
  - **執行**：規劃下一場可玩故事排名快照。
  - **斷言**：新場候選放 episodeSeq=2 的 offers.frozen event，初始候選 JSON 保留不變。

- [x] **SD-UT-046** — `ResolveVotes_ByEpisodeAndActor_DoesNotReadEarlierVotes`（critical）
  - **來源**：`SD-BDD-075` → `SD-AC-017/020`，`SD-RQ-01=B`；**位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`。
  - **前置**：同 Round 第 1 場和第 2 場有分別的已提交投票事件。
  - **執行**：取得第 2 場 A、B 最後有效票。
  - **斷言**：從同 episode 的選票重建決議，禁止跨 episode／先舊重播覆蓋新票。

- [x] **SD-UT-047** — `ValidateStoryAction_WithForeignStorySession_RejectsCrossEpisode`（critical）
  - **來源**：`SD-BDD-076` → `SD-AC-017/020`，`SD-RQ-01=B`；**位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`。
  - **前置**：第 1 場與第 2 場 Session ID／node／revision 不同。
  - **執行**：以第 1 場動作提交第 2 場。
  - **斷言**：拒絕錯 Session，Round chat 仍不強制綁 storySessionId。

- [x] **SD-UT-048** — `ValidateCurrentEditionEpisode_AboveOne_IsDisabled`（critical）
  - **來源**：`SD-BDD-077` → `SD-AC-017/020`，`SD-RQ-01=B`；**位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`。
  - **前置**：本期功能旗標固定只開第 1 場，Episode2 未啟用。
  - **執行**：Client 嘗試發送第二場啟動／投票／互動。
  - **斷言**：伺服器政策拒絕 episodeSeq>1，不產生假 StorySession。

- [x] **SD-UT-049** — `ValidateNewEpisodeStart_WhenPriorIncompleteOrEnded_Rejects`（critical）
  - **來源**：`SD-BDD-078` → `SD-AC-017/020`，`SD-RQ-01=B`；**位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`。
  - **前置**：前一場 playing、待選或 Round ended。
  - **執行**：評估未來凍結新場候選。
  - **斷言**：只在 Round active 且前一場 completed 且兩 Claims 有效時允許資料層測試建立後續場次。

- [x] **SD-UT-050** — `ProjectStoryEvents_WithEpisodeSeq_PreservesFirstAndFuture`（critical）
  - **來源**：`SD-BDD-079` → `SD-AC-017/020`，`SD-RQ-01=B`；**位置**：`backend/tests/DatingHigh.Unit.Tests/Application/StoryDialogueTests.cs`。
  - **前置**：事件流包含第 1 場及隔離測試的第 2 場選場與 node 事件。
  - **執行**：伺服器組合 experience／snapshot。
  - **斷言**：episodeSeq=1 與 2 不混淆，故事事件攜帶 storySessionId，Round chat 不被強制歸屬故事。

- [x] **SD-IT-001** — `StartSingleStory_SDBDD001_CommitsAtomically`（SD-AC-002、SD-AC-017、SD-AC-018）
  - **來源**：`SD-BDD-001` → `SD-AC-002`、`SD-AC-017`、`SD-AC-018`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：配對雙方合格且只有scene-01正式可玩。
  - **執行**：受邀方接受配對。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『同批建立Round、唯一候選與StorySession』與『兩端直接進劇情不投票』；檢查沒有部分提交。

- [x] **SD-IT-002** — `OfferTwoStories_SDBDD002_CommitsAtomically`（SD-AC-002、SD-AC-016、SD-AC-018）
  - **來源**：`SD-BDD-002` → `SD-AC-002`、`SD-AC-016`、`SD-AC-018`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：正式有兩個可玩story_id。
  - **執行**：受邀方接受邀請。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『Round同批鎖定兩個版本Catalog ID』與『兩端顯示同序兩卡且必須兩人選擇』；檢查沒有部分提交。

- [x] **SD-IT-003** — `RankTopThreeStories_SDBDD003_CommitsAtomically`（SD-AC-002、SD-AC-016、SD-AC-018）
  - **來源**：`SD-BDD-003` → `SD-AC-002`、`SD-AC-016`、`SD-AC-018`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：正式有四個可玩story_id。
  - **執行**：受邀方接受邀請。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『根據兩方興趣固定排名前三個Catalog ID』與『未被推薦的第四個不可投票』；檢查沒有部分提交。

- [x] **SD-IT-004** — `RankSharedInterests_SDBDD004_CommitsAtomically`（SD-AC-002）
  - **來源**：`SD-BDD-004` → `SD-AC-002`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：雙方興趣及故事tag已合法發布。
  - **執行**：建立新配對Round。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『依共同命中、兩方較少命中、總命中排序』與『推薦priority與story_id決定最後同分』；檢查沒有部分提交。

- [x] **SD-IT-005** — `ResolveSameVotes_SDBDD005_CommitsAtomically`（SD-AC-016、SD-AC-017）
  - **來源**：`SD-BDD-005` → `SD-AC-016`、`SD-AC-017`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：N為2且A已選X。
  - **執行**：B也選X。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『D1只建立一筆X的StorySession』與『兩端讀取相同story.selected結果』；檢查沒有部分提交。

- [x] **SD-IT-006** — `ResolveDifferentVotes_SDBDD006_CommitsAtomically`（SD-AC-016、SD-AC-017）
  - **來源**：`SD-BDD-006` → `SD-AC-016`、`SD-AC-017`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：B是原始邀請方且A是受邀方。
  - **執行**：A選X而B選Y。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『決議選Y且記錄原邀請方勝出理由』與『不以先投票或ID大小替代邀請身分』；檢查沒有部分提交。

- [x] **SD-IT-007** — `EndRoundWithConfirmation_SDBDD016_CommitsAtomically`（SD-AC-008、SD-AC-009）
  - **來源**：`SD-BDD-016` → `SD-AC-008`、`SD-AC-009`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：兩人仍在active Round。
  - **執行**：一方點結束並確認。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『D1標ended且恰好釋放雙方Claims』與『原account pair永遠不得再配』；檢查沒有部分提交。

- [x] **SD-IT-008** — `RecoverRealtimeCursor_SDBDD018_CommitsAtomically`（SD-AC-012、SD-AC-019）
  - **來源**：`SD-BDD-018` → `SD-AC-012`、`SD-AC-019`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：玩家已保存上次eventSeq。
  - **執行**：WebSocket斷線後重新授權。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『藉安全snapshot與游標補齊已提交事件』與『不產生重複訊息或順序倒置』；檢查沒有部分提交。

- [x] **SD-IT-009** — `ValidateGameContentSchema_SDBDD021_CommitsAtomically`（SD-AC-020）
  - **來源**：`SD-BDD-021` → `SD-AC-020`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：即將套用本SPEC的migration。
  - **執行**：檢視D1 Schema。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『只建一張content_與三張game_新表』與『不建立Offers或Votes表或額外內容定義表』；檢查沒有部分提交。

- [x] **SD-IT-010** — `RenameActiveClaims_SDBDD022_CommitsAtomically`（SD-AC-020）
  - **來源**：`SD-BDD-022` → `SD-AC-020`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：原0004已有game_round_participants。
  - **執行**：套用更名migration。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『變為game_active_round_claims且四欄與account_id UNIQUE不變』與『Matching與維運路徑同步改名』；檢查沒有部分提交。

- [x] **SD-IT-011** — `FreezeCandidateOffers_SDBDD023_CommitsAtomically`（SD-AC-002）
  - **來源**：`SD-BDD-023` → `SD-AC-002`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：既有Round固定N個候選。
  - **執行**：玩家修改興趣或發布新版故事。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『既有Catalog ID與推薦順序不變』與『只有新Round可見新排名』；檢查沒有部分提交。

- [x] **SD-IT-012** — `BalanceUnsharedInterests_SDBDD024_CommitsAtomically`（SD-AC-002）
  - **來源**：`SD-BDD-024` → `SD-AC-002`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：兩人的合法興趣沒有交集。
  - **執行**：進行新Round推薦。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『先兼顧各別興趣再按priority補足』與『不發明不存在的tag或假劇本』；檢查沒有部分提交。

- [x] **SD-IT-013** — `ProjectLatestVote_SDBDD025_CommitsAtomically`（SD-AC-016）
  - **來源**：`SD-BDD-025` → `SD-AC-016`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：A已選X但B尚未選。
  - **執行**：A改選Y。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『共用事件多一筆且A最新票是Y』與『B仍只知道A已選』；檢查沒有部分提交。

- [x] **SD-IT-014** — `ReadRetiredPinnedVersion_SDBDD030_CommitsAtomically`（SD-AC-013）
  - **來源**：`SD-BDD-030` → `SD-AC-013`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：Round已鎖定Published版本。
  - **執行**：該Catalog版本被標Retired。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『舊Round仍讀原immutable版本』與『新Round不再推薦退休版本』；檢查沒有部分提交。

- [x] **SD-IT-015** — `RejectNoPublishedStory_SDBDD033_CommitsAtomically`（SD-AC-002、SD-AC-018）
  - **來源**：`SD-BDD-033` → `SD-AC-002`、`SD-AC-018`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：存在pending邀請但沒有published完整故事。
  - **執行**：B嘗試接受。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『回NO_PLAYABLE_STORY且邀請不變accepted』與『沒有孤兒Round或Claims』；檢查沒有部分提交。

- [x] **SD-IT-016** — `RejectSecondPublishedVersion_SDBDD034_CommitsAtomically`（SD-AC-002、SD-AC-020）
  - **來源**：`SD-BDD-034` → `SD-AC-002`、`SD-AC-020`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：同story_id的v1已發布。
  - **執行**：管理者把v2也設為Published。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『D1部分唯一索引拒絕重複published』與『舊Round仍可引用v1』；檢查沒有部分提交。

- [x] **SD-IT-017** — `StabilizeTiedRecommendation_SDBDD035_CommitsAtomically`（SD-AC-002）
  - **來源**：`SD-BDD-035` → `SD-AC-002`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：多場故事命中指標完全相同。
  - **執行**：資料競態導致重新排名。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『依priority及story_id得到同序』與『兩端不見隨機結果』；檢查沒有部分提交。

- [x] **SD-IT-018** — `ValidateUnicodeMessageLength_SDBDD036_CommitsAtomically`（SD-AC-005）
  - **來源**：`SD-BDD-036` → `SD-AC-005`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：A在合法聊天室輸入中文及emoji。
  - **執行**：分別送出1、500、501個Unicode scalar。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『1及500合規而501拒絕』與『不以UTF-16 code unit錯判emoji』；檢查沒有部分提交。

- [x] **SD-IT-019** — `AllocateRoundSequence_SDBDD037_CommitsAtomically`（SD-AC-005、SD-AC-017）
  - **來源**：`SD-BDD-037` → `SD-AC-005`、`SD-AC-017`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：同Round並行發話及投票。
  - **執行**：兩端同時送出。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『last_event_seq與事件sequence無重複』與『同ID重播只讀原結果』；檢查沒有部分提交。

- [x] **SD-IT-020** — `SettleConcurrentVotes_SDBDD038_CommitsAtomically`（SD-AC-017）
  - **來源**：`SD-BDD-038` → `SD-AC-017`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：兩人於N2同時選擇。
  - **執行**：並行提交D1。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『UNIQUE round僅一個StorySession與一次決議』與『兩端結果完全一致』；檢查沒有部分提交。

- [x] **SD-IT-021** — `ResolveLastCommittedVote_SDBDD039_CommitsAtomically`（SD-AC-017）
  - **來源**：`SD-BDD-039` → `SD-AC-017`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：A先選X再改Y且B未投票。
  - **執行**：B提交X。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『依A最後有效Y和B有效X結算』與『原邀請方決勝且不可重算』；檢查沒有部分提交。

- [x] **SD-IT-022** — `RejectParallelRoundClaim_SDBDD040_CommitsAtomically`（SD-AC-020）
  - **來源**：`SD-BDD-040` → `SD-AC-020`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：A同時收到兩組配對邀請。
  - **執行**：兩筆接受並行提交。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『Claim.account_id UNIQUE防第二場』與『失敗接受批次無殘留accepted』；檢查沒有部分提交。

- [x] **SD-IT-023** — `ValidateInteractionSessionForeignKey_SDBDD041_CommitsAtomically`（SD-AC-020）
  - **來源**：`SD-BDD-041` → `SD-AC-020`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：一個故事有多節點互動。
  - **執行**：建立本節點實例。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『UNIQUE(story_session_id,node_id,definition_id)防重』與『不額外存round_id或story_id』；檢查沒有部分提交。

- [x] **SD-IT-024** — `AuthorizeRoundMember_SDBDD042_CommitsAtomically`（SD-AC-001）
  - **來源**：`SD-BDD-042` → `SD-AC-001`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：C不是本Round成員。
  - **執行**：C查experience、events、ticket和WS。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『各入口拒絕且不洩漏房間內容』與『無故事、人物或私有資料外洩』；檢查沒有部分提交。

- [x] **SD-IT-025** — `RejectRevokedSession_SDBDD043_CommitsAtomically`（SD-AC-001、SD-AC-012）
  - **來源**：`SD-BDD-043` → `SD-AC-001`、`SD-AC-012`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：A新裝置登入撤銷舊family。
  - **執行**：舊裝置繼續發WS命令。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『D1拒寫且連線被重驗或關閉』與『無舊身份發話』；檢查沒有部分提交。

- [x] **SD-IT-026** — `RejectUnsafeChatPayload_SDBDD044_CommitsAtomically`（SD-AC-005）
  - **來源**：`SD-BDD-044` → `SD-AC-005`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：A輸入危險控制字元或HTML。
  - **執行**：呼叫文字提交。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『回INVALID_STORY_REQUEST且沒有事件』與『客戶端亦不執行HTML』；檢查沒有部分提交。

- [x] **SD-IT-027** — `RejectForeignVoteCatalog_SDBDD045_CommitsAtomically`（SD-AC-016、SD-AC-017）
  - **來源**：`SD-BDD-045` → `SD-AC-016`、`SD-AC-017`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：本Round候選是X與Y。
  - **執行**：A提交catalogId Z並假稱B為actor。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『伺服器依A Session及Round白名單拒絕』與『沒有事件或Session狀態改變』；檢查沒有部分提交。

- [x] **SD-IT-028** — `RedactPrivateVoteEvent_SDBDD046_CommitsAtomically`（SD-AC-016）
  - **來源**：`SD-BDD-046` → `SD-AC-016`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：A已選X而B還沒選。
  - **執行**：B用events query、snapshot及WS恢復。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『B只能知道A已選而不知Catalog ID』與『原始story.vote.submitted的payload不得外洩』；檢查沒有部分提交。

- [x] **SD-IT-029** — `RejectVoteAfterSelected_SDBDD047_CommitsAtomically`（SD-AC-017）
  - **來源**：`SD-BDD-047` → `SD-AC-017`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：N1已在接受邀請時直接開始。
  - **執行**：任何成員呼叫story/vote。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『回STORY_ALREADY_SELECTED』與『不生成虛構選票』；檢查沒有部分提交。

- [x] **SD-IT-030** — `RejectAfterRoundEnd_SDBDD048_CommitsAtomically`（SD-AC-010）
  - **來源**：`SD-BDD-048` → `SD-AC-010`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：A的end與B的聊天交錯。
  - **執行**：end先提交成功。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『B收到ROUND_NOT_ACTIVE』與『不產生ended後新事件』；檢查沒有部分提交。

- [x] **SD-IT-031** — `DenyEndedEventHistory_SDBDD049_CommitsAtomically`（SD-AC-010、SD-AC-011）
  - **來源**：`SD-BDD-049` → `SD-AC-010`、`SD-AC-011`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：原成員留有舊eventSeq。
  - **執行**：結束後查events或experience。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『無法取得先前私人聊天及互動』與『仍可查安全ended狀態』；檢查沒有部分提交。

- [x] **SD-IT-032** — `ValidateSingleUseTicket_SDBDD050_CommitsAtomically`（SD-AC-012）
  - **來源**：`SD-BDD-050` → `SD-AC-012`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：A曾使用合法短效ticket。
  - **執行**：重播或換Round／裝置使用。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『WS Upgrade拒絕』與『長效Access與Refresh絕不載入URL』；檢查沒有部分提交。

- [x] **SD-IT-033** — `RecoverAfterMissedBroadcast_SDBDD051_CommitsAtomically`（SD-AC-012）
  - **來源**：`SD-BDD-051` → `SD-AC-012`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：D1已commit一則聊天。
  - **執行**：DO在推播前崩潰。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『B重連取得該筆且不重複』與『A用同requestId只讀原receipt』；檢查沒有部分提交。

- [x] **SD-IT-034** — `ValidateStoryGraphManifest_SDBDD052_CommitsAtomically`（SD-AC-013）
  - **來源**：`SD-BDD-052` → `SD-AC-013`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：草稿缺ending或參照無效。
  - **執行**：內容工具檢查發布。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『Catalog不得標published』與『不出現在推薦候選』；檢查沒有部分提交。

- [x] **SD-IT-035** — `RejectPrivateMediaAsset_SDBDD053_CommitsAtomically`（SD-AC-013、SD-AC-020）
  - **來源**：`SD-BDD-053` → `SD-AC-013`、`SD-AC-020`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：劇情manifest指向私人會員照片key。
  - **執行**：嘗試發布或由公開路由讀取。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『拒絕存取與洩漏key』與『只有核准公開劇情資產可讀』；檢查沒有部分提交。

- [x] **SD-IT-036** — `VerifyRenamedClaimQueries_SDBDD054_CommitsAtomically`（SD-AC-020）
  - **來源**：`SD-BDD-054` → `SD-AC-020`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：schema已更名為game_active_round_claims。
  - **執行**：執行Matching與維運真D1完整測試。
  - **斷言**：真 Miniflare D1 的準備陳述式、FK／UNIQUE／CAS／rollback／事件序號符合『舊表名存取必失敗而非誤判通過』與『占用及釋放仍同批保障』；檢查沒有部分提交。

- [x] **SD-IT-038** — `StartSingleStory_SDBDD001_RollsBackAtAnyStep`（SD-AC-002、SD-AC-017、SD-AC-018）
  - **來源**：`SD-BDD-001` → `SD-AC-002`、`SD-AC-017`、`SD-AC-018`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：接收邀請 transaction 依次寫 accepted、Round、Claims、候選、StorySession、event。
  - **執行**：注入任一步 0 changes、FK、UNIQUE 或 SQL error。
  - **斷言**：任一步失敗整個 D1 batch 回滾；無 accepted／孤兒 Round／Claims／部分事件。

- [x] **SD-IT-039** — `OfferTwoStories_SDBDD002_VerifiesInterestSnapshotDuringAccept`（SD-AC-002、SD-AC-016、SD-AC-018）
  - **來源**：`SD-BDD-002` → `SD-AC-002`、`SD-AC-016`、`SD-AC-018`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：配對 accept 前已有合法興趣與內容快照。
  - **執行**：在預查與 commit 間改變 Profile 的配對興趣。
  - **斷言**：不得用過期排名成功接受；重算後才建立 Round。

- [x] **SD-IT-040** — `RankTopThreeStories_SDBDD003_RejectsCatalogPublishRace`（SD-AC-002、SD-AC-016、SD-AC-018）
  - **來源**：`SD-BDD-003` → `SD-AC-002`、`SD-AC-016`、`SD-AC-018`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：排名時有三個 published Catalog。
  - **執行**：提交前其中一個 retired 或改版。
  - **斷言**：同批 guard 拒用舊候選且無部分寫入。

- [x] **SD-IT-041** — `RenameAfterApprovedOldGamePurge_PreservesClaimSchemaAndGuarantees`（SD-AC-020）
  - **來源**：`SD-BDD-022` → `SD-AC-020`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：原始0004已有非正式active Round與Claim；依已確認SD-RQ-02=A清除舊遊戲，不保留假候選。
  - **執行**：先驗非空直接拒絕、受控清理回滾，再套更名migration並以新schema建立真list/get/end測資。
  - **斷言**：四欄、account UNIQUE、兩筆原子釋放不變，帳號Profile保留；舊Round不虛構內容版本。原保留舊active資料前提由較新的清理決策取代。

- [x] **SD-IT-042** — `ProjectLatestVote_SDBDD025_ReconstructsLatestCommittedVote`（SD-AC-016）
  - **來源**：`SD-BDD-025` → `SD-AC-016`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：A多次改票且最後事件包含正確actor。
  - **執行**：B投票與A再次改票競態。
  - **斷言**：按 sequence 線性化讀兩人各自最新有效票；舊冪等不能覆寫。

- [x] **SD-IT-043** — `SettleConcurrentVotes_SDBDD038_SettlesTwoVotesOnce`（SD-AC-017）
  - **來源**：`SD-BDD-038` → `SD-AC-017`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：兩端 vote 與 end 競態。
  - **執行**：並行提交兩份票與 end。
  - **斷言**：只有已成功提交於 end 前的業務有效，StorySession 不可在 ended 後出生。

- [x] **SD-IT-044** — `RedactPrivateVoteEvent_SDBDD046_KeepsCursorDespiteRedaction`（SD-AC-016）
  - **來源**：`SD-BDD-046` → `SD-AC-016`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：A已投票且B需從 afterSeq 重連。
  - **執行**：過濾對方原始投票再增量翻頁。
  - **斷言**：游標不漏後續授權事件、不洩漏A選的Catalog ID或hidden payload。

- [x] **SD-IT-045** — `RecoverAfterMissedBroadcast_SDBDD051_ReadsSameReceiptAfterCrash`（SD-AC-012）
  - **來源**：`SD-BDD-051` → `SD-AC-012`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：D1 commit 成功但DO廣播前消失。
  - **執行**：A以同 clientRequestId 查回receipt。
  - **斷言**：只有一筆原事件，重推或補漏不重複。

- [x] **SD-IT-046** — `ValidateStoryGraphManifest_SDBDD052_PublishesVersionAtomically`（SD-AC-013）
  - **來源**：`SD-BDD-052` → `SD-AC-013`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：首發內容圖、語言、節點及checksum齊全。
  - **執行**：publish前後更新同Story版次。
  - **斷言**：immutable的舊版保留，unique published及R2 manifest hash符合。

- [x] **SD-IT-047** — `RejectPrivateMediaAsset_SDBDD053_BlocksPrivateR2ViaPublicRoute`（SD-AC-013、SD-AC-020）
  - **來源**：`SD-BDD-053` → `SD-AC-013`、`SD-AC-020`；**測試位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`
  - **前置**：同時存在私人FILES與公開story資產。
  - **執行**：透過story content route試探私人照片key。
  - **斷言**：回拒絕且不得曝光PRIVATE URL、明文key或其他人的照片。

- [x] **SD-IT-048** — `RebuildOldGameData_SDBDD071_UsesFreshSchemaOnly`（critical）
  - **來源**：`SD-BDD-071` → `SD-AC-020`、`SD-RQ-02=A`；**位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`、受控 local DB 建置測試。
  - **前置**：明確非正式測試 DB 中預先建立舊 active／ended Round、兩筆 Claims 與必要關聯邀請，同時建立不相關帳號與 Profile。
  - **執行**：實作期依正式受控清理程序清除全部舊遊戲資料及必要依賴，再套用 0005 並建立新版單故事與雙候選 Round 測資。
  - **斷言**：舊 Round／Claims／依賴測資已清理，沒有孤兒 accepted 邀請；帳號／Profile 保留；新版必填候選可正常建立並受 FK／UNIQUE 約束保護；不為舊 Round 偽造版本資料。

- [x] **SD-IT-049** — `RebuildOldGameData_SDBDD071_FailsClosedAndRollsBack`（critical）
  - **來源**：`SD-BDD-071` → `SD-AC-020`、`SD-RQ-02=A`；**位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`、受控 local DB 建置測試。
  - **前置**：在受控 DB 建立舊遊戲記錄、外鍵依賴與非遊戲使用者資料。
  - **執行**：對清理操作注入零列／SQL 錯誤，並對未知環境執行清理防護負例。
  - **斷言**：失敗即回滾而不產生半清理狀態；未知環境不得刪除任何資料；即使清理舊遊戲，也不改動帳號／Profile 或其他專案資料。

- [x] **SD-IT-050** — `PersistSequentialStorySessions_SameRound_DistinctEpisode`（critical）
  - **來源**：`SD-BDD-072` → `SD-AC-017/020`，`SD-RQ-01=B`；**位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`（真 Miniflare D1，不使用 HTTP fixture 假裝 SQL 交易）。
  - **前置**：真 Miniflare D1 已有第一場 completed Session。
  - **執行**：插入 episodeSeq=2 playing Session。
  - **斷言**：兩筆共存、各自保留 node／version 且沒有第五張表。

- [x] **SD-IT-051** — `InsertSecondPlayingSession_WhileFirstPlaying_RollsBack`（critical）
  - **來源**：`SD-BDD-073` → `SD-AC-017/020`，`SD-RQ-01=B`；**位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`（真 Miniflare D1，不使用 HTTP fixture 假裝 SQL 交易）。
  - **前置**：同輪第 1 場狀態 playing。
  - **執行**：並行插入第二場 playing。
  - **斷言**：部分 UNIQUE playing 索引阻止雙開，D1 batch 全回滾。

- [x] **SD-IT-052** — `FreezeEpisodeTwoCandidates_WithRoundEvent_PreservesInitialJson`（critical）
  - **來源**：`SD-BDD-074` → `SD-AC-017/020`，`SD-RQ-01=B`；**位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`（真 Miniflare D1，不使用 HTTP fixture 假裝 SQL 交易）。
  - **前置**：初始候選 JSON 為第 1 場固定 A/B，第一場完成。
  - **執行**：注入有效 episodeSeq=2 offers.frozen 系統事件。
  - **斷言**：第 2 場候選可從事件重建、Round JSON 仍是原 A/B。

- [x] **SD-IT-053** — `SelectSecondEpisode_WithEarlierVotes_UsesOnlyCurrentVote`（critical）
  - **來源**：`SD-BDD-075` → `SD-AC-017/020`，`SD-RQ-01=B`；**位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`（真 Miniflare D1，不使用 HTTP fixture 假裝 SQL 交易）。
  - **前置**：兩位玩家在第 1 場各有票、第二場各有新票。
  - **執行**：結算第 2 場並解析 A/B 每人最後有效票。
  - **斷言**：不採舊票或跨場選項；同回合事件序號有序。

- [x] **SD-IT-054** — `SubmitInteraction_WithWrongStorySession_RejectsAndRollsBack`（critical）
  - **來源**：`SD-BDD-076` → `SD-AC-017/020`，`SD-RQ-01=B`；**位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`（真 Miniflare D1，不使用 HTTP fixture 假裝 SQL 交易）。
  - **前置**：兩個不同 Session 各有互動實例及不同節點。
  - **執行**：把舊場次 interactionInstance 或 nodeId 指向新場次。
  - **斷言**：FK／SQL guard 拒絕跨 Session 寫入，不改動任何節點進度。

- [x] **SD-IT-055** — `FreezeNextEpisode_BeforePriorCompleted_FailsClosed`（critical）
  - **來源**：`SD-BDD-078` → `SD-AC-017/020`，`SD-RQ-01=B`；**位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`（真 Miniflare D1，不使用 HTTP fixture 假裝 SQL 交易）。
  - **前置**：同 Round 前一場 playing。
  - **執行**：嘗試追加新場 offers.frozen 並建立新 Session。
  - **斷言**：SQL guard 必須 fail closed，不能留下孤兒投票／事件。

- [x] **SD-IT-056** — `CommitInitialEpisodeOne_UsesScopedEventPayload`（critical）
  - **來源**：`SD-BDD-079` → `SD-AC-017/020`，`SD-RQ-01=B`；**位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`（真 Miniflare D1，不使用 HTTP fixture 假裝 SQL 交易）。
  - **前置**：真 D1 測試 N1 接受與 N2 兩票結算各一輪。
  - **執行**：檢查 story.selected 和 story.vote.submitted 事件。
  - **斷言**：均攜帶 episodeSeq=1；選定事件綁 storySessionId，符合最後有效票。

- [x] **SD-IT-057** — `InsertDuplicateEpisodeSequence_InSameRound_Rejects`（critical）
  - **來源**：`SD-BDD-072` → `SD-AC-017/020`，`SD-RQ-01=B`；**位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`（真 Miniflare D1，不使用 HTTP fixture 假裝 SQL 交易）。
  - **前置**：真 D1 已存在 (roundId,episodeSeq=1)。
  - **執行**：插入相同 roundId 與 episodeSeq=1 的第二筆。
  - **斷言**：UNIQUE(round_id,episode_seq) 拒絕且原 StorySession 未變。

- [x] **SD-IT-058** — `CompleteFirstThenCreateSecond_PartialUniqueReleases`（critical）
  - **來源**：`SD-BDD-073` → `SD-AC-017/020`，`SD-RQ-01=B`；**位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`（真 Miniflare D1，不使用 HTTP fixture 假裝 SQL 交易）。
  - **前置**：第 1 場 playing，第二場尚未存在。
  - **執行**：原子 completed 第一場後建立 episodeSeq=2 playing。
  - **斷言**：資料庫允許新 playing、歷史完成場次保留；只有一場 playing。

- [x] **SD-IT-059** — `FreezeSameEpisodeTwice_InRacingBatches_Rejects`（critical）
  - **來源**：`SD-BDD-074` → `SD-AC-017/020`，`SD-RQ-01=B`；**位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`（真 Miniflare D1，不使用 HTTP fixture 假裝 SQL 交易）。
  - **前置**：第 1 場 completed，兩個並行流程都想建立第 2 場 offers。
  - **執行**：使用 Round last_event_seq CAS 與同批最大 episode guard。
  - **斷言**：只一組第 2 場候選凍結成功，第二組回滾且不改 Round JSON。

- [x] **SD-IT-060** — `ReplayedOldEpisodeVote_DoesNotOverrideCurrentEpisode`（critical）
  - **來源**：`SD-BDD-075` → `SD-AC-017/020`，`SD-RQ-01=B`；**位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`（真 Miniflare D1，不使用 HTTP fixture 假裝 SQL 交易）。
  - **前置**：已有第 2 場新票，舊第 1 場選票請求延遲重送。
  - **執行**：重放相同 clientRequestId 並嘗試改 payload 及 episodeSeq。
  - **斷言**：相同 payload 回原 receipt；不同 payload 409；不得使第 2 場選票變動。

- [x] **SD-IT-061** — `FreezeNextEpisode_AfterEndOrWithoutClaims_Rejects`（critical）
  - **來源**：`SD-BDD-078` → `SD-AC-017/020`，`SD-RQ-01=B`；**位置**：`cloudflare/tests/story-dialogue-d1.integration.test.ts`（真 Miniflare D1，不使用 HTTP fixture 假裝 SQL 交易）。
  - **前置**：Round 已 ended 或只有零到一筆 Claims。
  - **執行**：嘗試未來多場凍結及選定 D1 batch。
  - **斷言**：失敗封閉並完整回滾，不重建 Claims、不產生新 episode。

- [x] **SD-API-001** — `AuthorizeRoundMember_SDBDD042_ReturnsSafeContract`（SD-AC-001）
  - **來源**：`SD-BDD-042` → `SD-AC-001`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：C不是本Round成員。
  - **執行**：C查experience、events、ticket和WS。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『各入口拒絕且不洩漏房間內容』；錯誤狀態不能洩漏資料且維持 no-store。

- [x] **SD-API-002** — `RejectRevokedSession_SDBDD043_ReturnsSafeContract`（SD-AC-001、SD-AC-012）
  - **來源**：`SD-BDD-043` → `SD-AC-001`、`SD-AC-012`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：A新裝置登入撤銷舊family。
  - **執行**：舊裝置繼續發WS命令。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『D1拒寫且連線被重驗或關閉』；錯誤狀態不能洩漏資料且維持 no-store。

- [x] **SD-API-003** — `RejectUnsafeChatPayload_SDBDD044_ReturnsSafeContract`（SD-AC-005）
  - **來源**：`SD-BDD-044` → `SD-AC-005`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：A輸入危險控制字元或HTML。
  - **執行**：呼叫文字提交。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『回INVALID_STORY_REQUEST且沒有事件』；錯誤狀態不能洩漏資料且維持 no-store。

- [x] **SD-API-004** — `RejectForeignVoteCatalog_SDBDD045_ReturnsSafeContract`（SD-AC-016、SD-AC-017）
  - **來源**：`SD-BDD-045` → `SD-AC-016`、`SD-AC-017`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：本Round候選是X與Y。
  - **執行**：A提交catalogId Z並假稱B為actor。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『伺服器依A Session及Round白名單拒絕』；錯誤狀態不能洩漏資料且維持 no-store。

- [x] **SD-API-005** — `RedactPrivateVoteEvent_SDBDD046_ReturnsSafeContract`（SD-AC-016）
  - **來源**：`SD-BDD-046` → `SD-AC-016`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：A已選X而B還沒選。
  - **執行**：B用events query、snapshot及WS恢復。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『B只能知道A已選而不知Catalog ID』；錯誤狀態不能洩漏資料且維持 no-store。

- [x] **SD-API-006** — `RejectVoteAfterSelected_SDBDD047_ReturnsSafeContract`（SD-AC-017）
  - **來源**：`SD-BDD-047` → `SD-AC-017`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：N1已在接受邀請時直接開始。
  - **執行**：任何成員呼叫story/vote。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『回STORY_ALREADY_SELECTED』；錯誤狀態不能洩漏資料且維持 no-store。

- [x] **SD-API-007** — `RejectAfterRoundEnd_SDBDD048_ReturnsSafeContract`（SD-AC-010）
  - **來源**：`SD-BDD-048` → `SD-AC-010`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：A的end與B的聊天交錯。
  - **執行**：end先提交成功。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『B收到ROUND_NOT_ACTIVE』；錯誤狀態不能洩漏資料且維持 no-store。

- [x] **SD-API-008** — `DenyEndedEventHistory_SDBDD049_ReturnsSafeContract`（SD-AC-010、SD-AC-011）
  - **來源**：`SD-BDD-049` → `SD-AC-010`、`SD-AC-011`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：原成員留有舊eventSeq。
  - **執行**：結束後查events或experience。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『無法取得先前私人聊天及互動』；錯誤狀態不能洩漏資料且維持 no-store。

- [x] **SD-API-009** — `ValidateSingleUseTicket_SDBDD050_ReturnsSafeContract`（SD-AC-012）
  - **來源**：`SD-BDD-050` → `SD-AC-012`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：A曾使用合法短效ticket。
  - **執行**：重播或換Round／裝置使用。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『WS Upgrade拒絕』；錯誤狀態不能洩漏資料且維持 no-store。

- [x] **SD-API-010** — `RecoverAfterMissedBroadcast_SDBDD051_ReturnsSafeContract`（SD-AC-012）
  - **來源**：`SD-BDD-051` → `SD-AC-012`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：D1已commit一則聊天。
  - **執行**：DO在推播前崩潰。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『B重連取得該筆且不重複』；錯誤狀態不能洩漏資料且維持 no-store。

- [x] **SD-API-011** — `ValidateStoryGraphManifest_SDBDD052_ReturnsSafeContract`（SD-AC-013）
  - **來源**：`SD-BDD-052` → `SD-AC-013`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：草稿缺ending或參照無效。
  - **執行**：內容工具檢查發布。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『Catalog不得標published』；錯誤狀態不能洩漏資料且維持 no-store。

- [x] **SD-API-012** — `RejectPrivateMediaAsset_SDBDD053_ReturnsSafeContract`（SD-AC-013、SD-AC-020）
  - **來源**：`SD-BDD-053` → `SD-AC-013`、`SD-AC-020`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：劇情manifest指向私人會員照片key。
  - **執行**：嘗試發布或由公開路由讀取。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『拒絕存取與洩漏key』；錯誤狀態不能洩漏資料且維持 no-store。

- [x] **SD-API-013** — `VerifyRenamedClaimQueries_SDBDD054_ReturnsSafeContract`（SD-AC-020）
  - **來源**：`SD-BDD-054` → `SD-AC-020`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：schema已更名為game_active_round_claims。
  - **執行**：執行Matching與維運真D1完整測試。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『舊表名存取必失敗而非誤判通過』；錯誤狀態不能洩漏資料且維持 no-store。

- [x] **SD-API-014** — `ShowSingleStoryScene_SDBDD055_ReturnsSafeContract`（SD-AC-003、SD-AC-018）
  - **來源**：`SD-BDD-055` → `SD-AC-003`、`SD-AC-018`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：唯一正式故事為scene-01且Round已接受。
  - **執行**：玩家從首頁進場。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『直接顯示書店開場』；錯誤狀態不能洩漏資料且維持 no-store。

- [x] **SD-API-015** — `ShowTwoOfferCards_SDBDD056_ReturnsSafeContract`（SD-AC-002、SD-AC-016）
  - **來源**：`SD-BDD-056` → `SD-AC-002`、`SD-AC-016`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：Round固定兩個Catalog ID。
  - **執行**：兩名玩家開啟選場。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『兩端只有兩張相同順序合法卡片』；錯誤狀態不能洩漏資料且維持 no-store。

- [x] **SD-API-016** — `ShowThreeSafePreviews_SDBDD057_ReturnsSafeContract`（SD-AC-002、SD-AC-016）
  - **來源**：`SD-BDD-057` → `SD-AC-002`、`SD-AC-016`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：Round固定三個Catalog ID。
  - **執行**：兩端開啟選場畫面。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『只呈現三個已授權公開預覽』；錯誤狀態不能洩漏資料且維持 no-store。

- [x] **SD-API-017** — `PreventRepeatedVoteClick_SDBDD058_ReturnsSafeContract`（SD-AC-016）
  - **來源**：`SD-BDD-058` → `SD-AC-016`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：玩家按下提交候選。
  - **執行**：同一按鈕被快速連點。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『按鈕Loading且不重複提交』；錯誤狀態不能洩漏資料且維持 no-store。

- [x] **SD-API-018** — `ShowPendingPartnerStatus_SDBDD059_ReturnsSafeContract`（SD-AC-016）
  - **來源**：`SD-BDD-059` → `SD-AC-016`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：A已投票B未提交。
  - **執行**：A觀看選場等待。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『顯示等待另一方選擇』；錯誤狀態不能洩漏資料且維持 no-store。

- [x] **SD-API-019** — `DisplayInitiatorDecision_SDBDD060_ReturnsSafeContract`（SD-AC-016）
  - **來源**：`SD-BDD-060` → `SD-AC-016`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：雙方投票不同且已結算。
  - **執行**：打開結果畫面。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『顯示採原邀請方的選擇』；錯誤狀態不能洩漏資料且維持 no-store。

- [x] **SD-API-020** — `ShowPendingMessageReceipt_SDBDD061_ReturnsSafeContract`（SD-AC-004、SD-AC-005）
  - **來源**：`SD-BDD-061` → `SD-AC-004`、`SD-AC-005`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：玩家送出合法文字。
  - **執行**：D1還未回覆ACK。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『泡泡顯示送出中直到已提交』；錯誤狀態不能洩漏資料且維持 no-store。

- [x] **SD-API-021** — `ShowRealtimeReconnect_SDBDD062_ReturnsSafeContract`（SD-AC-012）
  - **來源**：`SD-BDD-062` → `SD-AC-012`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：WebSocket意外斷開。
  - **執行**：玩家回前景且網路恢復。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『顯示重新連線中直到補齊』；錯誤狀態不能洩漏資料且維持 no-store。

- [x] **SD-API-022** — `RestoreCoopWaitingCard_SDBDD063_ReturnsSafeContract`（SD-AC-006、SD-AC-014）
  - **來源**：`SD-BDD-063` → `SD-AC-006`、`SD-AC-014`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：A已選而B未選。
  - **執行**：A返回場景。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『顯示等待另一方選擇』；錯誤狀態不能洩漏資料且維持 no-store。

- [x] **SD-API-023** — `RenderAdvEndingFlow_SDBDD064_ReturnsSafeContract`（SD-AC-003、SD-AC-007）
  - **來源**：`SD-BDD-064` → `SD-AC-003`、`SD-AC-007`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：書店有主線支線合流與結尾。
  - **執行**：玩家逐節點完成故事。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『立繪動畫音效與結果按已提交分支呈現』；錯誤狀態不能洩漏資料且維持 no-store。

- [x] **SD-API-024** — `ShowExitPhrasePrompt_SDBDD065_ReturnsSafeContract`（SD-AC-008）
  - **來源**：`SD-BDD-065` → `SD-AC-008`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：A輸入不想繼續。
  - **執行**：本人看到語境提示。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『提供繼續、返回編輯與結束按鈕』；錯誤狀態不能洩漏資料且維持 no-store。

- [x] **SD-API-025** — `ShowPermanentPairWarning_SDBDD066_ReturnsSafeContract`（SD-AC-008、SD-AC-009）
  - **來源**：`SD-BDD-066` → `SD-AC-008`、`SD-AC-009`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：玩家在任意階段按結束本輪。
  - **執行**：彈出二次確認。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『顯示原pair永久不能再配對』；錯誤狀態不能洩漏資料且維持 no-store。

- [x] **SD-API-026** — `ShowEndedRoom_SDBDD067_ReturnsSafeContract`（SD-AC-009、SD-AC-011）
  - **來源**：`SD-BDD-067` → `SD-AC-009`、`SD-AC-011`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：一方已確認結束且D1成功。
  - **執行**：兩端收到ended狀態。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『兩端不得再操作舊聊天』；錯誤狀態不能洩漏資料且維持 no-store。

- [x] **SD-API-027** — `RecoverUncertainSubmit_SDBDD068_ReturnsSafeContract`（SD-AC-001、SD-AC-005）
  - **來源**：`SD-BDD-068` → `SD-AC-001`、`SD-AC-005`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：發訊遇503或結果不明。
  - **執行**：玩家選重新同步。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『顯示目前無法確認送出結果請重新同步』；錯誤狀態不能洩漏資料且維持 no-store。

- [x] **SD-API-028** — `ShowTwoStoriesAfterPublish_SDBDD069_ReturnsSafeContract`（SD-AC-018）
  - **來源**：`SD-BDD-069` → `SD-AC-018`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：第一場已完整且後來第二場Published。
  - **執行**：新一組配對成功。
  - **斷言**：有效 Session／Origin／嚴格 JSON／ProblemDetails 的對應端點符合『新Round自然進入二選一』；錯誤狀態不能洩漏資料且維持 no-store。

- [x] **SD-API-029** — `AuthorizeRoundMember_SDBDD042_RejectsNonmemberOnAllEndpoints`（SD-AC-001）
  - **來源**：`SD-BDD-042` → `SD-AC-001`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：第三人有有效Access卻不是Round成員。
  - **執行**：依序呼叫七個受限HTTP端點及WS握手。
  - **斷言**：所有敏感結果403／404且無私有資料，合法同輪參與者仍可使用。

- [x] **SD-API-030** — `RejectRevokedSession_SDBDD043_RejectsStaleFamilyForEveryCommand`（SD-AC-001、SD-AC-012）
  - **來源**：`SD-BDD-043` → `SD-AC-001`、`SD-AC-012`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：既有Session family已撤銷。
  - **執行**：逐一用舊憑證呼叫vote、end、events及ticket。
  - **斷言**：401 SESSION_REVOKED；不得產生Event或StorySession。

- [x] **SD-API-031** — `RejectVoteAfterSelected_SDBDD047_ValidatesVotePayloadStrictly`（SD-AC-017）
  - **來源**：`SD-BDD-047` → `SD-AC-017`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：本人N2的Round仍待選。
  - **執行**：POST vote傳非本輪Catalog、額外欄位、重複鍵或非法ID。
  - **斷言**：400 INVALID_STORY_VOTE或對應409，未知body拒絕且無DB寫入。

- [x] **SD-API-032** — `DenyEndedEventHistory_SDBDD049_DeniesEndedHistoryRegardlessOfCursor`（SD-AC-010、SD-AC-011）
  - **來源**：`SD-BDD-049` → `SD-AC-010`、`SD-AC-011`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：ended Round有大量舊訊息。
  - **執行**：POST events/query帶任意beforeSeq或afterSeq。
  - **斷言**：不能返還ended前內容，僅status安全摘要。

- [x] **SD-API-033** — `ValidateSingleUseTicket_SDBDD050_RejectsTicketReplayAndWrongOrigin`（SD-AC-012）
  - **來源**：`SD-BDD-050` → `SD-AC-012`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：同票據已使用／Origin不可信。
  - **執行**：發起WS Upgrade。
  - **斷言**：拒重播與跨裝置ticket；不將秘密置入可記錄的URL。

- [x] **SD-API-034** — `ShowTwoOfferCards_SDBDD056_ReturnsSortedCatalogPreviews`（SD-AC-002、SD-AC-016）
  - **來源**：`SD-BDD-056` → `SD-AC-002`、`SD-AC-016`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：Round N2/N3 JSON 已固定Catalog IDs。
  - **執行**：GET story/offers 與 experience。
  - **斷言**：嚴格固定排序和安全欄位，不重算興趣或顯示private score。

- [x] **SD-API-035** — `ShowPendingMessageReceipt_SDBDD061_RecoversUnknownMessageOutcome`（SD-AC-004、SD-AC-005）
  - **來源**：`SD-BDD-061` → `SD-AC-004`、`SD-AC-005`；**測試位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`
  - **前置**：POST或WS命令結果未知。
  - **執行**：用原clientRequestId重查。
  - **斷言**：不自動以不同requestId重送；重試與receipt一致。

- [x] **SD-API-036** — `RejectSecondEpisodeStart_OnCurrentHttpAndWsCommands`（critical）
  - **來源**：`SD-BDD-077`；**位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`／`cloudflare/tests/story-dialogue-websocket.test.ts`。
  - **前置**：第 1 場 completed 且合法登入、Schema 可存多場。
  - **執行**：呼叫本期公開 HTTP/WS 嘗試第二場／提交 episodeSeq=2。
  - **斷言**：不支援的未來行為拒絕，不能透過手填 body 繞過；保留正常聊天與 Round 授權。

- [x] **SD-API-037** — `ExposeEpisodeOneFields_InCurrentExperienceAndAck`（critical）
  - **來源**：`SD-BDD-079`；**位置**：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`／`cloudflare/tests/story-dialogue-websocket.test.ts`。
  - **前置**：N1 或 N2 已結算第一場且 D1 儲存 episodeSeq=1。
  - **執行**：GET experience 與接收 WS story.selected／ACK。
  - **斷言**：有 episodeSeq=1、storySessionId 且版次／節點正確，不洩露第 2 場測試資料。

- [x] **SD-ET-001** — `RenderIntroScene_SDBDD007_RendersRealUserFlow`（SD-AC-003）
  - **來源**：`SD-BDD-007` → `SD-AC-003`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：兩名玩家已進入scene-01。
  - **執行**：開啟第一個劇情節點。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『顯示專屬背景、3:4人物、旁白與逐句演出』；另一端畫面與回復符合『呈現原型粉玫瑰深紫與半透明視覺』，不得以截圖或 mock 當 SQL 證據。

- [x] **SD-ET-002** — `CommitSuggestedMessage_SDBDD008_RendersRealUserFlow`（SD-AC-004）
  - **來源**：`SD-BDD-008` → `SD-AC-004`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：A與B在書店破冰節點。
  - **執行**：A選觀察型話題。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『訊息actor是A且文字取自已釘選版次』；另一端畫面與回復符合『B只收到A真實發出的訊息』，不得以截圖或 mock 當 SQL 證據。

- [x] **SD-ET-003** — `CommitFreeMessage_SDBDD009_RendersRealUserFlow`（SD-AC-004、SD-AC-005）
  - **來源**：`SD-BDD-009` → `SD-AC-004`、`SD-AC-005`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：A與B在相同active Round並已連線。
  - **執行**：A送出合法文字。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『D1成功後ACK再向B廣播相同事件序號』；另一端畫面與回復符合『無系統扮演B也無假已讀』，不得以截圖或 mock 當 SQL 證據。

- [x] **SD-ET-004** — `ExploreWhilePending_SDBDD010_RendersRealUserFlow`（SD-AC-006、SD-AC-014）
  - **來源**：`SD-BDD-010` → `SD-AC-006`、`SD-AC-014`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：A在線但B暫離。
  - **執行**：A調查書籤物件。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『A取得自己的探索結果』；另一端畫面與回復符合『雙人閘門仍必須等B真人提交』，不得以截圖或 mock 當 SQL 證據。

- [x] **SD-ET-005** — `ResolveCooperativeSame_SDBDD011_RendersRealUserFlow`（SD-AC-006）
  - **來源**：`SD-BDD-011` → `SD-AC-006`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：雙方已進入cooperative-choice。
  - **執行**：兩人分別提交同選項。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『模組結算並依故事圖推進』；另一端畫面與回復符合『不重用另一個節點互動的答題』，不得以截圖或 mock 當 SQL 證據。

- [x] **SD-ET-006** — `ResolveCooperativeDifferent_SDBDD012_RendersRealUserFlow`（SD-AC-006）
  - **來源**：`SD-BDD-012` → `SD-AC-006`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：兩人處於有分歧規則的合作節點。
  - **執行**：各自選擇不同答案。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『依InteractionDefinition的已發布規則推進』；另一端畫面與回復符合『不套用選劇情的邀請方優先規則』，不得以截圖或 mock 當 SQL 證據。

- [x] **SD-ET-007** — `AdvanceStoryBranch_SDBDD013_RendersRealUserFlow`（SD-AC-007）
  - **來源**：`SD-BDD-013` → `SD-AC-007`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：主線有可達書籤支線。
  - **執行**：玩家完成支線觸發條件。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『進入支線後回到指定rejoin節點』；另一端畫面與回復符合『雙方重連後主線節點一致』，不得以截圖或 mock 當 SQL 證據。

- [x] **SD-ET-008** — `ResolveMultipleEndings_SDBDD014_RendersRealUserFlow`（SD-AC-007）
  - **來源**：`SD-BDD-014` → `SD-AC-007`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：兩組隔離Round選擇不同分支。
  - **執行**：各自完成整章。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『可達兩種不同結語及視覺結果』；另一端畫面與回復符合『不以單一intro假裝故事完成』，不得以截圖或 mock 當 SQL 證據。

- [x] **SD-ET-009** — `CompleteStoryChapter_SDBDD015_RendersRealUserFlow`（SD-AC-007）
  - **來源**：`SD-BDD-015` → `SD-AC-007`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：兩名玩家完成scene-01結尾。
  - **執行**：伺服器提交chapter.completed。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『故事標completed而Round仍active』；另一端畫面與回復符合『兩人可繼續自由聊天不釋放Claims』，不得以截圖或 mock 當 SQL 證據。

- [x] **SD-ET-010** — `ProjectEndedRound_SDBDD017_RendersRealUserFlow`（SD-AC-010、SD-AC-011）
  - **來源**：`SD-BDD-017` → `SD-AC-010`、`SD-AC-011`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：本輪已正式結束。
  - **執行**：原成員查status及舊聊天。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『status可見ended但聊天不可取回』；另一端畫面與回復符合『不能讀取結束後新的真人名片』，不得以截圖或 mock 當 SQL 證據。

- [x] **SD-ET-011** — `LoadPinnedManifest_SDBDD019_RendersRealUserFlow`（SD-AC-013）
  - **來源**：`SD-BDD-019` → `SD-AC-013`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：Round已固定勝出StoryVersion。
  - **執行**：玩家開啟故事及推進節點。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『取得鎖定hash的首屏與必要素材』；另一端畫面與回復符合『未選故事的巨大圖片不提前載入』，不得以截圖或 mock 當 SQL 證據。

- [x] **SD-ET-014** — `DetectExitIntent_SDBDD027_RendersRealUserFlow`（SD-AC-008）
  - **來源**：`SD-BDD-027` → `SD-AC-008`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：A輸入先到這邊。
  - **執行**：A觸發送出。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『只有A看到是否想結束的提示』；另一端畫面與回復符合『B不知道A尚在考慮退出』，不得以截圖或 mock 當 SQL 證據。

- [x] **SD-ET-015** — `ContinueAfterExitPrompt_SDBDD028_RendersRealUserFlow`（SD-AC-008）
  - **來源**：`SD-BDD-028` → `SD-AC-008`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：本人看到離場語境提示。
  - **執行**：點繼續傳送。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『Round保持active且訊息仍可由本人送出』；另一端畫面與回復符合『不擅自結束或通知對方』，不得以截圖或 mock 當 SQL 證據。

- [x] **SD-ET-016** — `CancelEndConfirmation_SDBDD029_RendersRealUserFlow`（SD-AC-008、SD-AC-009）
  - **來源**：`SD-BDD-029` → `SD-AC-008`、`SD-AC-009`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：正式結束確認Dialog已開啟。
  - **執行**：A點取消。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『不呼叫end且Round仍active』；另一端畫面與回復符合『Claims及聊天不變』，不得以截圖或 mock 當 SQL 證據。

- [x] **SD-ET-017** — `ResumeCooperativeInteraction_SDBDD031_RendersRealUserFlow`（SD-AC-014）
  - **來源**：`SD-BDD-031` → `SD-AC-014`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：A已提交互動但B未選。
  - **執行**：B重登後提交真選擇。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『合作依兩份有效真人答覆結算』；另一端畫面與回復符合『等待期間A仍可探索與聊天』，不得以截圖或 mock 當 SQL 證據。

- [x] **SD-ET-018** — `LabelNpcAndSystem_SDBDD032_RendersRealUserFlow`（SD-AC-003、SD-AC-014）
  - **來源**：`SD-BDD-032` → `SD-AC-003`、`SD-AC-014`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：故事包含系統與NPC台詞。
  - **執行**：呈現對話場景。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『NPC與系統標註清楚』；另一端畫面與回復符合『沒有任何B的人物自動發言』，不得以截圖或 mock 當 SQL 證據。

- [x] **SD-ET-019** — `ShowSingleStoryScene_SDBDD055_RendersRealUserFlow`（SD-AC-003、SD-AC-018）
  - **來源**：`SD-BDD-055` → `SD-AC-003`、`SD-AC-018`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：唯一正式故事為scene-01且Round已接受。
  - **執行**：玩家從首頁進場。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『直接顯示書店開場』；另一端畫面與回復符合『沒有多餘單場選擇頁』，不得以截圖或 mock 當 SQL 證據。

- [x] **SD-ET-025** — `ShowPendingMessageReceipt_SDBDD061_RendersRealUserFlow`（SD-AC-004、SD-AC-005）
  - **來源**：`SD-BDD-061` → `SD-AC-004`、`SD-AC-005`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：玩家送出合法文字。
  - **執行**：D1還未回覆ACK。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『泡泡顯示送出中直到已提交』；另一端畫面與回復符合『沒有實際讀取證據不顯示已讀』，不得以截圖或 mock 當 SQL 證據。

- [x] **SD-ET-026** — `ShowRealtimeReconnect_SDBDD062_RendersRealUserFlow`（SD-AC-012）
  - **來源**：`SD-BDD-062` → `SD-AC-012`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：WebSocket意外斷開。
  - **執行**：玩家回前景且網路恢復。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『顯示重新連線中直到補齊』；另一端畫面與回復符合『未確認結果不宣稱已送達』，不得以截圖或 mock 當 SQL 證據。

- [x] **SD-ET-027** — `RestoreCoopWaitingCard_SDBDD063_RendersRealUserFlow`（SD-AC-006、SD-AC-014）
  - **來源**：`SD-BDD-063` → `SD-AC-006`、`SD-AC-014`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：A已選而B未選。
  - **執行**：A返回場景。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『顯示等待另一方選擇』；另一端畫面與回復符合『可以探索且再打開卡保留答覆』，不得以截圖或 mock 當 SQL 證據。

- [x] **SD-ET-028** — `RenderAdvEndingFlow_SDBDD064_RendersRealUserFlow`（SD-AC-003、SD-AC-007）
  - **來源**：`SD-BDD-064` → `SD-AC-003`、`SD-AC-007`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：書店有主線支線合流與結尾。
  - **執行**：玩家逐節點完成故事。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『立繪動畫音效與結果按已提交分支呈現』；另一端畫面與回復符合『不能只有一個intro冒稱完成』，不得以截圖或 mock 當 SQL 證據。

- [x] **SD-ET-029** — `ShowExitPhrasePrompt_SDBDD065_RendersRealUserFlow`（SD-AC-008）
  - **來源**：`SD-BDD-065` → `SD-AC-008`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：A輸入不想繼續。
  - **執行**：本人看到語境提示。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『提供繼續、返回編輯與結束按鈕』；另一端畫面與回復符合『不通知B本人尚在考慮退出』，不得以截圖或 mock 當 SQL 證據。

- [x] **SD-ET-030** — `ShowPermanentPairWarning_SDBDD066_RendersRealUserFlow`（SD-AC-008、SD-AC-009）
  - **來源**：`SD-BDD-066` → `SD-AC-008`、`SD-AC-009`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：玩家在任意階段按結束本輪。
  - **執行**：彈出二次確認。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『顯示原pair永久不能再配對』；另一端畫面與回復符合『取消不修改任何狀態』，不得以截圖或 mock 當 SQL 證據。

- [x] **SD-ET-031** — `ShowEndedRoom_SDBDD067_RendersRealUserFlow`（SD-AC-009、SD-AC-011）
  - **來源**：`SD-BDD-067` → `SD-AC-009`、`SD-AC-011`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：一方已確認結束且D1成功。
  - **執行**：兩端收到ended狀態。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『兩端不得再操作舊聊天』；另一端畫面與回復符合『返回鍵不能開舊對話』，不得以截圖或 mock 當 SQL 證據。

- [x] **SD-ET-032** — `RecoverUncertainSubmit_SDBDD068_RendersRealUserFlow`（SD-AC-001、SD-AC-005）
  - **來源**：`SD-BDD-068` → `SD-AC-001`、`SD-AC-005`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：發訊遇503或結果不明。
  - **執行**：玩家選重新同步。
  - **斷言**：在真雙帳號 Web 或 Android UI 中逐步證實『顯示目前無法確認送出結果請重新同步』；另一端畫面與回復符合『不得新requestId重寫同句話』，不得以截圖或 mock 當 SQL 證據。

- [x] **SD-ET-035** — `EndRoundWithConfirmation_SDBDD016_EndsRoundWebToAndroid`（SD-AC-008、SD-AC-009）
  - **來源**：`SD-BDD-016` → `SD-AC-008`、`SD-AC-009`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：Web A與Android B均在線。
  - **執行**：A二次確認結束。
  - **斷言**：Android收到room.ended且舊UI不能恢復，兩邊Claims釋放。

- [x] **SD-ET-037** — `ShowRealtimeReconnect_SDBDD062_RestoresOnAndroidForeground`（SD-AC-012）
  - **來源**：`SD-BDD-062` → `SD-AC-012`；**測試位置**：`tests/e2e/web/story-dialogue.spec.ts ＋ tests/e2e/android/story-dialogue.mjs`
  - **前置**：Android B在待選或故事節點轉背景。
  - **執行**：A在Web提交事件、B恢復前景。
  - **斷言**：B補游標／snapshot後正確進度、不得洩漏未結算選票。

- [x] **SD-ET-038** — `OnlyFirstEpisodeAvailable_OnWebAndAndroid`（critical）
  - **來源**：`SD-BDD-077`；**位置**：`tests/e2e/web/story-dialogue.spec.ts`＋`tests/e2e/android/story-dialogue.mjs`。
  - **前置**：真雙帳號在本期 scene-01 的 chapter completed。
  - **執行**：Web 與 Android 分別檢查遊戲畫面與互動入口。
  - **斷言**：只允許 Round 聊天，沒有再選其他獨立劇本按鈕、也不以 API 隱藏入口繞過。

- [x] **SD-ET-039** — `InitialEpisodeOne_FollowsSameIdsAcrossClients`（critical）
  - **來源**：`SD-BDD-079`；**位置**：`tests/e2e/web/story-dialogue.spec.ts`＋`tests/e2e/android/story-dialogue.mjs`。
  - **前置**：真雙帳號 Web↔Android 在第 1 場 N1 或 N2 完成選場。
  - **執行**：兩端同時進場、聊天、斷線重連。
  - **斷言**：都投影 episodeSeq=1 和同一 storySessionId；不會重建 Episode2。

- [x] **SD-UT-051** — `DualPOV_WhenTriggered_ShouldFollowRules`（critical；預定位置：`frontend/client/tests/unit/story-visual-policy.test.tsx`）
  - **來源**：`SD-BDD-080` → `SD-AC-021`、`SD-AC-023`、`SD-AC-022`、`SD-AC-029`；**前置**：雙方是有效active Round成員且各有已授權全身化身。
  - **執行**：A與B同時從不同裝置進入雨聲書店。
  - **斷言**：A看見B、B看見A各自正式已選角色與相同權威故事節點；主場景不顯示雙人並排卡片或把NPC冒充對方。
  - **測試邊界**：純 Domain／UI model，不能當作 R2／D1／人工畫質證據。

- [x] **SD-UT-052** — `FreeAvatarUpperBody_WhenTriggered_ShouldFollowRules`（critical；預定位置：`backend/tests/DatingHigh.Unit.Tests/Application/AvatarExpressionPolicyTests.cs`）
  - **來源**：`SD-BDD-081` → `SD-AC-022`、`SD-AC-029`；**前置**：已有16張凍結的免費原畫與固定builtinAvatarId。
  - **執行**：美術完成各角色全身版本並比較鎖定區域。
  - **斷言**：16張原圖與hash未被覆寫，穩定ID不變；AI全身延伸與原圖逐款視覺比對，角色身份、髮型、原衣裝與氣質經使用者確認；下半身腿鞋與全身比例自然，使用者逐批確認後才輸出；依後續決策不增加逐像素相等或原上半身鎖回合成門檻。
  - **測試邊界**：純 Domain／UI model，不能當作 R2／D1／人工畫質證據。

- [x] **SD-UT-053** — `FreeAvatarFiveFaces_WhenTriggered_ShouldFollowRules`（critical；預定位置：`backend/tests/DatingHigh.Unit.Tests/Application/AvatarExpressionPolicyTests.cs`）
  - **來源**：`SD-BDD-082` → `SD-AC-022`、`SD-AC-029`；**前置**：每款免費全身master均已通過原畫保真驗收。
  - **執行**：產出neutral、smile、surprised、thoughtful、concerned套組。
  - **斷言**：共16×5種固定表情均可用且髮型、上衣、腿鞋與站姿保持一致；玩家選免費角色或切回免費角色不呼叫Gemini。
  - **測試邊界**：純 Domain／UI model，不能當作 R2／D1／人工畫質證據。

- [x] **SD-UT-054** — `AIInitialFullBody_WhenTriggered_ShouldFollowRules`（critical；預定位置：`frontend/client/tests/unit/story-visual-policy.test.tsx`）
  - **來源**：`SD-BDD-083` → `SD-AC-022`、`SD-AC-029`；**前置**：本人已授權的真人照片足夠且本輪尚未生成四張成功候選。
  - **執行**：本人明確按開始產生或產生下一張。
  - **斷言**：本次只生成一張3:4完整頭手腿鞋的全身插畫候選且可預覽；保留真人五官相似度與最多四張成功候選的原額度，不先做半身再擴圖。
  - **測試邊界**：純 Domain／UI model，不能當作 R2／D1／人工畫質證據。

- [x] **SD-UT-055** — `B1ForegroundLock_WhenTriggered_ShouldFollowRules`（critical；實際位置：`frontend/client/tests/unit/dating-profile-screen.test.tsx`、`avatar-adoption.test.ts`）
  - **來源**：`SD-BDD-084` → `SD-AC-022`、`SD-AC-029`；**前置**：本人已選擇一張全身候選並確認採用。
  - **執行**：五表情前景作業正在依序執行。
  - **斷言**：顯示目前表情與製作進度且其他角色、重新產候選、重複採用皆不可操作；直到套組真正ready之前本人及對方仍使用舊化身，無背景產圖Job。
  - **測試邊界**：純 Domain／UI model，不能當作 R2／D1／人工畫質證據。

- [x] **SD-UT-056** — `B1ReadyCommit_WhenTriggered_ShouldFollowRules`（critical；預定位置：`backend/tests/DatingHigh.Unit.Tests/Application/AvatarExpressionPolicyTests.cs`）
  - **來源**：`SD-BDD-085` → `SD-AC-022`、`SD-AC-029`；**前置**：同一全身master的固定五表情已各自儲存並核驗來源、hash與大小。
  - **執行**：B1流程完成並提交一次正式採用。
  - **斷言**：私人R2 Manifest先成ready再由D1條件交易一次更換已選角色；只有此時遊戲對方可收到新化身，半套成功不得切角。
  - **測試邊界**：純 Domain／UI model，不能當作 R2／D1／人工畫質證據。

- [x] **SD-UT-057** — `B1FailedRetry_WhenTriggered_ShouldFollowRules`（critical；預定位置：`frontend/client/tests/unit/story-visual-policy.test.tsx`）
  - **來源**：`SD-BDD-086` → `SD-AC-022`；**前置**：B1已完成neutral與smile而surprised失敗。
  - **執行**：本人按重試或取消。
  - **斷言**：重試只呼叫缺漏項而不重產已成功圖；取消保留原選角；候選來源過期或提交結果不明時提供明確復原操作，不盲目再呼叫Gemini。
  - **測試邊界**：純 Domain／UI model，不能當作 R2／D1／人工畫質證據。

- [x] **SD-UT-058** — `B1CrossDeviceGuard_WhenTriggered_ShouldFollowRules`（critical；預定位置：`backend/tests/DatingHigh.Unit.Tests/Application/AvatarExpressionPolicyTests.cs`）
  - **來源**：`SD-BDD-087` → `SD-AC-022`；**前置**：同一帳號裝置A已為候選持有有效R2 CAS作業。
  - **執行**：裝置B同時選其他免費或AI化身。
  - **斷言**：後端拒絕競態變更並顯示正在製作角色請完成後再切換；失效lease／過期revision回覆不得覆蓋晚於它的正式角色狀態。
  - **測試邊界**：純 Domain／UI model，不能當作 R2／D1／人工畫質證據。

- [x] **SD-UT-059** — `ManifestValidation_WhenTriggered_ShouldFollowRules`（critical；預定位置：`backend/tests/DatingHigh.Unit.Tests/Application/AvatarExpressionPolicyTests.cs`）
  - **來源**：`SD-BDD-088` → `SD-AC-022`、`SD-AC-029`；**前置**：R2已有五個檔名但其中一張hash錯、來源錯或站姿缺腳。
  - **執行**：服務嘗試將avatarAssetId與兩種規格版本的Manifest標為ready。
  - **斷言**：權威驗證拒絕ready且不正式採用；相同來源、五表情與full-body規格均完整通過才可不可變發佈。
  - **測試邊界**：純 Domain／UI model，不能當作 R2／D1／人工畫質證據。

- [x] **SD-UT-060** — `ManifestReuse_WhenTriggered_ShouldFollowRules`（critical；預定位置：`backend/tests/DatingHigh.Unit.Tests/Application/AvatarExpressionPolicyTests.cs`）
  - **來源**：`SD-BDD-089` → `SD-AC-022`、`SD-AC-029`；**前置**：角色A的全身五表情Manifest已ready且保存原hash。
  - **執行**：玩家從A切到B再選回A並重登與重新進場。
  - **斷言**：只讀既有Manifest與素材，Gemini呼叫為零且不重壓縮；角色ID、五表情版次與full-body版次完全相同才可命中套組。
  - **測試邊界**：純 Domain／UI model，不能當作 R2／D1／人工畫質證據。

- [x] **SD-UT-061** — `LegacyHalfBody_NoUpgradePath_ShouldUseCleanReset`（critical；實際位置：`cloudflare/tests/avatar-reset-d1-r2.integration.test.ts`、本地 `avatar-reset-20261113-b` 完整清理計畫）
  - **來源**：`SD-BDD-090` → `SD-AC-022`、`SD-AC-029`、`SD-AC-030`。
  - **前置**：DatingHigh 尚未上線、非正式環境仍存在舊半身 AI 測試化身，新的全身版資產政策要求 `full-body.v1 ready`。
  - **執行**：純規則：若目標為舊半身角色，不提供舊 ID 升級、補表情或相容選角流程。
  - **斷言**：沒有半身 → 全身的舊角色升級 UI／API、沒有保留舊 avatar ID 的轉換、沒有在進場時背景生成；新全身功能實作完成後，透過 `UX-AUDIT-RQ-01=CLEAN-RESET` 驗證舊測資清除再從零建立新角色。
  - **驗收**：本項僅測對應層級，不代表已實際執行刪除或完成全新 Gate B。

- [x] **SD-UT-062** — `R2D1Commit_WhenTriggered_ShouldFollowRules`（critical；預定位置：`backend/tests/DatingHigh.Unit.Tests/Application/AvatarExpressionPolicyTests.cs`）
  - **來源**：`SD-BDD-091` → `SD-AC-022`、`SD-AC-023`；**前置**：私人R2全身五表情套組已ready但D1 Profile修訂衝突或回覆不明。
  - **執行**：客戶端重試正式採用或另一玩家讀取對方化身。
  - **斷言**：以穩定requestId和Profile revision查回真實採用結果，未提交者仍顯示舊角色；不得假稱R2和D1跨服務原子交易或因未知回覆重新產圖。
  - **測試邊界**：純 Domain／UI model，不能當作 R2／D1／人工畫質證據。

- [x] **SD-UT-063** — `PrivateMediaACL_WhenTriggered_ShouldFollowRules`（critical；預定位置：`backend/tests/DatingHigh.Unit.Tests/Application/AvatarExpressionPolicyTests.cs`）
  - **來源**：`SD-BDD-092` → `SD-AC-022`、`SD-AC-023`；**前置**：本人有私人R2全身五表情而第三人、非active Round或ended玩家取得素材線索。
  - **執行**：第三人或已失去授權者要求圖片、Manifest或暫存候選。
  - **斷言**：伺服器拒絕存取且不回傳私人objectKey、真人來源照或未採用候選；只有同輪有效真參與者可讀對方已正式採用的投影。
  - **測試邊界**：純 Domain／UI model，不能當作 R2／D1／人工畫質證據。

- [x] **SD-UT-064** — `AvatarUpdateNotice_WhenTriggered_ShouldFollowRules`（critical；預定位置：`backend/tests/DatingHigh.Unit.Tests/Application/AvatarExpressionPolicyTests.cs`）
  - **來源**：`SD-BDD-093` → `SD-AC-023`；**前置**：A與B在同一有效Round且B保持房間WebSocket連線。
  - **執行**：A正式採用新免費或全身AI化身且D1交易成功。
  - **斷言**：對B推送去識別化的avatar.updated版本提示，B才按需取得一次最新授權角色素材；採用未提交或尚在B1製作期間不通知，事件不傳原圖或R2私有key。
  - **測試邊界**：純 Domain／UI model，不能當作 R2／D1／人工畫質證據。

- [x] **SD-UT-065** — `ReconnectionDedupe_WhenTriggered_ShouldFollowRules`（critical；預定位置：`backend/tests/DatingHigh.Unit.Tests/Application/AvatarExpressionPolicyTests.cs`）
  - **來源**：`SD-BDD-094` → `SD-AC-023`；**前置**：B已收到某角色版本提示且之後短暫斷線。
  - **執行**：同一通知重送、晚到舊版本或B重新登入。
  - **斷言**：重複或較舊版本被去重，重連才做一次權威版本校正；正常播放每秒與每句台詞都不查D1化身，通知失敗不導致定時輪詢。
  - **測試邊界**：純 Domain／UI model，不能當作 R2／D1／人工畫質證據。

- [x] **SD-UT-066** — `LineSafeSwap_WhenTriggered_ShouldFollowRules`（critical；實際位置：`frontend/client/tests/unit/story-portrait.test.tsx`）
  - **來源**：`SD-BDD-095` → `SD-AC-023`、`SD-AC-021`、`SD-AC-029`；**前置**：B正在播放書店一句劇情且收到A已正式採用的新全身角色版本。
  - **執行**：新五表情素材預載成功而當前句結束。
  - **斷言**：下一個安全可操作狀態原子換成新角色與同版五表情；不等整個StoryNode、不在一句話中間混兩張臉、沒有重新生成。
  - **測試邊界**：純 Domain／UI model，不能當作 R2／D1／人工畫質證據。

- [x] **SD-UT-067** — `StageFullBodyCamera_WhenTriggered_ShouldFollowRules`（critical；預定位置：`frontend/client/tests/unit/story-visual-policy.test.tsx`）
  - **來源**：`SD-BDD-096` → `SD-AC-021`、`SD-AC-029`、`SD-AC-023`；**前置**：已授權的全身master具完整四肢、鞋底、遮罩及安全錨點。
  - **執行**：場景依劇情切換站立遠景、半身中景與臉部近景。
  - **斷言**：使用同一組master視覺合成且人物比例、地面落點與面部細節一致；不產生不存在的坐下、行走、轉身等骨架姿勢或從場景圖烙印真人。
  - **測試邊界**：純 Domain／UI model，不能當作 R2／D1／人工畫質證據。

- [x] **SD-UT-068** — `PlatformSafeZone_WhenTriggered_ShouldFollowRules`（critical；預定位置：`frontend/client/tests/unit/story-visual-policy.test.tsx`）
  - **來源**：`SD-BDD-097` → `SD-AC-021`、`SD-AC-023`、`SD-AC-024`；**前置**：Web寬螢幕與Android直向都載入同一段全身場景。
  - **執行**：開啟輸入法、展開聊天抽屜、調整視窗尺寸。
  - **斷言**：角色anchor、足部遮擋與臉部安全框重排且熱區仍對準原物件；HUD及鍵盤不遮擋重要的人臉、選項與結束入口。
  - **測試邊界**：純 Domain／UI model，不能當作 R2／D1／人工畫質證據。

- [x] **SD-UT-069** — `SceneChatDrawer_WhenTriggered_ShouldFollowRules`（critical；實際位置：`frontend/client/tests/unit/story-dialogue-ui.test.tsx`）
  - **來源**：`SD-BDD-098` → `SD-AC-024`；**前置**：兩人正在第一場書店的有效StoryNode。
  - **執行**：玩家展開聊天室、送真訊息再收起。
  - **斷言**：ADV場景保持原本進度與對方化身，同時保留本人可回看之真人聊天；收合／展開不重置節點、錯把NPC台詞當真人訊息。
  - **測試邊界**：純 Domain／UI model，不能當作 R2／D1／人工畫質證據。

- [x] **SD-UT-070** — `MessageStatus_WhenTriggered_ShouldFollowRules`（critical；預定位置：`frontend/client/tests/unit/story-visual-policy.test.tsx`）
  - **來源**：`SD-BDD-099` → `SD-AC-024`、`SD-AC-025`；**前置**：玩家開著聊天室且WebSocket暫斷或提交回應不明。
  - **執行**：本人送訊或重連回查原requestId。
  - **斷言**：送出中、成功、結果不明清楚區別並可復原；不可憑前端動畫推論另一人已讀或已回答。
  - **測試邊界**：純 Domain／UI model，不能當作 R2／D1／人工畫質證據。

- [x] **SD-UT-071** — `SceneHotspots_WhenTriggered_ShouldFollowRules`（critical；實際位置：`frontend/client/tests/unit/story-stage.test.tsx`、`story-stage-geometry.test.ts`）
  - **來源**：`SD-BDD-100` → `SD-AC-025`；**前置**：書店書籤、書架與桌面已有版本化heatmap熱區定義。
  - **執行**：玩家在Web或Android點擊對應可見物件。
  - **斷言**：進入正確inspect-object特寫並可返回原場景；不會誤觸角色或因縮放錯點別的物件。
  - **測試邊界**：純 Domain／UI model，不能當作 R2／D1／人工畫質證據。

- [x] **SD-UT-072** — `HotspotNoCommit_WhenTriggered_ShouldFollowRules`（critical；預定位置：`frontend/client/tests/unit/story-visual-policy.test.tsx`）
  - **來源**：`SD-BDD-101` → `SD-AC-025`、`SD-AC-026`；**前置**：雙人合作選書互動尚未真正提交。
  - **執行**：玩家點道具、返回、再次檢視然後才選提交。
  - **斷言**：只有本人明確按送出才產生有效合作事件；熱區動畫、特寫或返回不替另一方作答。
  - **測試邊界**：純 Domain／UI model，不能當作 R2／D1／人工畫質證據。

- [x] **SD-UT-073** — `CinematicLight_WhenTriggered_ShouldFollowRules`（normal；預定位置：`frontend/client/tests/unit/story-visual-policy.test.tsx`）
  - **來源**：`SD-BDD-102` → `SD-AC-026`；**前置**：雨聲書店包含入店、書籤、支線、合流與兩結局。
  - **執行**：玩家依真故事路徑逐節點遊玩。
  - **斷言**：鏡頭、光色與前景層有可驗證的敘事差異；同選和異選兩種結局不只更換標題。
  - **測試邊界**：純 Domain／UI model，不能當作 R2／D1／人工畫質證據。

- [x] **SD-UT-074** — `SkipCameraRecover_WhenTriggered_ShouldFollowRules`（critical；預定位置：`frontend/client/tests/unit/story-visual-policy.test.tsx`）
  - **來源**：`SD-BDD-103` → `SD-AC-026`、`SD-AC-027`；**前置**：使用者可略過轉場或演出中斷線後重入。
  - **執行**：本人點略過或重新登入恢復節點。
  - **斷言**：本地演出在安全鏡位復原且仍可選互動及離場；不得跳過伺服器提交、重播對方投票或裁掉臉。
  - **測試邊界**：純 Domain／UI model，不能當作 R2／D1／人工畫質證據。

- [x] **SD-UT-075** — `AmbientSound_WhenTriggered_ShouldFollowRules`（normal；預定位置：`frontend/client/tests/unit/story-visual-policy.test.tsx`）
  - **來源**：`SD-BDD-104` → `SD-AC-027`；**前置**：使用者已主動啟動音訊且書店場景含雨聲、翻書、燈光微動。
  - **執行**：使用者調整音量與靜音再切換節點。
  - **斷言**：音效與微動態依場景切換且音量設定有效；不把音效播放或微動作當作真人在線證據。
  - **測試邊界**：純 Domain／UI model，不能當作 R2／D1／人工畫質證據。

- [x] **SD-UT-076** — `MutedAudioSafe_WhenTriggered_ShouldFollowRules`（critical；預定位置：`frontend/client/tests/unit/story-visual-policy.test.tsx`）
  - **來源**：`SD-BDD-105` → `SD-AC-027`、`SD-AC-028`；**前置**：瀏覽器拒絕自動播放或Android音效載入失敗。
  - **執行**：玩家繼續旁白、選項、合作與真人聊天。
  - **斷言**：不阻止任何遊玩操作、畫面有可用的靜音狀態；進入背景或性能較差時可以停止裝飾微動效。
  - **測試邊界**：純 Domain／UI model，不能當作 R2／D1／人工畫質證據。

- [x] **SD-UT-077** — `CoopStateVisuals_WhenTriggered_ShouldFollowRules`（critical；預定位置：`frontend/client/tests/unit/story-visual-policy.test.tsx`）
  - **來源**：`SD-BDD-106` → `SD-AC-028`；**前置**：書店兩人合作選擇有伺服器權威提交狀態。
  - **執行**：A按提交後等待B，遇到送出中及結果不明。
  - **斷言**：送出中、已提交、未知、待對方與結算有不同可辨視覺提示；不能用本地動畫假裝B已同意或系統已結算。
  - **測試邊界**：純 Domain／UI model，不能當作 R2／D1／人工畫質證據。

- [x] **SD-UT-078** — `EndingVisualFeedback_WhenTriggered_ShouldFollowRules`（critical；預定位置：`frontend/client/tests/unit/story-visual-policy.test.tsx`）
  - **來源**：`SD-BDD-107` → `SD-AC-028`、`SD-AC-022`、`SD-AC-023`；**前置**：兩人已依伺服器決議得到同選或異選結局。
  - **執行**：雙方各自觀看對方角色與書籤演出。
  - **斷言**：兩種結局的舞台道具、結果動畫、台詞及光色分別對應真提交；chapter.completed仍可聊天，Round需額外正式確認才結束。
  - **測試邊界**：純 Domain／UI model，不能當作 R2／D1／人工畫質證據。

- [x] **SD-UT-079** — `ScriptedNoRealEmotion_WhenTriggered_ShouldFollowRules`（critical；預定位置：`backend/tests/DatingHigh.Unit.Tests/Application/AvatarExpressionPolicyTests.cs`）
  - **來源**：`SD-BDD-108` → `SD-AC-022`、`SD-AC-023`、`SD-AC-029`；**前置**：Story manifest只讓旁白與店員NPC說話且對方用真人自由聊天。
  - **執行**：場景指定對方avatar的thoughtful表情並收到真人訊息。
  - **斷言**：僅播放虛擬人物非語言表情，NPC和真人聊天仍各自有明確來源；不讓對方嘴型配NPC台詞、判斷真人已讀或自動替他發話。
  - **測試邊界**：純 Domain／UI model，不能當作 R2／D1／人工畫質證據。

- [x] **SD-UT-080** — `AlphaCompression_WhenTriggered_ShouldFollowRules`（critical；預定位置：`backend/tests/DatingHigh.Unit.Tests/Application/AvatarExpressionPolicyTests.cs`）
  - **來源**：`SD-BDD-109` → `SD-AC-022`、`SD-AC-023`、`SD-AC-029`；**前置**：同一個3:4全身master要製作五種表情且各有大小品質標準。
  - **執行**：共用SkiaSharp壓縮以200000 bytes初始目標處理並驗alpha與近臉細節。
  - **斷言**：合格時保留透明WebP或遮罩、MIME/尺寸/hash可驗且五官清楚；若1K或大小目標使臉糊或alpha鋪白，拒絕ready並留下可調整的品質證據。
  - **測試邊界**：純 Domain／UI model，不能當作 R2／D1／人工畫質證據。

- [x] **SD-UT-081** — `AssetCacheReuse_WhenTriggered_ShouldFollowRules`（normal；實際位置：`frontend/client/tests/unit/story-portrait.test.tsx`）
  - **來源**：`SD-BDD-110` → `SD-AC-023`、`SD-AC-029`、`SD-AC-021`、`SD-AC-022`、`SD-AC-024`、`SD-AC-025`、`SD-AC-026`、`SD-AC-027`；**前置**：同一角色與Manifest資產版本已合法ready。
  - **執行**：兩玩家在同一章節往返書架、桌邊、支線並切換表情。
  - **斷言**：已載入的master與表情素材命中快取，版本更動才失效；不在每句重抓完整圖片或以場景背景替換私人角色。
  - **測試邊界**：純 Domain／UI model，不能當作 R2／D1／人工畫質證據。

- [x] **SD-IT-063** — `FreeAvatarUpperBody_WithDependencies_ShouldPreserveStateAndAuthority`（critical；預定位置：`cloudflare/tests/avatar-expression-r2.integration.test.ts`）
  - **來源**：`SD-BDD-081` → `SD-AC-022`、`SD-AC-029`；**前置**：已有16張凍結的免費原畫與固定builtinAvatarId。
  - **執行**：美術完成各角色全身版本並比較鎖定區域。
  - **斷言**：16張原圖與hash未被覆寫，穩定ID不變；AI全身延伸與原圖逐款視覺比對，角色身份、髮型、原衣裝與氣質經使用者確認；下半身腿鞋與全身比例自然，使用者逐批確認後才輸出；依後續決策不增加逐像素相等或原上半身鎖回合成門檻。
  - **測試邊界**：需連動合法 R2 私人資產、D1 条件寫入或真 Renderer；檢查版次／權限／回覆不明，不以 mock 假稱跨服務原子交易。

- [x] **SD-IT-064** — `FreeAvatarFiveFaces_WithDependencies_ShouldPreserveStateAndAuthority`（critical；預定位置：`cloudflare/tests/avatar-expression-r2.integration.test.ts`）
  - **來源**：`SD-BDD-082` → `SD-AC-022`、`SD-AC-029`；**前置**：每款免費全身master均已通過原畫保真驗收。
  - **執行**：產出neutral、smile、surprised、thoughtful、concerned套組。
  - **斷言**：共16×5種固定表情均可用且髮型、上衣、腿鞋與站姿保持一致；玩家選免費角色或切回免費角色不呼叫Gemini。
  - **測試邊界**：需連動合法 R2 私人資產、D1 条件寫入或真 Renderer；檢查版次／權限／回覆不明，不以 mock 假稱跨服務原子交易。

- [x] **SD-ET-041** — `FreeAvatarUpperBody_OnWebAndAndroid_ShouldMatchExperience`（critical；預定位置：`tests/e2e/web/story-visual.spec.ts`＋`tests/e2e/android/story-visual.mjs`）
  - **來源**：`SD-BDD-081` → `SD-AC-022`、`SD-AC-029`；**前置**：已有16張凍結的免費原畫與固定builtinAvatarId。
  - **執行**：美術完成各角色全身版本並比較鎖定區域。
  - **斷言**：16張原圖與hash未被覆寫，穩定ID不變；AI全身延伸與原圖逐款視覺比對，角色身份、髮型、原衣裝與氣質經使用者確認；下半身腿鞋與全身比例自然，使用者逐批確認後才輸出；依後續決策不增加逐像素相等或原上半身鎖回合成門檻。
  - **測試邊界**：真雙玩家、真圖片及 Web／Android 各自留證；人工免費原畫比對／Gate B 不能由 fixture 代簽。

- [x] **SD-IT-095** — `PurgeRoleD1R2Idempotently_WithD1R2Fixtures_ShouldPreserveIntegrity`（critical；實際位置：`cloudflare/tests/avatar-reset-d1-r2.integration.test.ts`）
  - **來源**：`SD-BDD-113` → `SD-AC-030`；**前置**：非正式測試帳號有舊選角、各狀態 generated_avatar、private/avatar 原圖、temp、舊 Manifest 與指向它們的 pointer。
  - **執行**：依預覽清單執行 D1 條件更新＋限定鍵 R2 刪除，模擬中途網路故障後用同清單重試。
  - **斷言**：最終舊角色 D1/R2 數量為零、selectedAvatarType/ref 為空、revision 正確、沒有孤兒圖片或 pointer；中途失敗可續刪但不假稱跨服務原子。
  - **層級界線**：需有可重複且互相隔離的 Miniflare D1＋R2 測試 namespace，故障注入／同清單重試與精確鍵記錄，不刪正式資源。

- [x] **SD-IT-096** — `ProtectUnrelatedProfilePhotosAndOriginalArt_WithD1R2Fixtures_ShouldPreserveIntegrity`（critical；實際位置：`cloudflare/tests/avatar-reset-d1-r2.integration.test.ts`）
  - **來源**：`SD-BDD-114` → `SD-AC-030`；**前置**：同一測試帳號有 personal_photo、私有 photos R2、真登入/Profile 欄位，並有免費16款原始插畫。
  - **執行**：執行受控角色測資重置並檢查清理前後 hash 和業務欄位。
  - **斷言**：personal_photo D1/R2、帳號、Profile 非角色欄位與原16張原畫 ID/hash 全數不變；不能用全表 DELETE 或 R2 prefix 過寬刪除。
  - **層級界線**：需有可重複且互相隔離的 Miniflare D1＋R2 測試 namespace，故障注入／同清單重試與精確鍵記錄，不刪正式資源。
