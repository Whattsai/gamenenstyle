# SPEC-001-SceneEventFramework：場景、主線與可重用事件框架

**範圍**：截至正式雨聲書店 V3；使用者已實玩核准，並明確取消未完整核證的舊版開發待辦。本 SPEC 已結案、凍結，不再執行 well-done／carefully-done。
**來源**：[MVP-001](../../requirements/MVP-001-LoveGameDatingApp.md)｜[BDD](../bdd/SPEC-001-SceneEventFramework-BDD.md)｜[TDD](../tdd/SPEC-001-SceneEventFramework-TDD.md)｜[RiskAudit](SPEC-001-SceneEventFramework-RiskAudit.md)｜[Verification](../verification/SPEC-001-SceneEventFramework-Verification.md)
**後續**：[RainBookshopV4](../../specs/SPEC-001-RainBookshopV4.md) → AffectionAndFeedback → [StoryContentExpansion](../../specs/SPEC-001-StoryContentExpansion.md)。

## 1. 結案基線與共用契約

- Scene／Narrative／EventDefinition 分離；類別與可玩主線、適用類別、前置與重複範圍依已核證引擎規則選取。正式目錄目前僅一條 V3；多正式內容由後續 Expansion 擴展。
- Round、StorySession、兩個 ParticipantProgress、共享 WorldState 與 EventInstance；本人 Track／Area／Revision 獨立，真人提交與 D1 CAS／receipt 為權威，不代選、不偽造聊天。安全投影、授權、冪等、重連與舊 revision 拒絕保留。
- 自然完成僅結束章節，Round 仍 active、聊天保留；雙方同意下一場，安全退出維持獨立入口。
- 使用 immutable R2、版本及 SHA 釘選；Publisher 與 Runtime 驗內容及素材，不以缺素材文字替身通過。現行 schema 0007、21 表、零 Trigger；資料清理只在 V4 本人驗收後依其 SPEC 進行。

## 2. 雨聲書店 V3（原 §3.8）

正式 Scene `rain-bookshop/v3`、Narrative `rain-bookshop-before-rain-stops/v1`，schema `scene-event.v2`，35 個個人節點、39 Binding、44 Shot、7 視角及4本原創書；實際來源為 [正式作者資料](../../../contracts/rain-bookshop-before-rain-stops.json) 和 [正式目錄](../../../contracts/scene-event-content.json)。兩人各自進店、閱讀、本人選擇搭話或婉拒；店員、共同雨情、互補書單與安全救書、三種咖啡結局及安全撤離構成現行本人已驗收體驗。V4 會取代具體內容、互動節奏及結局，不再重做舊四本、舊救書或舊演出矩陣。

### 靜態人物優先（原 §3.8.7B）

保留已核准16款免費身份、四姿態／五語意表情、靜態成品的版本／SHA 與私人採用及授權完整性；失權清除、缺 ready 不進場，已 ready 不重產。原 Puppet、連續動作及舊動畫完整性要求未全面實現，不屬 V3 結案範圍。未使用動態試作不作 V4 前置。現行靜態基線與 V4 直接相關契約由 V4 獨立核證。

## 3. 原完整核證的 AC

下表保留原21項具完整核證索引的共用 AC；其中舊版五圖、Rig 名稱及畫面版本是原核證來源，不表示新版動態 Rig 已完成。原15項未全核證 AC 依使用者決策取消，不改記通過。本人 V3 實玩接受另記 Verification。

| ID | 已核證原契約 | MVP 來源 |
|---|---|---|
| SEF-AC-001 | Category 僅從**所屬場景且至少一條適用類別／符合前置條件的真正可玩主線**推導；N=0/1/2/3 各按規則處理，真人雙票同票／異票／改票／離線及隱私正確 | AC-005-04 |
| SEF-AC-002 | Scene↔Category 多對多，場景與主線不同概念，同一場景至少可綁兩條完整 Narrative；換 pair 不沿用去重 | AC-005-05/06/12 |
| SEF-AC-003 | 主線依所選 Category 的**適用類別白名單**篩選後才抽選；無序主線隨機優先未玩、全玩過能重玩；有序主線不能跳章；混合時不強制有序優先 | AC-005-06/12 |
| SEF-AC-004 | 線性主線只有一個 Ending 也能發布及玩完；分支／兩結局亦可正常演出，結果由已提交選擇導出 | AC-005-07 |
| SEF-AC-005 | 同一 EventDefinition 在兩個 Narrative 的 role 不同，帶固定／條件／隱藏／隨機互動及跨場景適配；不重複開發模組 | AC-005-08 |
| SEF-AC-006 | playthrough／round 兩種 repeatScope 與同一 repeatGroup 正確去重；缺依賴、隱藏未達成皆不觸發 | AC-005-09 |
| SEF-AC-007 | 主線收尾後自動 completed、未玩支線不阻塞、繼續聊天且 Round active；原 End 雙確認才能 ended | AC-005-10 |
| SEF-AC-008 | 雙方同意後恰好建立一筆下一場，**使用雙方當下最新已儲存興趣重新推薦、固定該場候選，舊場不變**；單方／撤回／舊場票／競態／重送均不得偷開新場 | AC-005-11 |
| SEF-AC-009 | 現有 `game_round_events` 序號、冪等、拒舊 Revision、HTTP+WS 補漏與安全投影不得退化 | AC-005-13 |
| SEF-AC-010 | 版本發佈後已有玩家仍使用原版；退休內容不能進入新候選、R2 錯誤 fail-closed；不洩漏私有資料 | AC-005-13 |
| SEF-AC-012 | MVP-001 不呼叫 AI 推進劇情，不建 AI 生成任務，未來 AI 動態主線不需依賴 `content_story_catalog` | AC-005-15 |
| SEF-AC-013 | Scene／Narrative 拆分後 2.5D 鏡位、背景／前景、熱區、音效完整；Event 演出以安全的鏡位／表情／音效效果疊加並能還原，非法 ID 不得發布 | MVP AC-005-08/13；StoryDialogueAndExit 2.5D |
| SEF-AC-014 | V3 已採用 `ActorRigPackage`（五語意表情）與 Scene 各自維持版本；新 Rig 套組完整解碼／姿態與動作驗證＋句尾安全換角；失敗不顯示混包、失權即清除；Event 不啟動 Gemini | MVP AC-005-13；AvatarAndPreferences B1 |
| SEF-AC-015 | V3 原位隱形可點物件／NPC 依權威事件資格啟用、預覽不提交；新 Episode 重設舞台但保留 Round 聊天／當前 Avatar；背景／重連不重抽、重送、autoplay、續產 | MVP AC-005-09～11/13 |
| SEF-AC-017 | 本人目前採用化身的V3 角色 Rig（含五語意表情）未就緒時禁止遊戲入口、恢復、票券及操作；清除私人畫面並提供個人檔案入口；不受另一組 pending 化身影響 | MVP AC-005-16；§1.2；BDD-079 |
| SEF-AC-018 | A／B 各自 Node／Area／Revision；快慢不同、離線／恢復不跳過任何一人必經節點；進度不能互蓋 | AC-005-17 |
| SEF-AC-019 | 同一 Narrative 可重複個人→共享→指定一方／雙方分流→共享，條件解鎖與 Ending 有可達性檢驗，無互等死鎖 | AC-005-18 |
| SEF-AC-020 | 私有線索不先向對方洩漏、分享後共享；物件被拿取後另一端視圖一致，雙人競態和冪等安全 | AC-005-19 |
| SEF-AC-021 | Scene Area 移動、物件點選／翻面／拖放、NPC 對話、角色位置／表情／鏡頭與音效由可驗合法操作驅動 | AC-005-20 |
| SEF-AC-022 | AmbientMotion 雨滴／反光／物件持續位移肉眼可辨且可關；StoryMotion／必要動畫不因關微動而消失，雙平台畫質與效能量測 | AC-005-21 |
| SEF-AC-024 | 本地乾淨 Schema 重建、已知測資清除、舊互動表／重複程式及內容依賴已移除；聊天／退出／授權／Avatar／多場次及真 D1 回歸不退化 | AC-005-23 |

## 4. 後續邊界

V4 必須保留直接相關的兩人自主、私有資料隔離、原子共享結果、原位預覽不提交、靜態角色授權與完整性、版本安全、重連／自然完成／聊天／退出，以及新內容安全清理的回歸；不移植舊未核證 ID 或舊情節。其他新增正式劇情依新 Expansion SPEC 定義，完整 Puppet 不列為本次前置。
