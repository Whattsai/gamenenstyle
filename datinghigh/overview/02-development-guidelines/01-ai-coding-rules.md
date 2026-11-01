# AI 程式修改規範

## 分層與實作要求

- 依 [分層邊界](../01-architecture/02-layer-boundary.md) 修改。Domain 保持純規則；Application 協調用例與介面；Infrastructure 處理外部 I/O；API 處理 HTTP。D1 SQL 放 Worker，頁面透過共用 ApiClient。
- 延用現行 C# nullable、async／CancellationToken、TimeProvider 與 TypeScript 型別。不要因局部需求大規模重排壓縮寫法或更新無關套件。
- 認證／資料變更先寫有意義的失敗測試，證明既有行為錯誤，再做最小實作與必要重構。不要加只比對實作文字的測試充作認證證據。
- 保留每帳號一個未撤銷 family、同 batch 撤舊建新、只在憑證變更增加 cv、Refresh 30 秒寬限及重放撤原 family。
- 六張自有表共 54 欄、首欄 UUIDv7；只用固定 prepared SQL。多句 batch 共用前置條件、自然 UNIQUE／FK 與 rollback；不加 marker／額外 version，不引入 Identity／EF。
- token 只在提交成功後對外提供；Google 身分由驗簽結果建立，不能採用 client 自報 Email／subject。連結不增加 cv／不踢登出，解除需本地密碼並使舊 session 失效。
- UI 以共用 Screen／forms／OperationGate／pending back guard 處理狀態。保留平台 SDK 分檔、可及性、可捲動與鍵盤行為；不將提案原型固定資料搬進正式功能。
- 不盲目重送可能已提交的 mutation。未知結果依既有復原策略處理；Android 原生網路 plugin 變更後須重建 APK。

## 例外與錯誤處理

Domain／Application 用 `DomainException(code, status, retryAfter)` 表達可安全公開的失敗；API 統一輸出 ProblemDetails。一般例外只記 type／trace，不能把 exception message、body、query 或 credential 寫進報告。

Worker 的 Zod／strict JSON 拒未知與重複欄位，SQL 自然約束依現行 mapping 轉 409，其餘依賴故障回 503；不要把未知 SQL 錯誤包成成功。前端用 `ApiFailure` 的 code／status／traceId／retryAfter／uncertain 決定提示與復原，不能只以顯示文字判斷狀態。

取消請求與背景作業須傳遞 CancellationToken；服務端寄信有 10 秒期限。預期的 401／409／429／503 也必須保留 no-store 與合法 Origin 的 CORS。密碼、token 或原生 XML 不得出現在 snapshot、trace、影片或失敗附件。

## 測試與文件

D1 的條件更新、UNIQUE、FK、rollback 用真 Miniflare D1；HTTP fixture、受控 Google SDK／sender 只證明其受控範圍。Web 不替代 Android／iOS；local log 不替代實際收信。

依變更執行對應測試，認證跨層改動以 `npm run check:foundation` 及必要的 live／UI 回歸驗證。測試函式數與規劃案例數分開；有 ID 或局部參數通過不代表整案完成。文件同步依 [工作流影響矩陣](03-ai-workflow-stages.md#overview-同步矩陣)；沒有影響也需在交付說明原因。

## 完整功能變更範例

以已確認範圍內的「修正修改密碼競態」為例：

1. 核對目標 SPEC／BDD／TDD 與既有證據，確認前置條件及預期失敗。
2. 在適當模組加入失敗用例；若影響 cv／SQL，先在真 D1 重現競態與 rollback。
3. 修改 Domain／Application／prepared command 的必要部分，再同步 HTTP 與前端型別／UI；不增額外 version 欄位。
4. 證明成功與拒絕分支、舊憑證失效、未知回應不重送，執行相關 UI／live 回歸。
5. 回寫追溯與平台缺項，更新資料／API／runtime／模組等受影響 overview，交付變更及驗證證據。

這是後續修改方法，不表示本次文件整理執行該開發。

## 常見任務與 Review

| 任務 | 必查重點 |
|---|---|
| 新增／調整 endpoint | strict 欄位、optional／null、Origin、授權、Cookie／Bearer、錯誤與前端 ApiClient |
| SQL／認證競態 | active／cv／family 前置條件、同 batch、0 列結果、自然約束與真 D1 rollback |
| UI／storage | pending 與取消、回前景重驗、儲存白名單、未知結果、各平台實際證據 |
| 套件／原生設定 | lockfile、Expo 相容性、WSL toolchain、Web export、APK 重建、fixture 不進 release |
| 本地資料／重啟 | wrapper 的已知 instance、暫停寫入、還原新目錄、秘密沿用、其他專案不受影響 |
| 文件 | 程式現況與規劃分開、連結有效、沒有把舊數字或未驗收項目寫成新結論 |

Review 至少確認越層／公開 bridge、敏感輸出、未知 mutation 重送、並行 family／cv、SQL 證據，以及 overview／契約同步。
