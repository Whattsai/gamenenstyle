# `project.json` 設定

範本初始設定故意無效，由代理人盤點目標 repo 後填入，不讓使用者自行猜 placeholder。路徑以 `tools/chatgpt-local-mcp/` 為基準；`projectRoot` 通常為 `../..`，`runtimeRoot` 可選 `%LOCALAPPDATA%\<projectId>` 的展開後絕對路徑，且不得位於任何受控 repo 內。若 `runtimeRoot` 最後一段已是 `projectId`，直接使用該目錄；否則程式會在其下建立 `<projectId>`，兩種寫法不可混用成重複巢狀目錄。範本的 `AGENTS.md` 只是佔位範例；目標 repo 若沒有此檔，改選真實存在的穩定文件，並同步設定 `identity` 與 `requiredInstructions`。

| 欄位 | 用途 |
|---|---|
| `projectId` | 穩定且唯一的機器識別，例如 `my-product-local`。不同專案不得共用。 |
| `identity` | 目標 repo 內既有檔案及其必須包含的專案特徵文字。啟動時逐項檢查。 |
| `repos` | alias、相對於 project root 的目錄、必讀文件。每個目錄須存在並有 Git root。 |
| `skills.roots` / `skills.root` / `skills.selected` | 目標 repo 的 skills 目錄路徑陣列（支援多個目錄）或舊版單一字串，以及每個交付 skill 的 `requiredTools`。同名 skill 以 `roots` 順序第一個為準；不選建置 skill。 |
| `tasks` | 任務 ID 對應固定 `kind`、絕對 executable、固定 `args` 及 repo alias 與 `cwd`。不接受使用者傳入命令或參數。 |
| `taskDiscovery.packagePaths` | 可選的 package 目錄白名單。未指定時盤點 repo 內所有非 build output 的 `package.json`；指定時只為這些 package 的 lockfile、`build`、`test*`、`lint`、`check`、`typecheck` script 產生固定 npm runner。 |
| `dotnet` | Optional `.NET` job 模組。設定絕對 `dotnet.exe`、target ID、repo alias、相對 solution/project path、允許 actions、filter profile 與各 action timeout。 |
| `modules` | `web`、`android`、`offlineMedia` 設為 `enabled` 後才註冊工具；所需受限 executable、頁面網址或媒體路徑由目標 repo 明確設定。 |
| `plugin.name` | 專案唯一的 Plugin 名稱，與本機安裝目錄一致。 |

固定任務的 executable 路徑必須存在，且不可以是 `.cmd`、`.bat` 或 shell。若需執行 npm script，使用 `node.exe` 加入固定的 npm CLI JS 路徑與固定參數。`cwd` 只可在已宣告的 repo 內。任務失敗時由 `get_project_job` 讀取遮罩後的 log。請勿把金鑰或密碼放入 `project.json` 或任務參數。

完成其他專案設定後，執行 `node tools/chatgpt-local-mcp/scripts/provision-project-tasks.mjs --target-repo <絕對路徑>`。此程式只增補有真實 `package.json` script/lockfile 對應的固定 npm tasks；若發現 .NET solution/project，則增補 `dotnet.targets`。原有手寫 tasks 不覆蓋；即使既有短 ID 執行相同命令，仍建立以 package name 為前綴的標準 task ID，讓 Plugin 可穩定依 ID 呼叫。若標準 ID 已綁定不同命令則失敗關閉。Plugin installer 在 build 前重跑，避免 repo 已有 test/build 而配置仍空白。產生後仍須由代理人審查要交付的 scope 與 runner。

啟用 `dotnet` 時，每個 target 必須使用已宣告 repo alias 與存在的相對 `.sln`／`.slnx`／project path；啟動時會 canonicalize 並確認未越界。`allowedActions` 只能包含 `build`、`test`、`restore`。`filterProfile` 目前只接受 `xunit`，timeout 為 1–7200 秒。範本不預設任何專案 target；請依目標 repo 實際路徑填寫。單一 project target 適合精準 TDD，solution target 可在明確允許 `test` 時做 multi-TRX aggregate execution。

啟用後會註冊 `start_dotnet_job`、`start_dependency_restore`、`get_job_summary`、`get_job`、`search_job_log`、`get_job_errors`、`get_job_log_tail`、`cancel_job`。狀態輪詢優先使用不讀 log 的 `get_job_summary`；`get_job` 的 inline tail 最多 4 KiB，完整 log 由三個 diagnostics tools 讀取。兩個狀態工具都接受 optional `session_id`，只在終態回寫 validation result。Test 自動輸出 TRX 到 repo 外 runtime，並拒絕 raw filter expression、raw args 與 command；沒有可解析 TRX 或選到零測試時不會回報成功。既有 `tasks` 與 `start_project_job`／`get_project_job`／`cancel_project_job` 仍保留，兩者用途互不取代。

`requiredTools` 是逐 skill 的能力映射。Plugin builder 會與 server 實際註冊的工具名稱比對，缺任何一項即停止。額外的業務工具需在目標 server 中自行加入並測試；只在映射中改名不會產生能力。

完成設定後，代理人執行 [desktop-connection.md](desktop-connection.md) 的安裝與連線步驟。`scripts/ensure-tunnel-client.ps1` 會依 `runtimeRoot` 自動安裝 tunnel-client 並更新 ignored `.env`；`scripts/install-desktop-plugin.ps1` 會依 `.env` 的專案 app ID 自動建 bundle 並更新此 Plugin，不需要手動傳 `-Bundle` 或 `-ReplaceExisting`。

新增受限工具時，同步更新 `src/index.js` 的註冊與 `src/capabilities.js` 的工具清單；server 啟動時會比對兩者。若 skill 使用 `agents/openai.yaml` 的 MCP dependency，也要確認它指向此專案的 connection。Web E2E、Android 建置或裝置啟動可用固定 `test`／`skill` 任務，但必須逐項定義並測試；範本不預設任何 App ID 或站台。啟用 Web 前，執行 `npx playwright install chromium`。Android 需要目標專案自己的 ADB 與裝置；離線媒體需要會把結果寫到 `{output}` 的本機轉錄程式。
