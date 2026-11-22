# 新流程維護情境檢查

本文件用於三個技能的維護驗收，不要求每次處理產品需求重跑。S1–S22 在 2026-11-21、S23–S35 在 2026-11-22 以具體輸入對照實際規則做桌面推演；「通過」表示文件中的行為決策一致，未執行產品程式、真實多模型設計或 E2E，不代表產品驗證通過。

## 情境與桌面推演結果

| ID | 輸入／狀態 | 依規則推演的結果 | 規則／欄位依據 | 桌面查核 |
|---|---|---|---|---|
| S1 | 同 SPEC 由 AI A／模型 X 與 AI B／模型 Y 設計；另一次無模型資訊 | 各有合法 AI／模型目錄與新批次，未知記未提供；不自行啟動代理 | document-contract「文件配置與身分」；fantastic-design Phase 1 | 通過 |
| S2 | 同模型第二次重新設計，第一批已核准 | 建新批次，保留舊批與核准內容，不覆寫；新包不承接舊核准 | document-contract 身分及人工確認 | 通過 |
| S3 | SPEC-005-Alpha 與 SPEC-005-Beta 共用編號，來源同 MVP | 用完整名稱及來源路徑建立不同 SD 目錄與矩陣，不混用／取代 | document-contract 身分；各技能定位 | 通過 |
| S4 | 無 final，僅一完整、有效且已核准批次，含五份分項 | 選該批，計一套，鎖版本，依五包依賴逐項執行 | carefully-done Phase 1 | 通過 |
| S5 | 無 final，恰好兩套未取代候選 | 不自動選最新；通知指定具體批次或採 design-decision | carefully-done 選用表 | 通過 |
| S6 | 無 final，三套以上候選，其中舊批未標取代 | 三套都算；要求選用。只有明記取代後才可排除 | document-contract 候選計數；carefully-done 選用表 | 通過 |
| S7 | 有未核准／缺分項／過期 final，候選 A 已核准可用 | 停止、不退回 A；列 final 的缺項／版本問題與恢復條件 | carefully-done 選用表及前置；design-decision Phase 5 | 通過 |
| S8 | 候選來源 SPEC v1／v2 行為不同，或開工時來源已變動 | 先列差異、證據與白話影響；需求差異要確認，受影響核准失效，不自行對齊需求 | design-decision Phase 1；document-contract 基準 | 通過 |
| S9 | 實作發現已設計的函式、檔案、資料或驗證須換做法 | 停本需求後續實作，保存原案／證據／實務案例／建議／影響／恢復與重驗，確認後先升版再續作 | carefully-done 變更關卡；execution-protocol | 通過 |
| S10 | 一個 BDD Scenario 需 SD-001／002；寫不同檔但共用 DTO／DB | 指定共享寫入責任與互斥／隔離，等兩包全部成果及整合驗證才勾來源 | planning-rules P3；矩陣跨包表；execution-protocol 同步 | 通過 |
| S11 | 來源已有有效 [x]；另一 [x] 僅有測試名稱而無斷言／證據 | 逐項保留前者；後者退回待驗並說明，不因建 SD 全部歸零 | document-contract 計數；矩陣既有成果表 | 通過 |
| S12 | 包內測試通過，整合失敗；一包執行者自稱完成 | 執行狀態可完成待審，驗收保持 Incomplete；修補後在整合現況重驗，再啟動依賴工作 | planning-rules P4／P6；carefully-done Phase 3 | 通過 |
| S13 | 必要裝置 E2E 無環境，Unit／Integration 已通過 | E2E 留 Deferred、原因／責任／恢復條件；沒有已允許的同條件證據就不能結案 | planning-rules P7；分項驗證表 | 通過 |
| S14 | 無候選；或一完整批次加一未完整且未標取代批次 | 無候選先 fantastic-design；不完整批次揭露並取得處置，不能忽略後自動選唯一完整批 | document-contract 候選計數；carefully-done Phase 1 | 通過 |
| S15 | D 10/10；I 0/8；BDD 涵蓋 4/4；或某層 0/0 | 設計 100%、涵蓋 100%、實作 0%；零分母 N/A。全部欄位不重複計里程碑；有 Deferred 不能宣稱完成 | document-contract 三種進度；SD-plan Todo／里程碑 | 通過 |
| S16 | 執行中斷，使用者說已處理；原執行者可能仍在寫 | 先查恢復條件與寫入狀態；符合才實際續作，失敗先確認停止再移交，追蹤至驗收 | planning-rules P5；分項檢查點；execution-protocol 恢復 | 通過 |
| S17 | 初始計畫已有深度稽核與條件式修補，但目前只完成程式 | 仍是流程執行，按原基線完成稽核／修補／重驗及交付後才收尾 | planning-rules P1／P6；carefully-done Phase 3／4 | 通過 |
| S18 | 原定稽核完成且證據有效；或收尾發現新具體缺陷／重複失敗 | 無變更就直接收尾；具體缺陷只重開受影響項；重複失敗診斷換策略，不降標準／無限稽核 | planning-rules P4／P6；carefully-done Phase 4 | 通過 |
| S19 | 已核准候選混合成 final；final v2 要覆蓋已核准 v1 | final 不繼承候選核准；舊 final 完整保存為已取代歷史批，v2 重新確認 | document-contract 歷史與核准；design-decision Phase 3／5 | 通過 |
| S20 | 同一包有效確認後只回填測試結果；或改 Todo 定義／驗證方式 | 前者不升設計版／不重複問；後者是設計變更，停下確認再更新 | document-contract 設計內容清單；carefully-done 變更關卡 | 通過 |
| S21 | fantastic-design 的來源缺交接／待確認風險，另有概括持續執行指示 | 記缺項與恢復條件，不製造 Ready 或自行降級；保留原 perfect-plan／well-done 行為 | fantastic-design 前置；catalog 可選分支 | 通過 |
| S22 | design-decision 只列 A／B 總分或候選連結 | 未達交付；需每細項所有候選的優缺點／風險／理由及完整 final 四類 SD 和決策紀錄 | design-decision Phase 2／3；決策範本 | 通過 |
| S23 | I01 只寫「完成登入」，同時含表單、驗證、儲存及錯誤處理，無有序步驟 | 設計不完整；按具體行為／前置拆步，寫足核心邏輯、案例及命令後才可交接；不按檔案數硬切 | step-design 切分／必填；fantastic-design Phase 3／4 | 通過 |
| S24 | I01 需 S01、S02 與整合驗證；S01 已通過 | 只更新 S01 狀態與證據，I 保持未完成（0/1），步驟不加入分母；原 BDD／TDD 也不能提前勾選 | document-contract 計數；execution-protocol 同步 | 通過 |
| S25 | Red 指令失敗，原因是錯工作目錄或服務無法連線，目標斷言未執行 | 不算預期 Red；在核准範圍診斷環境，必要條件缺少時記恢復條件，不能直接進 Green | step-design 結果判定；execution-protocol 每步執行 | 通過 |
| S26 | 步驟只寫「執行測試確認通過」，缺 fixture、斷言、工作目錄與選擇器 | preflight 不通過，先補設計並依確認規則更新核准；不由實作者臨場猜測 | carefully-done Phase 1；分項案例／操作表 | 通過 |
| S27 | 候選 A、B 都有 S01，但來源 I、前置與契約不同，final 採混合方案 | 重建 final 步驟順序、唯一 I 與 F／V 映射，記候選到 final ID 對照，逐步重查，不直接拼表 | design-decision Phase 3／4；決策範本步驟對照 | 通過 |
| S28 | 上游已定有效整數範圍為 1–10，案例只給 5 | 補入 0／1／10／11 等具體邊界值及明確預期結果；格式錯誤依上游語意設計，不新增業務規則 | step-design 案例與斷言；分項案例表 | 通過 |
| S29 | 在資料遷移成功後、驗證前中斷，下一次接手 | 記 S-ID／子階段與實際資料狀態，查核是否已遷移及證據有效性，再驗證／續作；不盲目重跑副作用 | step-design 證據與恢復；execution-protocol 恢復 | 通過 |
| S30 | S01 的 Unit 通過，後續 S03 專責跨元件整合並已列前置 | S01 符合本步條件可讓滿足前置的 S02 開始；需 S03 的 I 及來源項目仍未完成，不把 Unit 當整合通過 | step-design 順序關卡；carefully-done Phase 2 | 通過 |
| S31 | 當前步驟發現欄位需改，但設計已定契約或操作順序 | 停本需求後續實作，保存原案／證據與影響，確認後先更新步驟及設計版本再續作；不得以局部細節豁免 | step-design 順序關卡；document-contract 設計基準 | 通過 |
| S32 | 已核准 v1 包沒有步驟，既有 I 部分已驗收 | 保留成果；先補步驟與設計版本並依確認規則更新核准，不只換契約號、不把原進度歸零 | document-contract v2 說明；carefully-done Phase 1 | 通過 |
| S33 | S02 前置引用不存在的 S99，或 S01／S02 相互依賴 | 設計稽核不通過，修正依賴與起始條件後才交接；不能靠改成無前置或跳步繞過 | step-design 交付前檢查；fantastic-design Phase 4 | 通過 |
| S34 | 某 I 無步驟、步驟無負責 I，或實際改動檔案沒有對應步驟 | 逐項映射查核找出孤立項，補齊責任、檔案及驗證；分項與矩陣一致後才可交接 | step-design 身分與順序；矩陣反向追溯 | 通過 |
| S35 | Red 編譯失敗來自設計明列待建立的方法；另有不相關型別錯誤 | 前者可作指定 Red 證據，後者不能算；須先辨識所有錯誤來源，不以任意編譯失敗代替目標案例 | step-design 結果判定；execution-protocol 每步執行 | 通過 |

## 維護驗證方法

- 三個技能分別執行 skill-creator 的 `scripts/quick_validate.py`；它只檢查 frontmatter／命名／未完成骨架，不驗證實際決策品質。
- 解析三份 `agents/openai.yaml`，檢查顯示名稱、25–64 字的簡介、含正確 `$skill-name` 的提示；保留預設自動選用。
- 查核 Markdown 相對連結與所有固定範本引用可解析。資產內 `{{...}}` 是輸出欄位，實際執行時須替換；不能把模板變數誤報成未完成技能骨架。
- 逐條核對 [能力完整性檢查](capability-checklist.md) 的十項能力，沿獨立規則、欄位與情境追蹤。
- 對每份分項範本確認完整進度／Todo、技術與逐檔設計、來源追溯、驗證、依賴／責任、變更與續作結構。確認三種進度、唯一葉節點、跨包條件及既有成果處理一致。
- 確認每個 I 的完整步驟集合、每步唯一 I、F-ID／V-ID、前置／順序、案例／斷言、命令／工作目錄、通過／停止及續作條件；步驟不建立可計數 checkbox。final 重建步驟且保留候選對照。
- 執行 `git diff --check`，用寫入前的檔案 SHA-256 基準比對受保護技能／範本及使用者已修改產品檔案；變更僅限本次授權範圍。catalog 保留原有規則與入口。

桌面推演與靜態驗證各自記錄；沒有執行產品功能或代理演練時明記未執行，不以本表取代產品驗收證據。

## 本次靜態驗證紀錄（2026-11-21）

| 實際執行檢查 | 結果 |
|---|---|
| `quick_validate.py` 分別驗證 fantastic-design、design-decision、carefully-done | 三者皆回傳 `Skill is valid!` |
| 三份 openai.yaml YAML 解析、簡介長度、正確 `$skill-name`、預設選用政策 | 通過 |
| 技能指令相對連結；在 repository 外暫存目錄具體配置候選與 final 範本後驗證產出連結 | 45 個連結通過；範本內的產出相對路徑按實際輸出配置檢查 |
| 四份固定 SD 資產、分項完整章節、UTF-8 與新增檔案空白格式 | 通過 |
| 本表 S1–S22 與十項能力的規則／欄位對照 | 桌面推演通過；未作多代理或產品執行測試 |
| 寫入前後 SHA-256 比對 1,140 個既有 tracked 檔案及 4,443 個既有技能／資產檔案（排除 catalog） | 既有 tracked 僅 catalog 改變；其餘內容保留，原 staged／unstaged 狀態保留 |
| catalog 逐行基準對照與 `git diff --check` | 原有內容與順序保留，僅新增；格式檢查通過 |

此次交付是技能、references、固定範本、metadata 與 catalog 入口；未開發產品功能、未執行產品 E2E、未發布 Plugin。

## 步驟細化驗證紀錄（2026-11-22）

| 實際執行檢查 | 結果 |
|---|---|
| 三個技能的 `quick_validate.py` | 三者皆回傳 `Skill is valid!` |
| 指令相對連結與 repository 外暫存的候選／final 範本配置 | 54 個連結通過 |
| 分項原有章節保留、步驟必填結構、表格欄數、UTF-8 與空白格式 | 通過；步驟區塊沒有另建可計數 checkbox |
| 文件契約與範本 v2、步驟／I 映射及進度規則 | 桌面查核一致；保留原 Todo 及來源計數方式 |
| S23–S35 的具體輸入、規則與範本欄位對照 | 13 項桌面推演通過；沒有執行產品或實際模型驗證 |
| 基準比對既有技能／範本及 catalog、三份 metadata | 34 份受保護技能／catalog 文件及 metadata 未變；本次寫入僅在三個技能內 |
| 工作樹同時變動的產品檔案 | 僅觀察並保留其現況，未覆寫、回復或納入本次修改 |
| `git diff --check` | 通過 |
