---
name: chatgpt-local-mcp-bootstrap
description: 在 Windows 目標 Git repo 自動建立並接通獨立的 ChatGPT Desktop 本機 MCP、Secure MCP Tunnel 與 repo skills Plugin；適用於新專案導入或修復這套連線，包含安裝 tunnel-client 與完成設定。
---

# ChatGPT Desktop 本機 MCP 建置

此 skill 的 `assets/chatgpt-local-mcp/` 是可複製的原始碼範本。使用者指定目標 repo 後，**由代理人執行整個建置與連線流程**：盤點、複製、設定、安裝依賴、建立 tunnel、打包安裝 Plugin、驗收。不要把下載 tunnel-client、填範本、執行命令或安裝 Plugin 留給使用者自行串接。登入、帳號權限或無法由工具讀取的憑證才向使用者索取必要資訊；取得後繼續原流程。

## 導入流程

1. 閱讀目標 repo 已有的 `AGENTS.md`、專案文件、skills 與 build 命令，確認 Git root、必讀文件、固定 tasks、所需 MCP 工具及要啟用的模組。若沒有 `AGENTS.md`，改用既有穩定文件作身分與必讀文件，必要時建立目標 repo 的 AI 入口文件。檢查既有變更，不覆蓋使用者工作。需要哪些欄位與安全界線見 [project-config.md](references/project-config.md)。
2. 執行 `scripts/copy-template.ps1 -TargetRepo <絕對路徑>`。如果目標已有不同內容，先逐檔比對並在目標 repo 合併；不要直接覆蓋。填好 `config/project.json`，使用專案唯一的 `projectId`、Plugin 名稱與 repo 外 runtime；`skills.roots` 可涵蓋多個 skills 目錄，`skills.selected` 只收真正要交付的 skills。若目標尚無可交付 skill，先建立一個符合該 repo 工作方式的最小 workspace skill。把缺少的受限工具實作在目標 server，並更新 `requiredTools`，不可只在設定宣稱工具存在。
3. Node.js 可用後，執行 `node tools/chatgpt-local-mcp/scripts/provision-project-tasks.mjs --target-repo <絕對路徑>`。此步驟盤點目標 repo 實際 `package.json` scripts、lockfile 與 .NET solution/project，增補固定 npm tasks 與 .NET targets；保留既有 tasks。可在 `project.json` 的 `taskDiscovery.packagePaths` 指定要交付的 package 目錄，避免將範例或歷史 prototype 全部列為 runner。逐項審核產生的 ID、固定參數與受影響子專案驗證需求；交付時 `tasks` 不得因只複製範本而保持空白。Plugin installer 會重跑同一盤點以防配置落後。
4. 檢查 Node.js 是否符合範本 `package.json` 的 engines；若未安裝，代理人透過可用的官方安裝方式安裝到可執行的位置。接著在目標工具目錄執行 `npm ci`、`npm run check`、`npm test`，修復設定或程式錯誤。不要要求使用者自行執行這些命令。
5. 依 [desktop-connection.md](references/desktop-connection.md) 執行連線：先跑目標工具目錄的 `scripts/ensure-tunnel-client.ps1`，它會從 `openai/tunnel-client` 最新 Windows release 下載、驗證 SHA-256、安裝到專案 runtime，並寫入 ignored `.env` 的 `PROJECT_TUNNEL_CLIENT_PATH`。再取得此專案自己的 tunnel、runtime API key 與 developer app ID，填入 `.env`，初始化、診斷並啟動 tunnel。優先用可用的 UI 工具在 Platform／ChatGPT 完成帳號內操作；只有登入、權限或憑證無法代辦時才提出具體阻礙。
6. 執行目標工具目錄的 `scripts/install-desktop-plugin.ps1`。它會用 `.env` 的 app ID 建立及驗證最新 bundle，備份並更新此專案的安裝與 Personal marketplace；不需要 `-Bundle` 或 `-ReplaceExisting`。確認 app ID 沒有被其他專案使用、其他 marketplace 條目仍在，再重啟 Desktop，於 Personal 來源載入此 Plugin 並在新對話驗收。

## 驗收與交接

依 [desktop-connection.md](references/desktop-connection.md) 驗證 tunnel 健康、MCP 工具清單、workspace session 與每個交付 skill 的代表性流程。失敗時由代理人查診斷並修復，再重新建 bundle；只有無法取得帳號權限或缺少使用者掌握的憑證時才停下，明確指出需要哪一項。回報實際完成的設定、驗收結果與仍待帳號操作的單一步驟，不把未完成的連線描述成可用。

範本的 workspace session 使用單一 active pointer、session 稽核檔、跨 process lock 與 90 分鐘滑動 lease。Plugin contract 規定 `begin_workspace_session` 前先呼叫 `get_active_workspace_session`；若已有 active／expired session，先顯示摘要並取得使用者對 resume、replace 或 release 的選擇。新工作提供 `task_summary`；resume 換發 ID 後重讀全部必讀文件。

## 不變條件

- 不覆蓋其他專案的 server、runtime、tunnel profile、developer app 或 Plugin。專案間的 tunnel ID、app ID、profile、Plugin 名稱必須分離。
- `.env`、runtime 與憑證不進 Git；不把金鑰輸出到對話、log 或 Plugin bundle。媒體只由本機模組處理，未經使用者同意不得上傳。
- `project.json` 缺漏、路徑不符或身分檢查失敗時，server 不啟動。固定 tasks 不接受任意 shell 或 Git 寫入參數。
- 目標 repo skill 的完整資源一起打包，但排除這個建置 skill。交付聲稱的能力以實際可用的工具與流程為準。
