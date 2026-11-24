# Workflow：Deadline 健康度監控

> 詳細執行邏輯請看 `playbooks/deadline-monitor.md`。

---

## 觸發條件

- 用戶問「進度怎麼樣」「什麼快過 deadline」
- 每天早上 9:00 自動觸發（需 可持續執行的排程工具）
- 用戶建立新任務時，自動評估會不會跟既有任務衝突

---

## 簡易版執行邏輯

1. 從 `_brand/task-board.md` + 對話歷史 + Google Calendar（如有串接）收集所有未完成任務
2. 判定每件任務的「狀態」（⚪ 未開始／🟡 進行中／✅ 已完成）與「卡在誰身上」（卡你／卡團隊／卡外部）——狀態來自看得到的成品或問用戶，**不准自己生完成度 %**
3. 依 deadline 遠近 + 狀態 + 卡點標紅黃綠燈
4. 用**表格**產出健康度報告，最後給一句「今天先做這一件」
5. 對紅燈項目給「下一步補救」，問要不要啟動；報告完把狀態寫回 task-board

> ⛔ 不准編造完成度百分比或「會延幾天」。詳見 `playbooks/deadline-monitor.md` 的鐵律。

---

## 完整版

請讀 `playbooks/deadline-monitor.md`。
