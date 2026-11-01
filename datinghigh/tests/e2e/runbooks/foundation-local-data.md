# 本地磁碟、備份與重啟

服務運行時，migrate／seed／execute／backup皆先經該instance的loopback control暫停服務，完成資料操作後恢復，避免Windows與WSL同時改活躍WAL。這些操作及key-rotation測試應與Web／Android驗證依序執行。

對應 PF-IT-024..032／PF-E2E-021。所有資料命令固定 `--local`，預設 cwd 為 `datinghigh/cloudflare`，狀態為其 `.wrangler/state`；從其他 cwd 呼叫絕對 script 路徑仍相同。

```powershell
npm run db:migrate:local
npm run db:seed:local
npm run db:query:local -- --view accounts
npm run db:query:local -- --view sessions
npm run db:backup:local -- --name before-change
npm run db:restore:local -- --file .local/backups/before-change.sql --target restored-copy
npm run db:query:local -- --instance restored-copy --view accounts
npm run storage:probe:local
npm run test:live
```

backup 透過具隨機憑證的 loopback control 暫停本地 Worker 寫入，執行 D1 export，完成後恢復。既有名稱、未知 instance、remote/config 旗標、路徑跳脫一律拒絕。restore 在新目錄匯入並驗 FK；原資料不修改。備份含本地私人資料，保持忽略。查看 SQLite 時另建副本，不修改活躍 emulator 的 WAL。

重啟驗收：記錄仍有效與已撤銷 family、尚有效 EmailChallenge 及 probe；停止／啟動／重建後分別確認有效性與撤銷持久。三個秘密沿用，不輸出秘密或憑證。更新 build 不刪除 state。還原副本是獨立測試環境，若要驗既有權杖需以相同秘密在本機安全配置，不能假設新生成的 key 相同。

Windows wrapper 使用 Ubuntu WSL 的獨立 Node 24.11.1／Wrangler 依賴。上游 [Docker Desktop outbound 位址問題](https://github.com/cloudflare/workers-sdk/issues/15257) 由 `wsl-egress.mjs` 對自己 workerd 的動態 port 建 loopback relay；不開放 LAN，也不提供公開 SQL 管理 API。
