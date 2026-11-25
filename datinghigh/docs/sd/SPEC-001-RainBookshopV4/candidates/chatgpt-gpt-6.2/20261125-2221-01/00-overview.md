# SPEC-001-RainBookshopV4 — SD 總覽

候選：chatgpt-gpt-6.2/20261125-2221-01；document contract v2；設計 v2；狀態 Draft（非 Awaiting approval）。

## 來源、程式與設計基準
- [requirements/MVP-001-LoveGameDatingApp.md](../../../../../requirements/MVP-001-LoveGameDatingApp.md) SHA-256 `9f1e2d488ddf20d00cb54b3731363cd2d9b62c06660f426f86acb610af75b4a1`
- [specs/SPEC-001-RainBookshopV4.md](../../../../../specs/SPEC-001-RainBookshopV4.md) SHA-256 `78dd9c2202de603070846715454fca6b4cd94cc959fe1eac9937c6654f084843`
- [bdd/SPEC-001-RainBookshopV4-BDD.md](../../../../../bdd/SPEC-001-RainBookshopV4-BDD.md) SHA-256 `72a0ce6703e94235c3fb8e26b4cd49cec52a6a51c1b8b9a4ef5f55786ab6f2d8`
- [tdd/SPEC-001-RainBookshopV4-TDD.md](../../../../../tdd/SPEC-001-RainBookshopV4-TDD.md) SHA-256 `edbfc1dd391d724ddd79ffe031b05cd75731553501d0dbfca94ccf7a36676cda`
- [specs/SPEC-001-RainBookshopV4-RiskAudit.md](../../../../../specs/SPEC-001-RainBookshopV4-RiskAudit.md) SHA-256 `987a83f8201cfb20f7756e5226e908bf76d0a39ab8e73f2882d3aaa1c159e577`
- [requirements/rain-bookshop-v4-draft.json](../../../../../requirements/rain-bookshop-v4-draft.json) SHA-256 `b5c18f6762c87e25e1e83deb5769d19dc170c94a69bd6c1cdb15fe34b6809d95`
- [verification/SPEC-001-RainBookshopV4-Verification.md](../../../../../verification/SPEC-001-RainBookshopV4-Verification.md) SHA-256 `7f23e9c13a98fffe0c3891a387bc39f1d9cbb6dd3eca911cb64fc53acbda6ffc`
工作樹 baseline：既有 tools/chatgpt-local-mcp/src/core.js、index.js、project-job-worker.js 修改與 tests/git-json.test.js 未追蹤；不碰既有差異。現有 MCP 未提供 HEAD commit SHA 的讀取結果，來源文件與已讀關鍵程式採 SHA 辨識；待補完整可重現基準。
## 前置與完成契約
來源 TDD Ready for well-done；RQ-01～04、RA-Q1～04 均 A；12 風險、16 追加測試已確認。原稿不改，21表/0欄/0 Trigger/0新公開 API；Gate A、使用者 Gate B、具名 local 清理、乾淨回歸不得跳過。fantastic-design 僅設計，不實作。
## 開發進度總覽
### 整體進度
D：0/7 正式完整稽核；BDD 行為與產品責任映射 58/58、frontend 畫面／互動 42/42；TDD 主映射 337/337（均為結構覆蓋，非完整設計驗收）；I：0/180；來源實作 0/337。
### 分項／分組進度追蹤
| 分項 | 主要 TDD | 完成實作 | I 葉節點 |
|---|---:|---:|---:|
| [SD-001-內容編譯與發布](plans/SD-001-內容編譯與發布.md) | 18 | 0 | 5 |
| [SD-002-雙Track及救援領域規則](plans/SD-002-雙Track及救援領域規則.md) | 104 | 0 | 35 |
| [SD-003-權威交易與投影](plans/SD-003-權威交易與投影.md) | 89 | 0 | 49 |
| [SD-004-共用前端與手勢](plans/SD-004-共用前端與手勢.md) | 24 | 0 | 42 |
| [SD-005-WebAndroid整合與GateA](plans/SD-005-WebAndroid整合與GateA.md) | 89 | 0 | 43 |
| [SD-006-GateB及具名清理](plans/SD-006-GateB及具名清理.md) | 13 | 0 | 4 |
| [SD-007-深度稽核與交付](plans/SD-007-深度稽核與交付.md) | 0 | 0 | 2 |
### 當前 Sprint 狀態
Draft；7 分項已補產品優先的實作步驟與 BDD／畫面責任映射；仍待逐檔、逐步語意及可執行性稽核。
### 里程碑
先設計稽核／人工確認，再實作；真環境前置、Unit、Integration、API、雙平台 E2E、Gate A、Gate B、清理與回歸、深度稽核。
### 關鍵指標
15 AC、58 BDD（42 frontend）、337 TDD（175/57/18/87）；20 書、28 節點、8 Area、80 素材、2 題組、4 結局；全量原文與權利及真環境證據不可代簽。
### 每日進度記錄
依 repo 規範不適用；驗證證據僅 Verification。
## 系統設計與分項索引
[系統設計](01-system-design.md)／[追溯矩陣](02-traceability.md)
- [SD-001-內容編譯與發布](plans/SD-001-內容編譯與發布.md)：先驗證 v4 原稿逐值編譯，內容/資產 manifest 使用固定 schema 版本、SHA 與 immutable storage；v3 保持可讀直到 Gate B。
- [SD-002-雙Track及救援領域規則](plans/SD-002-雙Track及救援領域規則.md)：在 Domain 以純函數計算合法 actor、當前節點、typed state、下一狀態和語意效果；不得自行 commit、讀時鐘或接收 client 推測結果。
- [SD-003-權威交易與投影](plans/SD-003-權威交易與投影.md)：所有 authoritative mutation 由固定 private command、D1 batch/CAS 實現；服務投影依角色裁切；DO 只喚醒並重讀；保留原授權及傳輸契約。
- [SD-004-共用前端與手勢](plans/SD-004-共用前端與手勢.md)：共用 Web/Android renderer；純預覽與權威提交分離，依 actor snapshot 渲染，cancel/reconnect 不偷送，背景/失權清理私密資料。
- [SD-005-WebAndroid整合與GateA](plans/SD-005-WebAndroid整合與GateA.md)：用真實正式內容、雙人不同 session、真 D1/R2/DO 及兩平台獨立證據驗證；不能以 mock、fixture、歷史 V3 結果代簽。
- [SD-006-GateB及具名清理](plans/SD-006-GateB及具名清理.md)：Gate A 完整後使用者實際遊玩核准精確候選 SHA 才停寫、備份及執行具名 local 清理。禁止遠端、prefix 廣刪、刪共享 SHA。
- [SD-007-深度稽核與交付](plans/SD-007-深度稽核與交付.md)：依原始規格逐條比對實作與真實證據，更新既有 checkbox 和唯一進度；缺項只列未完成，禁止流水帳。
## 完整執行順序與整合
1. 003 真 Miniflare D1 毫秒時間 guard、同批 rollback、容量可行性探針（不得改 schema），必要權利與素材檢查。
2. 001 formal author compiler／pin／graph；002 純 Domain；003 固定私有命令與 projection；004 共用 UI。
3. 005 真 Web/Android、真 D1/R2/DO、合法素材及必要 provider 驗證，逐來源 Gate A。
4. 006 只在本人 Gate B 精確 SHA 核准後具名 local 清理；005 乾淨雙端回歸；007 全量深度稽核、修補重驗及交付。
## 風險、變更與決策
D1 毫秒 guard、原稿容量／graph、素材及著作權、真裝置與 runner、混合 Round/共享 SHA 均為停止條件；不可自主降標。未完成：精確檔案符號與 V4 asset 實際路徑/製作契約、測試選擇器與 runner、全量步驟互相依賴／F 追溯稽核、HEAD SHA。候選不等於已核准。
## 檢查點與續作交接
10 份文件（3 總體、7 分項）、180 個 S／I、337 個唯一 V；58 個 BDD 具產品或純驗收責任，42 個 frontend 行為具畫面、元件、手勢、狀態及驗證分解；50 個檔案責任項。未完成逐案例核心邏輯／精確新增符號與契約、測試 runner/選擇器、正式素材幾何與製作契約、Gate A/CleanReplay Unit/Integration 責任分派、HTTP/WS 雙傳輸與雙平台證據稽核。D 仍 0/7；不因映射數或 Skill 強化而核准。原 SPEC/BDD/TDD、產品程式、資料及測試未改。
## SD 人工確認與交接
Draft；尚不可進 carefully-done。不要求使用者確認未完成的候選。
## 最終驗收與交付
所有 D、I、BDD/TDD 各自分母及真實證據成立，Gate A/B、具名清理、重驗後方可完成；本次不執行產品驗收。
## 相關文檔與生成資訊
ChatGPT GPT-6.2；2026-11-25；候選批次 20261125-2221-01。
