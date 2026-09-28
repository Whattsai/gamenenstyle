# Windows Desktop 連線與驗收

以下步驟由使用本 skill 的代理人執行。使用者只需處理代理人無法代辦的帳號登入、Tunnels／Developer mode 權限或私密 API key 輸入；代理人取得必要資訊後繼續，不交回一串安裝命令。官方流程見 [Secure MCP Tunnel](https://developers.openai.com/api/docs/guides/secure-mcp-tunnels)、[Connect and test](https://developers.openai.com/plugins/deploy/connect-chatgpt) 與 [Package your plugin](https://developers.openai.com/plugins/build/plugins)。

## 1. 安裝本機依賴

在目標 repo 的 `tools/chatgpt-local-mcp/` 執行 `scripts/ensure-tunnel-client.ps1`。腳本會在 `.env` 不存在時從 `.env.example` 建立它；若已有此專案可用的 `PROJECT_TUNNEL_CLIENT_PATH` 就重用，否則從 `openai/tunnel-client` 最新 release 選本機 Windows 架構的 zip，核對 release 的 SHA-256，再放入此專案的 repo 外 runtime，並原子更新 `.env` 的路徑。下載失敗、架構不符或 checksum 不符時由代理人排查，不能要求使用者自行找 exe。若 Doctor 顯示既有版本不相容，代理人使用 `-Refresh` 更新。

確認 `node.exe` 符合 `package.json` 的 engines，執行 `npm ci`。若缺 Node，代理人安裝相容版本並確保後續 tunnel 的 `node` 命令可取得。`project.json` 必須先完成，否則 installer 會拒絕 placeholder 的 runtime。

## 2. 建立此專案的 Tunnel 與 `.env`

代理人先比對既有本機 profile、Personal marketplace 與已安裝 Plugin，避免沿用另一專案的 `projectId`、profile、tunnel ID、developer app ID 或 Plugin 名稱。對目標專案可重用已確認屬於它的 tunnel／app；找不到時使用可用的瀏覽器或電腦操作工具，在 Platform tunnel settings 建 tunnel 並關聯正確 Platform organization／ChatGPT workspace，再於 ChatGPT developer mode 建 Tunnel connection。若工具無法操作登入頁或帳號沒有權限，只要求使用者完成那個帳號動作；不要要求使用者自行安裝本機工具或整理設定。

將 `CONTROL_PLANE_API_KEY`、`PROJECT_TUNNEL_ID`、`PROJECT_TUNNEL_PROFILE=<projectId>`、`PROJECT_CHATGPT_APP_ID` 寫入此專案 ignored `.env`。API key 不得輸出到對話、命令參數、log 或 bundle；若無法透過安全輸入取得，請使用者直接填入本機 `.env` 的單一欄位後繼續。選未被其他 tunnel 使用的 loopback health port，寫 `PROJECT_TUNNEL_HEALTH_PORT`；新專案不要共用預設 8081。

執行 `scripts/tunnel.ps1 -Mode Init` 與 `-Mode Doctor`。Init 會建立與 `projectId` 同名的 stdio profile，指向本專案 `src/index.js`。確認 profile 確屬此專案後才執行含 `--force` 的 Init。讓 `scripts/tunnel.ps1 -Mode Run` 持續在背景運行，背景視窗用 `-WindowStyle Hidden`，將程序與輸出綁定此專案 runtime；檢查其專用 `/readyz` 或 `/ui` 和 Doctor 結果。若同時使用多個專案，分別維持各自的 run process。

## 3. 安裝 Plugin

確認 ChatGPT developer app 的工具掃描指向此 tunnel，記錄其 `plugin_asdk_app_...` technical ID 到 `.env`。在目標工具目錄執行 `scripts/install-desktop-plugin.ps1`；它自動 build、validate、備份同名既有安裝並安全更新 Personal marketplace。腳本會拒絕與另一個 Personal plugin 共用 app ID。代理人檢查 `~/.agents/plugins/marketplace.json` 仍有其他專案條目，且新 bundle 的 `.app.json` 指向本專案 app。不要刪除其他專案的 plugin 或快取。

重啟 ChatGPT Desktop，在 Plugins Directory 的 Personal 來源安裝或重新載入此 Plugin，開新對話。若可用 UI 工具可操作，代理人完成這些步驟；否則只請使用者完成 Desktop 畫面中的操作，代理人繼續驗收。

## 4. 驗收

先確認 `get_active_workspace_session` 的 none／active／expired 摘要，以及經使用者確認後的 resume／replace／release；確認 resume 換發 ID 並要求重讀必讀文件。再檢查 read、instruction gate、SHA 衝突、guarded patch、固定 task 與 log。若啟用 `dotnet`，確認工具清單包含 `get_job_summary`，並檢查 allowlisted project build、filtered test、failed test、compiler failure、multi-project solution summary、長 log、4 KiB inline tail、完整 log search、structured errors、optional session validation 與 timeout；`test-results/{jobId}` 和 diagnostics 應留在 repo 外 runtime。其他啟用模組與每個交付 skill 也要完成代表性流程，記錄結果與能力缺口。

工具名稱、schema 或 annotations 變更後，代理人重啟 server、刷新 developer app 工具掃描、重新 build／install Plugin，再於新對話確認。不要把中間步驟交給使用者自行拼接。
