# SPEC-001-RainBookshopV4 — SD 總覽（歷史歸檔：已取代之原 final 0.2.0-draft）

> [!WARNING]
> **已取代歷史批次聲明（依 `SD-contract-v2` 保存）**
> - **原路徑與原設計版本**：`datinghigh/docs/sd/SPEC-001-RainBookshopV4/final/`／原版本 `0.2.0-draft`（原 `00-overview.md` 原始未改動內容 SHA-256：`6ea6e20e8647f49bf1472d706d43ce1225432fe65639d62658e42dcd9fdf01ec`；本目錄其餘 10 份檔案保留位元組一字未改原貌）。
> - **取代狀態与日期**：**已取代（Superseded）**／2026-11-26。
> - **被誰取代**：由 `Antigravity`（模型：`Gemini 4 Carbon (High)`）執行 `/design-decision` 產出之正式完整最終包取代。
> - **取代原因**：本 `0.2.0-draft` 為未完成全量逐項設計稽核與精確符號核對之 `Draft` 半成品（`D: 0/30`、未獲使用者人工核准、缺實際 `HEAD` commit 基準），依 `document-contract.md` 先完整歸檔保存至本歷史候選批次目錄，再更新固定 `final/`。
> - **有效替代包連結**：[../../../final/00-overview.md](../../../final/00-overview.md)（設計決策見 [../../../final/03-design-decision.md](../../../final/03-design-decision.md)）。

**完整 SPEC／文件包**：SPEC-001-RainBookshopV4／`datinghigh/docs/sd/SPEC-001-RainBookshopV4/final/`

**設計版本／契約版本／狀態**：`0.2.0-draft`／SD-contract-v2／**Draft：完整文件結構已建立，仍待逐項設計稽核，不得開工**。

**生成者／批次／日期**：ChatGPT GPT-6.2／20261126／2026-11-26。兩候選原文與版本完整保留；本 final 未取得人工核准。

## 來源、程式與設計基準

| 來源（均已確認 SHA 未變） | SHA-256 |
|---|---|
| [requirements/MVP-001-LoveGameDatingApp.md](../../../../../requirements/MVP-001-LoveGameDatingApp.md) | `9f1e2d488ddf20d00cb54b3731363cd2d9b62c06660f426f86acb610af75b4a1` |
| [specs/SPEC-001-RainBookshopV4.md](../../../../../specs/SPEC-001-RainBookshopV4.md) | `78dd9c2202de603070846715454fca6b4cd94cc959fe1eac9937c6654f084843` |
| [bdd/SPEC-001-RainBookshopV4-BDD.md](../../../../../bdd/SPEC-001-RainBookshopV4-BDD.md) | `72a0ce6703e94235c3fb8e26b4cd49cec52a6a51c1b8b9a4ef5f55786ab6f2d8` |
| [tdd/SPEC-001-RainBookshopV4-TDD.md](../../../../../tdd/SPEC-001-RainBookshopV4-TDD.md) | `edbfc1dd391d724ddd79ffe031b05cd75731553501d0dbfca94ccf7a36676cda` |
| [specs/SPEC-001-RainBookshopV4-RiskAudit.md](../../../../../specs/SPEC-001-RainBookshopV4-RiskAudit.md) | `987a83f8201cfb20f7756e5226e908bf76d0a39ab8e73f2882d3aaa1c159e577` |
| [requirements/rain-bookshop-v4-draft.json](../../../../../requirements/rain-bookshop-v4-draft.json) | `b5c18f6762c87e25e1e83deb5769d19dc170c94a69bd6c1cdb15fe34b6809d95` |
| [verification/SPEC-001-RainBookshopV4-Verification.md](../../../../../verification/SPEC-001-RainBookshopV4-Verification.md) | `7f23e9c13a98fffe0c3891a387bc39f1d9cbb6dd3eca911cb64fc53acbda6ffc` |

RQ-01～04、RA-Q1～04 已由使用者確認，12 項風險及 16 補強測試均保留；TDD 原交接 Ready for well-done 未改。本 SD 採用 design-decision → carefully-done 路線，尚未取得 final 核准。

工作區：`C:\GitProjects\gamenenstyle\datinghigh`（Git 根為 gamenenstyle）。本輪初始工作樹為上一版 final 文件包；本輪僅更新同一 final/，不改來源、候選或產品。MCP Git status 可核對工作樹，未回傳當前 HEAD SHA；A 候選記載的 c5add81bfc38045664297b8087c78f5b2e258a44 不冒充本輪已驗 HEAD。現行關鍵產品檔案已讀取並核對，例如 `SceneEventTrackPolicy.cs` SHA b910458b217260711b6357f5585e56bff422969a1211bf58475921c289138d90、`scene-event-track-commands.ts` SHA cda0b5993c02d5d3d5b35400ad09b72e9ded94ef91acda1e5bdadcef94ab68dc、`StoryExperienceScreen.tsx` SHA eaf1a4bc7ed8bc4794f650e5e5d0c2097ec917cdcaa495aa525344439f6b5c2f。完整程式基準、實際符號及必要改動的全量核對仍待完成。

**設計內容清單與目前文件指紋**：以下是可取回的 Draft 內容本身，不是核准快照；本總覽為同一版本的完成契約與執行順序，核准時須鎖定總覽、全部 10 份文件及實際程式基準。

| 產物 | SHA-256 |
|---|---|
| [01-system-design.md](01-system-design.md) | `e9ffe583f1969e3483c0dd1c8c697a31abe709e1dd2ecdbec03aebe5d8609152` |
| [02-traceability.md](02-traceability.md) | `d4add9d9df85ca6fd998d19c8f0ef0f26a9e70763828031181fab8723c55a677` |
| [03-design-decision.md](03-design-decision.md) | `167aa87d4a7435e8401b123bfeb2863907b7799bdcdba230172e1b046d00bdd2` |
| [plans/SD-001-V4內容契約與作者草案編譯器.md](plans/SD-001-V4內容契約與作者草案編譯器.md) | `e68ca4083295d43a9b1cebc1dbde31dc8d2677d0cc668178f82bf374d1315d07` |
| [plans/SD-002-雙軌破冰與限時救書領域規則.md](plans/SD-002-雙軌破冰與限時救書領域規則.md) | `31c730a8dd83602261b6ca0795f07b9223bfc893cdfc899b142922b98f7635e5` |
| [plans/SD-003-權威計時交易與房間排程同步.md](plans/SD-003-權威計時交易與房間排程同步.md) | `ab2303e8d63f6416a59d2bab6e8334f1cdc5a96b6b1c1b98e973dd5f038ed635` |
| [plans/SD-004-去按鈕化探索書牆與雙向破冰前端UX.md](plans/SD-004-去按鈕化探索書牆與雙向破冰前端UX.md) | `3d519f2ce00c38e92bb957c7457b636ddfc7affadaee6726599f5b1b4361fd71` |
| [plans/SD-005-暴雨救書協作與四結局借閱小票前端UX.md](plans/SD-005-暴雨救書協作與四結局借閱小票前端UX.md) | `77157e4091df6e92a388c82286454fc22da0e1c52a0c7aa70b38de096ead3fb0` |
| [plans/SD-006-跨系統整合雙平台E2E與技術GateA驗收.md](plans/SD-006-跨系統整合雙平台E2E與技術GateA驗收.md) | `858455adddd012124956b19f4087bfd127ee781c8b692a114b508633a50cf593` |
| [plans/SD-007-實玩GateB與Local清理結案交付.md](plans/SD-007-實玩GateB與Local清理結案交付.md) | `ada7d1ee025d9ed15bf0ac2feaeb30bb904c344b12758896e1d3a3cae7d64c88` |

候選：[ChatGPT v2 Draft](../../chatgpt-gpt-6.2/20261125-2221-01/00-overview.md)、[Antigravity v1.0.0 Awaiting approval](../../antigravity-model-unprovided/20261125-2312-01/00-overview.md)（模型未提供）；兩者同來源 SHA，不互相取代；決策依 [03-design-decision](03-design-decision.md) 的 14 項主要取捨及 218 筆候選步驟對照。

## 前置與完成契約

保留原稿逐 scalar、所有分支、20 本書、28 節點、8 Area、80 項素材（45 新圖＋17 新音、13 沿用圖＋4 沿用音＋1 沿用 image-set）、兩題組、四結局、90 秒可配置與 15 秒暫緩；21 表、零新欄、零 Trigger、零新增公開 API。所有 15 AC、58 BDD（42 frontend）與 337 TDD 不刪減。排除 iOS、無障礙專項、完整 Puppet、其餘九場、AffectionAndFeedback；不新增或改寫劇本。

完整交付包括正式內容與新素材製作、Domain 與權威交易、Web/Android 產品畫面、真環境及雙端驗證、技術 Gate A、本人實玩 Gate B、具名 local 清理、乾淨重玩、深度稽核、必要補漏重驗、權威文件與受影響 overview 同步。所有必要結果均須具備真實證據；不以候選自評、測試命名、fixture 或歷史 V3 代簽，不調降安全 guard 或驗收。未指定金額預算／期限，不捏造估計。

設計階段只寫 final 文件，不執行產品開發、測試、發布或資料清理；核准後最初執行真 Miniflare D1 可行性 probe（SD-003-S00）。不符合原子毫秒判定、權利不明、內容容量/可達性或真平台不足即停止，不自行擴表、改劇本或降低 Gate。

## 開發進度總覽

### 整體進度

| 指標 | 完成／總數 | 判定 |
|---|---:|---|
| 設計完成 D | 0/30 | 尚待完整設計稽核，不能繼承候選自評 |
| SPEC 結構映射 | 15/15 | 完整設計涵蓋尚待逐項稽核 |
| BDD 結構映射 | 58/58 | 含42 frontend；完整語意與產品畫面仍待逐項稽核 |
| TDD 結構映射 | 337/337 | 層級、AC/BDD、原始前置/動作/斷言及主要細步已對應 |
| 實作驗證 I | 0/36 | 未開工 |
| 來源產品驗收 TDD | 0/337 | 175 Unit、57 Integration、18 API、87 E2E |

D/I 唯一分母來自各分項 Todo；39 個群組關卡（含 SD-003-S00）＋258 個細步＝297 個 S-ID，僅作執行定位與跨包整合，不增加進度分母。群組共用核心、fixture、命令與回歸關卡，不重複實作細步。設計涵蓋與實作證據是不同概念。

### 分項／分組進度追蹤

| 分項 | D 完成／總數 | I 完成／總數 | 群組／細步 | 主要 TDD | 狀態 |
|---|---:|---:|---:|---:|---|
| SD-001 | 0/4 | 0/5 | 6/11 | 20 | Draft／Planned |
| SD-002 | 0/5 | 0/6 | 6/39 | 92 | Draft／Planned |
| SD-003 | 0/5 | 0/6 | 8/70 | 78 | Draft／Planned |
| SD-004 | 0/4 | 0/4 | 4/19 | 24 | Draft／Planned |
| SD-005 | 0/4 | 0/4 | 4/22 | 18 | Draft／Planned |
| SD-006 | 0/4 | 0/6 | 6/86 | 89 | Draft／Planned |
| SD-007 | 0/4 | 0/5 | 5/11 | 16 | Draft／Planned |
| 合計 | 0/30 | 0/36 | 39/258 | 337 | 未開發 |

### 當前 Sprint 狀態

final 0.2.0-draft 已完成七個分項的現行入口補正；D 仍未全量驗證，不得勾選。剩餘為逐細步的精確 v3 schema/typed transition/action payload、素材實際畫面規格、來源斷言與 F/S/I/V 獨立稽核及基準鎖定。無執行中的 I、無產品變更。

### 里程碑

設計稽核與本人核准 → 真 D1 技術前置 → 內容/領域/前端/權威整合 → 真雙端 Gate A → 本人 Gate B → 具名 local 清理與雙端乾淨重玩 → 深度稽核與結案。

### 關鍵指標

Gate A 321 ID（001～294、310～333、335～337）；Gate B T295；後段 15 ID（T296～309/334）；最終337。T324 雙平台各自證據齊全才計一個 ID；T337 為技術總核對，先驗其餘320，不能要求自身已通過。

### 每日進度記錄

不適用。依 AGENTS.md 不記每日或批次流水帳；只維護現行設計、唯一 checkbox、進度及交接；驗證證據放既有 Verification。

## 系統設計與分項索引

[系統設計](01-system-design.md)／[追溯矩陣](02-traceability.md)／[設計決策](03-design-decision.md)

| 分項與責任 | 實際產品／驗收成果 | 必要前置 | 唯一責任／證據 |
|---|---|---|---|
| [SD-001](plans/SD-001-V4內容契約與作者草案編譯器.md) | 內容契約、62項新素材製作、18項素材沿用、作者原稿無損編譯與隔離候選發布 | SD-003-S00 | SD-001 F/V；產品內容與素材，不以驗證代替製作 |
| [SD-002](plans/SD-002-雙軌破冰與限時救書領域規則.md) | 雙軌、前半破冰、倒數/救書、自然完成與四結局等 Domain 規則及現行 Application 純投影 | SD-001 | SD-002 F/V；不重複建立 engine 或搬移 Projection |
| [SD-003](plans/SD-003-權威計時交易與房間排程同步.md) | 固定私有交易命令、D1 CAS/guard/receipt、DO 排程、HTTP/WS 授權與同步 | S00 最初；S01～S07 依 SD-001/002 | SD-003 F/V；現有 guard 與既有 transport |
| [SD-004](plans/SD-004-去按鈕化探索書牆與雙向破冰前端UX.md) | 前半書店探索、書牆、彩蛋及雙向破冰 UX，含共用型別與舞台幾何 | SD-001；與 SD-002 隔離資源時可並行 | SD-004 F/V；前半元件與共用舞台，SD-005 唯讀 |
| [SD-005](plans/SD-005-暴雨救書協作與四結局借閱小票前端UX.md) | 後半暴雨、救書協作、四結局、借閱小票及頂層生命週期 | SD-003、SD-004 | SD-005 F/V；唯一 StoryExperienceScreen 頂層組裝 |
| [SD-006](plans/SD-006-跨系統整合雙平台E2E與技術GateA驗收.md) | 真跨系統整合、Web/Android 各自 E2E、Gate A 321 ID 與精確 SHA 啟用 | SD-001～005 | SD-006 F/V；後段 runner 可準備但不提前驗收 |
| [SD-007](plans/SD-007-實玩GateB與Local清理結案交付.md) | 本人 Gate B、具名 local 清理、乾淨重玩、深度稽核與交付 | SD-006 Gate A；實際清理須本人 Gate B | SD-007 F/V；T295～309/334；最終 337/337 |

## 完整執行順序與整合

1. 完整 final 設計稽核通過、本人明確核准具體版本與快照、核對來源及程式基準。
2. SD-003-S00：在真隔離 Miniflare D1 驗交易內毫秒時間、同批 guard 失敗 rollback、NULL actor 冪等能力；不使用正式 DB，不提前勾選 T187/325/326。若不成立停止提出最小方案。
3. SD-001：80 素材（新62實際製作，沿用18逐項驗證）、作者編譯與正式候選隔離發布，原稿與舊 SHA 不變。SD-002/004 取得相同內容契約後可各自執行，只有寫入不重疊、契約已定且環境隔離才可並行。
4. SD-003-S01～S07：Domain 結果到位後，完成實際權威交易、投影、DO/HTTP/WS；SD-003 與 SD-004 成果到位後，SD-005 組裝後半與共用頂層。
5. SD-006：先基礎回歸，再真 local Live、Web、Android（8787、裝置、8081/8084/ADB 互斥），完成 Gate A 321 個唯一 ID；T337 最終技術總核對。Gate A 完成才啟用同一精確候選 SHA 的已知 local 正式索引，V3 釘選仍保留。
6. SD-007：隔離準備清理測試可以先完成，但實際 default local 停寫、備份、具名預覽／清理與刪除必須 T295 本人 Gate B 明確核准精確 SHA。保護資料指紋、FK、R2 共用引用檢查；雙端乾淨重玩，再全案 337/337 深度稽核與必要修補重驗、文件同步結案。禁止 remote/production。

所有細步依各分項群組順序表逐一執行，完成群組回歸才開始後續依賴；必要跨包整合及同 I 全部成果成立後才可勾選。缺實際產品 F/符號、必要分支、驗證前置、已確認權利或環境即停止，不降低標準。只有在核准範圍內修正實作錯誤可直接重驗；改設計須升版及重新確認。

## 風險、變更與決策

| 風險／決策 | 整合處理與停止條件 |
|---|---|
| D1 SQL 時鐘、CAS、NULL actor | 現行 batch 內 guard（非事後 meta.changes），SD-003-S00 先實測；失敗提出最小方案 |
| 90/120 釘選、四取書位置、三扣、暫緩 | 保留 RQ/RA；原稿不改，首次恢復不計成果，錯扣只重置 latchIndex，不能硬要求四 Area |
| 私密投影、資產授權與失權 | 既有 Application Projection 與 Worker 白名單、雙 transport、真雙端回歸；不增公開 system actor |
| 80 素材、16 經典、音樂與封面 | SD-001 逐項製作/沿用與權利核實；若權利不明、素材缺失或原稿衝突停止，不以 placeholder 代簽 |
| 內容與圖容量 | 50,000 graph、16,384 JSON、512KiB/4MiB、8MiB 保持；真實驗證超限停下 |
| 兩平台及 runner | 修現行 Android 舊路徑；真 Web/Android 獨立證據、效能與真 provider 必要證據，不以 fixture 代簽 |
| Gate A/B 與具名清理 | 321＋1＋15，精確 SHA，Gate B 後才實際清理；不明引用/混合非測試輪、保護指紋不一致或備份失敗即停止 |

重大候選取捨見 [03-design-decision](03-design-decision.md) DEC-01～14。現行分層與目錄已校正；SD-001 包含素材製作，不另拆素材 SD；SD-002 擁有 Domain 與現有 Application 純投影三檔，SD-003 服務/交易協調唯一寫入，不搬層。細步屬產品責任與整合，不以測試層級為主要切包。

## 檢查點與續作交接

本輪只變更 final/ 文件。來源、候選、產品、測試、設定及 DB 均未改。所有 I 0/36；無產品證據或已核准 final。結構稽核已完成來源 15/58/337 ID 及全部 337 原始條件／層級對應、218 候選步驟對照、297 個 S-ID 與30 D／36 I 的唯一 ID／群組順序及必要 I 引用；現版本 11 份 final Markdown 已通過 git diff --check（exit 0，11 checked、0 skipped）；Git status 只列 final/。尚未重新完成全部結構與語意稽核。0.2.0-draft 已校正四層正式 schema 入口、原始素材位置與 mask、實際 catalog/FK、共用書籤安全規則、DO 私有 system transport、前端共用入口、runner CLI 與 Gate A 時序。尚未完成 30 個設計葉節點之完整可執行性驗證；明確缺項是 v3 欄位／action payload 與全部 transition 逐一型別化、每個細步實際產品函式與來源斷言逐一核對、正式素材製作前可驗收規格與完整基準。MCP 未提供 HEAD SHA，不能鎖定 final 核准快照。不可用候選自行核准代替。

## SD 人工確認與交接

**Draft**；未到 Awaiting approval，未到 Ready for carefully-done。必須先完成全量設計稽核、修正未明確的實際符號／步驟／契約並鎖定可重現快照，才請使用者核准具體 final 版本。既有 RQ/RA 不需重答。真 D1 probe 是核准後實作前置，不在設計期代簽。

## 最終驗收與交付

| 完成契約 | 目前結果 |
|---|---|
| 固定範本完整 final（4根文件＋7分項） | 已建立，設計未核准 |
| 15 AC、58 BDD、337 TDD、218 候選步驟結構對照 | 已建立並比對唯一 ID |
| 全量產品設計稽核、素材/實際產品符號與可執行性 | 未全數完成，D 不勾選 |
| 真 D1/Worker/API/雙平台 Gate A | 未執行 |
| 本人 Gate B、具名 local 清理與乾淨重玩 | 未執行 |
| 最終全部來源與36 I 驗證／深度稽核／文件同步 | 未執行 |

## 相關文檔與生成資訊

- [系統設計](01-system-design.md)、[追溯矩陣](02-traceability.md)、[設計決策](03-design-decision.md)。
- [AGENTS](../../../../../../AGENTS.md)、[README](../../../../../../README.md)、[AI 工作流](../../../../../../overview/02-development-guidelines/03-ai-workflow-stages.md)。
- 原始候選包完整保留，final 文件指紋見上。生成者：ChatGPT GPT-6.2／2026-11-26／0.2.0-draft。
