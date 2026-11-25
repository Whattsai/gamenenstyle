# SPEC-001-StoryContentExpansion：多劇情內容與剩餘通用能力

**功能 ID**：SPEC-001-StoryContentExpansion  
**來源**：[MVP-001](../requirements/MVP-001-LoveGameDatingApp.md) AC-005-01～35 中超出已實現 V3 且非 V4 的功能、AC-005-14 十條完整主線、已確認延期角色動態。  
**順序**：第8份，必須在 [RainBookshopV4](SPEC-001-RainBookshopV4.md)（含本人 Gate B 與清理後驗收）及 SPEC-001-AffectionAndFeedback（完整 V4 好感／回饋）都結案後才開始細部規劃與開發。  
**狀態**：已切分範圍；SDD 細部、BDD、TDD、RiskAudit 未開始，非 Ready for well-done。不是舊 V3 未勾選測試的集合。

## 1. 目標與現有成果

現行正式索引只有 rain-bookshop/v3 一條主線，已實現的類別抽選、雙 Track、跨區事件、原位書籍、靜態角色、安全收尾、聊天／重玩／退出等不重做；現有多候選／多主線／權重／有序主線／事件池部分已由通用程式及 fixture 證明，fixture 不計正式可玩故事。後續以 V4 和好感回饋正式契約為基礎，才做多內容真實應用與尚未實現部分，不將 V3 未全覆核直接等同未實作。詳細現況見 [V3 驗證](../alldonejobs/verification/SPEC-001-SceneEventFramework-Verification.md)。

## 2. 承接功能與驗收邊界

| ID | 尚需完成的功能／正式應用 | 來源及保留規則 |
|---|---|---|
| SCE-AC-001 | 新增至少九條真正完整、可從正式入口遊玩的預設主線，使 V4＋其他主線合計至少10條。每條有時間、地點、事件、開場／推進／自然收尾、真人互動、完整素材、實際好感回饋與聊天建議；不得用測試 fixture、場景、分支／結局數充數 | AC-005-02/14；SEF-AC-011、BDD-050、IT-071、ET-001/002；其他九條概念沿用 StoryDialogueAndExit §3，正式劇本待本 SPEC SDD 確認 |
| SCE-AC-002 | 使用真正式多內容驗類別推薦與票決、類別/Scene多對多、同Scene多主線、適用類別過濾、N=0/1/2/3+、同pair新舊3:1、已全玩可重複、換pair重算、排序與候選凍結 | AC-005-04～06/11/12、SEF-AC-001～003/008；現有 Domain/fixture 已實現者沿用，僅補缺能力及正式內容驗收 |
| SCE-AC-003 | 多條有序／無序主線與解鎖依賴、混合候選、不同結尾／無分支線性劇情、跨劇本正確去重與合法歷史；不得以同一主線不同版本充數 | AC-005-06/07/12、SEF-AC-003/004 |
| SCE-AC-004 | 真正跨場景與主線復用 EventDefinition／GlobalPool：主支線角色、固定／條件／隨機／隱藏、共享／個人事件、前置／影響後續、playthrough／round repeatScope/repeatGroup、適用場景；按尚缺玩法補通用引擎，不把 V4 專用劇情寫死 | AC-005-08/09、SEF-AC-005/006/013/018～022；保留雙 Track 多次交會、回指定一方、共享物件、私有線索、原位舞台及微動開關 |
| SCE-AC-005 | 多正式內容 immutable 發布、退役／釘選、依賴／可達性、壞檔 fail-closed、雙人 CAS/冪等、離線恢復、全平台、自然完成/聊天/雙同意下一場/退出；同時不影響 V4 已完成的好感／回饋 | AC-005-10/11/13/16～23、SEF-AC-007～010/013～024；既有實作與驗證沿用，V4 專用舊版清理由 V4 自己完成 |
| SCE-AC-006 | 多正式內容沿用已驗收的角色、授權、素材完整性與共用場景能力，不重做 V3 取消的完整 Puppet／動態專項；若後續獨立 MVP 有新角色需求，依該 MVP 重新確認設計 | V4 現行角色基線與獨立 MVP-005；不引用已取消 V3 測試 |
| SCE-AC-007 | 依已確認 MVP 多劇情需求，逐功能比對屆時 V4 與 AffectionAndFeedback 實作，僅對正式多內容必要差異生成新測試；不承接取消的 V3 未核證項或舊專用情節 | AC-005-04～14 的現行有效多劇情需求、V4 基線 |
| SCE-AC-008 | MVP-001 仍只有人工預設主線，不呼叫AI生成故事；未來 MVP-002 AI動態主線／跨場景僅保留通用擴充邊界，線上遊戲、線下約會、告白各自後續 SPEC | AC-005-15、SEF-AC-012；不擴張本期業務範圍 |

## 3. 規劃原則

以 V3 結案文件及現行 MVP 作來源追溯，不移轉舊測試 ID 或舊未勾選數為本 SPEC 分母；新 SDD 需檢查正式多內容和最新 V4 實作的實際差距，再按 SCE-AC 產出新 BDD/TDD 與風險稽核。V4／AffectionAndFeedback 未結案前不先產出猜測性的 API/Schema 或九篇故事的詳細設計。完整 Puppet 不由本次 V3 取消項重新列入待辦。各內容使用者品質驗收與技術驗收分開記錄。

## 4. 相關文件

- [V3 原 SPEC](../alldonejobs/specs/SPEC-001-SceneEventFramework.md)、[BDD](../alldonejobs/bdd/SPEC-001-SceneEventFramework-BDD.md)、[TDD](../alldonejobs/tdd/SPEC-001-SceneEventFramework-TDD.md)、[RiskAudit](../alldonejobs/specs/SPEC-001-SceneEventFramework-RiskAudit.md)、[Verification](../alldonejobs/verification/SPEC-001-SceneEventFramework-Verification.md)。
- [StoryDialogueAndExit](../alldonejobs/specs/SPEC-001-StoryDialogueAndExit.md) §3 十種故事概念與共用互動，保留其獨立權限／聊天／退出責任。
- [本 SPEC Verification](../verification/SPEC-001-StoryContentExpansion-Verification.md)；尚無新測試分母。
