---
name: design-decision
description: 針對同一完整 SPEC 的多份 SD 候選逐細項比較優缺點、風險與採用理由，整合成可獨立實作的完整 final 設計包。用於 design-decision、比較設計或決定最終 SD；為選用步驟，完成後等待使用者核准 final 版本，不開發。
---

# Design Decision

此技能是可選的設計決策步驟；不修改 `perfect-plan`、`well-done` 或既有文件鏈，不啟動產品開發。

## 核心規則與前置

1. 讀目標工作區及涉及的其他服務／模組的 agent 指示、README、方法文件與實際程式；讀來源 MVP／SPEC／BDD／TDD、風險決策及 TDD 的 `Ready for well-done` 交接，檢查缺漏回寫、無未解除阻斷。
2. 必讀 [文件契約](.agents/skills/fantastic-design/references/document-contract.md) 與 [規劃規則](.agents/skills/fantastic-design/references/planning-rules.md)。不因候選來自多 AI 就啟動多代理。
3. 讀同一完整 SPEC 的所有未被明確取代候選、來源／程式基準及現行工作樹；列出被排除批次與取代依據。未知模型保留未提供。不能以同 `SPEC-XXX` 混入其他功能。
4. 必須使用下列四份 SD 範本及本技能的決策範本，不能自行換成一般工作包格式；不適用章節保留並註明原因。

## Phase 1：對齊基準

建立候選清冊，列包路徑、AI／模型／批次、設計版本、來源文件版本與程式基準。逐一列出來源差異、現行程式漂移與受影響項，不能將不同需求版本當成設計優劣比較。

沒有需求語意變動的可在明確證據下對齊並記理由；無法對齊的需求差異、上游缺漏或衝突先保存原文／證據、白話案例、建議與影響範圍，交由使用者確認後才更新必要來源與基準。不得自行製造同意。候選不完整時揭露其缺項，不能假裝完整比較。

## Phase 2：逐細項比較

依 [決策範本](assets/03-design-decision.template.md) 拆成可追溯的最小有意義設計決策，逐項比較行為、架構責任、核心邏輯、契約、資料、平台、檔案改動及驗證安排，包含安全／維運、UX、依賴／共享資源與整合。

必讀 [有序實作步驟契約](.agents/skills/fantastic-design/references/step-design.md)，比較各候選步驟的行為切分、前置、案例／斷言、命令／工作目錄及通過／停止條件，不能只比較工作包名稱。舊候選缺少步驟時揭露缺項，產出 final 前須補齊。

每個細項對每個候選記來源位置、具體方案、優點、缺點、風險，並記採用／不採用／修改、白話理由及目標 final 位置。不可只有整套方案的總分或「取各家優點」。

取捨順序：已確認需求、正確性與平台限制優先；再衡量耦合、彈性、必要改動量、複雜度、維運／成本與驗證可行性。分數可輔助，不得掩蓋必要條件未成立。

## Phase 3：產出完整 final

可採整套候選或整合細項；若已有 final，依文件契約先保存舊版再更新。於該 SPEC 的 `final/` 產出：

- `00-overview.md`：套用 [SD 總覽範本](.agents/skills/fantastic-design/assets/00-overview.template.md)。
- `01-system-design.md`：套用 [系統設計範本](.agents/skills/fantastic-design/assets/01-system-design.template.md)。
- `02-traceability.md`：套用 [追溯範本](.agents/skills/fantastic-design/assets/02-traceability.template.md)。
- `plans/SD-NNN-功能名稱.md`：每份套用 [分項範本](.agents/skills/fantastic-design/assets/SD-plan.template.md)。
- `03-design-decision.md`：套用本技能的 [決策範本](assets/03-design-decision.template.md)。

final 要寫足完整設計、所有檔案責任與核心邏輯，可在候選移除／不可取得時獨立交接；候選引用只作來源證據。繼承的產品證據先檢查與整合後設計／程式相容性；分項重新切分時重新對照 Todo，不盲拷百分比或 checkbox。

依 final 的行為、契約及檔案責任重建完整步驟順序與 I／F／V 映射，保留候選到 final 的步驟 ID 對照；不可直接拼接不同候選的操作次序。每步具備可執行案例與關卡，步驟不增加 Todo 或來源計數。

## Phase 4：整合一致性與全量涵蓋稽核

整合後重新核對契約／版本、資料權威及資料流、不變條件、依賴順序、唯一寫入責任、共享環境、驗收相容性及最小改動；混用方案若需新設計，明列修改及原因。

逐步桌面檢查 final 的起始基準、操作、結果判定與下一步，確認沒有循環、無主步驟、缺少案例／命令或仍指向候選才讀得到的必要內容。

全部 SPEC／BDD／TDD 逐項映射至 final 分項、實際改動檔案、驗證安排及待回填證據；逐項重建 BDD 行為／條件／結果及適用畫面、元件、狀態、平台的產品 F／S／I／V 映射與核心邏輯，僅有測試映射不算完整，final 保持 Draft，跨包來源列全必要成果及整合責任；不得只檢查總數或抽樣。補齊 final 內缺漏；上游語意變更仍先走確認。

## Phase 5：交付與確認

檢查固定範本完整、連結與路徑、來源基準、三種進度及版本快照，至少執行 `git diff --check`。交付 final 路徑、具體版本、細項決策摘要、涵蓋結果、待確認事項與限制，停止等待使用者明確核准 final。

候選核准不自動轉移到 final；未取得針對 final 的有效確認時只能標 `Awaiting approval`。已有同一 final 版本的有效明確確認可回填 `Ready for carefully-done`，無須重複詢問。不得直接開始開發或把設計稽核當產品驗證。
