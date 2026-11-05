# SPEC-001-MatchingSessions — TDD 測試清單

> **MVP**：[MVP-001](../requirements/MVP-001-LoveGameDatingApp.md)；**SPEC**：[MatchingSessions](../specs/SPEC-001-MatchingSessions.md)（已確認 Q1～Q4）；**BDD**：[MatchingSessions BDD](../bdd/SPEC-001-MatchingSessions-BDD.md)
> **生成日期**：2026-11-06；**規劃狀態**：使用者已確認 RQ-01=A、RQ-02=A；Ready for well-done（尚未實作），不代表通過任何測試。

## 開發進度總覽

```text
📦 MatchingSessions / Red-Green-Refactor
├─ 狀態: ⏸️ 未開始
├─ 完整BDD場景: 0/75（0%）
├─ TDD完整測試ID: 0/174（0%）
└─ 風險稽核: 20風險已安排緩解，原24項另追加22項新測試；規劃可交接
```

| 測試層級 | 已完成 | 進行中 | 待開始 | 狀態 |
|---|---:|---:|---:|---|
| Unit | 0/60 | 0 | 60 | ⏸️ |
| Integration（真 Miniflare D1） | 0/64 | 0 | 64 | ⏸️ |
| API | 0/31 | 0 | 31 | ⏸️ |
| E2E（Web＋Android） | 0/19 | 0 | 19 | ⏸️ |
| **合計** | **0/174** | **0** | **174** | ⏸️ |

**追溯規則**：每個 `MS-BDD-001～075` 對應至少2項測試；舊63場景既有150項，第一輪新增11場景22項測試，本次增加1場景2項測試，並以「前置／操作／驗證」記清楚斷言；驗收時須按實際測試逐 ID 勾選，不因批次測試通過便整組標示完成。嚴格按 SPEC 第 7 節的 9 個端點驗證；D1 原子性不可用 HTTP mock 取代。iOS 暫緩，無障礙專項不列目前 MVP 驗收。

## 開發里程碑

- [ ] M1：配對評分與雙向必要資格的 Unit Red→Green。
- [ ] M2：四表 D1 migration、配對投影原子同步、永久互斥與 participant 占用競態。
- [ ] M3：真實雙方邀請／授權／9 個 API 端點及故障測試。
- [ ] M4：Web＋Android 候選、邀請、遊戲中保護與持久恢復。
- [ ] M5：RiskAudit 決策回寫、全量測試、平台證據及 well-done 驗收。


## 1️⃣ 單元測試（Unit）

**建議測試位置**：`backend/tests/DatingHigh.Unit.Tests/Application/MatchingSessionsTests.cs；frontend/client/tests/unit/matching-sessions.test.tsx`。使用純函式、Fake Repository／前端元件隔離；驗證輸入／行為／輸出，非 SQL 原子性證據。

- [ ] **MS-UT-001** — `FindCandidates_MSBDD001_RespectsRule`（critical）
  - **來源**：`MS-BDD-001` → `MS-AC-005`；**目標**：資料完成即可被探索。
  - **前置**：A與B均成年、資料就緒且未在遊戲中。
  - **執行**：A搜尋候選。
  - **斷言**：B出現在候選清單；不需額外開啟配對開關。

- [ ] **MS-UT-002** — `CalculateCompatibility_MSBDD002_RespectsRule`（critical）
  - **來源**：`MS-BDD-002` → `MS-AC-001`；**目標**：雙方以同一契合分數排序。
  - **前置**：A與B有興趣、生活型態及偏好資料。
  - **執行**：雙方各自搜尋對方。
  - **斷言**：兩方看到相同0至100整數契合分數；列表依分數遞減排列。

- [ ] **MS-UT-003** — `CalculateCompatibility_MSBDD003_RespectsRule`（critical）
  - **來源**：`MS-BDD-003` → `MS-AC-003`；**目標**：年齡不符合偏好也不淘汰。
  - **前置**：A偏好25至35歲且B為40歲。
  - **執行**：A搜尋合格候選。
  - **斷言**：B仍可列入候選；A對B年齡分量為75分。

- [ ] **MS-UT-004** — `CalculateCompatibility_MSBDD004_RespectsRule`（critical）
  - **來源**：`MS-BDD-004` → `MS-AC-003`；**目標**：地區距離只扣分不封鎖。
  - **前置**：A偏好台北、B位於遠方縣市。
  - **執行**：A搜尋合格候選。
  - **斷言**：B仍可能列出；距離越遠地區分量越低。

- [ ] **MS-UT-005** — `CheckEligibility_MSBDD005_RespectsRule`（critical）
  - **來源**：`MS-BDD-005` → `MS-AC-002`；**目標**：雙向性別性向相容才互配。
  - **前置**：A與B的性向各包含對方性別。
  - **執行**：A與B各自搜尋。
  - **斷言**：雙方可互相探索；不顯示對方私有性向欄位。

- [ ] **MS-UT-006** — `CreateInvitation_MSBDD006_RespectsRule`（critical）
  - **來源**：`MS-BDD-006` → `MS-AC-006`；**目標**：一方邀請只建立待回覆。
  - **前置**：A可配對B且尚無邀請。
  - **執行**：A點想認識。
  - **斷言**：僅有pending邀請；沒有active輪次與假聊天。

- [ ] **MS-UT-007** — `AcceptInvitation_MSBDD007_RespectsRule`（critical）
  - **來源**：`MS-BDD-007` → `MS-AC-007`；**目標**：接收者接受後建立唯一遊戲。
  - **前置**：A已向B送有效pending邀請且雙方空閒。
  - **執行**：B點接受。
  - **斷言**：只建立一個active round；A與B進入相同roundId且各有一筆game_round_participants。

- [ ] **MS-UT-008** — `AcceptInvitation_MSBDD008_RespectsRule`（critical）
  - **來源**：`MS-BDD-008` → `MS-AC-007`；**目標**：反向主動邀請視為第二次同意。
  - **前置**：B已向A發送有效pending邀請。
  - **執行**：A明確對B點想認識。
  - **斷言**：原邀請被接受；只建立一個active round。

- [ ] **MS-UT-009** — `DeclineInvitation_MSBDD009_RespectsRule`（critical）
  - **來源**：`MS-BDD-009` → `MS-AC-008`；**目標**：明確婉拒永久排除這一對。
  - **前置**：A已邀請B且B尚未回覆。
  - **執行**：B確認婉拒。
  - **斷言**：邀請永久成為declined；往後A與B彼此都不可出現在候選。

- [ ] **MS-UT-010** — `CreateInvitation_MSBDD010_RespectsRule`（normal）
  - **來源**：`MS-BDD-010` → `MS-AC-006`；**目標**：取消邀請不構成永久拒絕。
  - **前置**：A對B有pending邀請。
  - **執行**：A按取消邀請。
  - **斷言**：邀請成為cancelled且無round；後續仍可重新探索對方。

- [ ] **MS-UT-011** — `CreateInvitation_MSBDD011_RespectsRule`（normal）
  - **來源**：`MS-BDD-011` → `MS-AC-006`；**目標**：72小時未回覆不構成永久拒絕。
  - **前置**：A的邀請已逾72小時且B無回覆。
  - **執行**：A或B重新載入邀請。
  - **斷言**：邀請成為expired且不建立round；未來A與B可再次配對。

- [ ] **MS-UT-012** — `EndMatchRound_MSBDD012_RespectsRule`（critical）
  - **來源**：`MS-BDD-012` → `MS-AC-010`；**目標**：遊戲結束恢復與其他人配對。
  - **前置**：A與B有active遊戲且C與A性向相容。
  - **執行**：合法結束A與B的遊戲。
  - **斷言**：A與B釋放占用且與C可重新配對；A與B之間永久不能再配。

- [ ] **MS-UT-013** — `CalculateCompatibility_MSBDD013_RespectsRule`（normal）
  - **來源**：`MS-BDD-013` → `MS-AC-004`；**目標**：雙方都沒填年齡與地區偏好。
  - **前置**：A與B皆未設定兩種偏好。
  - **執行**：計算契合度。
  - **斷言**：僅興趣生活B占100百分比；兩人沒有因未填偏好被扣固定分數。

- [ ] **MS-UT-014** — `CalculateCompatibility_MSBDD014_RespectsRule`（critical）
  - **來源**：`MS-BDD-014` → `MS-AC-004`；**目標**：只有A設定年齡偏好。
  - **前置**：A設定年齡偏好但B沒有。
  - **執行**：計算配對分數。
  - **斷言**：只計A對B的年齡評價；基準與年齡按65比20重新正規化。

- [ ] **MS-UT-015** — `CalculateCompatibility_MSBDD015_RespectsRule`（critical）
  - **來源**：`MS-BDD-015` → `MS-AC-004`；**目標**：只有B設定地區偏好。
  - **前置**：只有B設定偏好縣市。
  - **執行**：計算配對分數。
  - **斷言**：只計B對A的地區評價；基準與地區按65比15重新正規化。

- [ ] **MS-UT-016** — `CalculateCompatibility_MSBDD016_RespectsRule`（normal）
  - **來源**：`MS-BDD-016` → `MS-AC-003`；**目標**：對方未提供所在地區。
  - **前置**：A設定偏好縣市而B的目前地區為空。
  - **執行**：計算地區分量。
  - **斷言**：該方向得到中性50分；B不因未填地區被排除。

- [ ] **MS-UT-017** — `CalculateCompatibility_MSBDD017_RespectsRule`（normal）
  - **來源**：`MS-BDD-017` → `MS-AC-003`；**目標**：多個偏好地區選距離最近者。
  - **前置**：A偏好台北與高雄而B位於台南。
  - **執行**：計算A對B的地區分量。
  - **斷言**：使用與台南較近的偏好縣市；不計最遠地區或平均多地區距離。

- [ ] **MS-UT-018** — `CalculateCompatibility_MSBDD018_RespectsRule`（normal）
  - **來源**：`MS-BDD-018` → `MS-AC-004`；**目標**：沒有共同標籤仍可得分。
  - **前置**：A與B沒有共同興趣但生活型態相同。
  - **執行**：計算契合度。
  - **斷言**：共同興趣子分量為零；生活型態及合法偏好仍可貢獻分數。

- [ ] **MS-UT-019** — `AcquireActiveRound_MSBDD019_RespectsRule`（critical）
  - **來源**：`MS-BDD-019` → `MS-AC-009`；**目標**：等待期間可同時收到不同邀請。
  - **前置**：A與B與C都空閒且都符合相容規則。
  - **執行**：A收到B和C的待決邀請。
  - **斷言**：可存在兩組不同pair的pending；任何一組未接受前A仍可被探索。

- [ ] **MS-UT-020** — `CalculateCompatibility_MSBDD020_RespectsRule`（normal）
  - **來源**：`MS-BDD-020` → `MS-AC-004`；**目標**：修改個人偏好後重算排序。
  - **前置**：A已在第一次搜尋後修改偏好並成功保存。
  - **執行**：A再次搜尋。
  - **斷言**：依最新資料重新算分排序；不信任前一次候選分數。

- [ ] **MS-UT-021** — `AcquireActiveRound_MSBDD021_RespectsRule`（critical）
  - **來源**：`MS-BDD-021` → `MS-AC-009`；**目標**：遊戲結束後第三人的邀請可重新發起。
  - **前置**：A與B已結束遊戲且C先前邀請因A開始遊戲失效。
  - **執行**：C再次探索A。
  - **斷言**：A重新出現在C候選；C可發新的邀請且舊invalidated不永久排除。

- [ ] **MS-UT-022** — `CheckEligibility_MSBDD022_RespectsRule`（critical）
  - **來源**：`MS-BDD-022` → `MS-AC-002`；**目標**：成年生日界線依台灣日期。
  - **前置**：某帳號今日正好滿18歲而另帳號尚未滿18歲。
  - **執行**：兩者分別請求配對。
  - **斷言**：滿18歲者可參與且未滿18歲者被排除；不回傳精確生日。

- [ ] **MS-UT-023** — `CalculateCompatibility_MSBDD023_RespectsRule`（critical）
  - **來源**：`MS-BDD-023` → `MS-AC-003`；**目標**：偏好閉區間端點給滿分。
  - **前置**：A年齡偏好25至35歲。
  - **執行**：B分別為25或35歲。
  - **斷言**：兩個年齡邊界均給100分；不視為超出一歲。

- [ ] **MS-UT-024** — `CalculateCompatibility_MSBDD024_RespectsRule`（critical）
  - **來源**：`MS-BDD-024` → `MS-AC-003`；**目標**：年齡超出一歲扣五分。
  - **前置**：A偏好25至35歲且B為36歲。
  - **執行**：計算A對B的年齡分量。
  - **斷言**：該分量是95分；B仍可列入候選。

- [ ] **MS-UT-025** — `CalculateCompatibility_MSBDD025_RespectsRule`（critical）
  - **來源**：`MS-BDD-025` → `MS-AC-003`；**目標**：年齡差二十歲扣至零。
  - **前置**：A偏好25至35歲且B為55歲。
  - **執行**：計算A對B的年齡分量。
  - **斷言**：該分量是0分；總分仍可由其他面向貢獻。

- [ ] **MS-UT-026** — `CalculateCompatibility_MSBDD026_RespectsRule`（normal）
  - **來源**：`MS-BDD-026` → `MS-AC-003`；**目標**：同一地區代碼距離為零。
  - **前置**：A偏好台北且B所在地區代碼也是台北。
  - **執行**：計算地區分量。
  - **斷言**：地區距離0公里且得到100分；不因代表座標精度降低同地區分數。

- [ ] **MS-UT-027** — `CalculateCompatibility_MSBDD027_RespectsRule`（normal）
  - **來源**：`MS-BDD-027` → `MS-AC-003`；**目標**：距離150公里地區分量約37。
  - **前置**：A偏好縣市到B的代表座標距離為150公里。
  - **執行**：計算地區分量。
  - **斷言**：取得約37分；300公里分數需比150公里低。

- [ ] **MS-UT-028** — `CalculateCompatibility_MSBDD028_RespectsRule`（critical）
  - **來源**：`MS-BDD-028` → `MS-AC-004`；**目標**：雙方年齡評價不同仍共用一分。
  - **前置**：A對B年齡評分75而B對A年齡評分100。
  - **執行**：計算雙向年齡面向。
  - **斷言**：年齡分量為87.5；雙方看同一個總分。

- [ ] **MS-UT-029** — `CalculateCompatibility_MSBDD029_RespectsRule`（normal）
  - **來源**：`MS-BDD-029` → `MS-AC-004`；**目標**：雙方地區偏好取兩向平均。
  - **前置**：A與B皆有地區偏好而距離不同。
  - **執行**：計算雙向地區分量。
  - **斷言**：使用兩個方向的算術平均；交換A與B輸入順序分數不變。

- [ ] **MS-UT-030** — `CalculateCompatibility_MSBDD030_RespectsRule`（critical）
  - **來源**：`MS-BDD-030` → `MS-AC-004`；**目標**：共同興趣權重零只看生活。
  - **前置**：雙方共同興趣權重皆為0。
  - **執行**：計算基準契合分量。
  - **斷言**：基準B只根據生活型態L；興趣I不影響基準。

- [ ] **MS-UT-031** — `CalculateCompatibility_MSBDD031_RespectsRule`（critical）
  - **來源**：`MS-BDD-031` → `MS-AC-004`；**目標**：共同興趣權重滿分只看興趣。
  - **前置**：雙方共同興趣權重皆為100。
  - **執行**：計算基準契合分量。
  - **斷言**：基準B只根據興趣I；生活型態L不影響基準。

- [ ] **MS-UT-032** — `CalculateCompatibility_MSBDD032_RespectsRule`（critical）
  - **來源**：`MS-BDD-032` → `MS-AC-004`；**目標**：所有分量最後才四捨五入。
  - **前置**：輸入包含非整數地區指數與雙向平均。
  - **執行**：計算總契合分數。
  - **斷言**：僅最後一次四捨五入且限制0至100；雙方交換順序仍同分。

- [ ] **MS-UT-033** — `CreateInvitation_MSBDD033_RespectsRule`（critical）
  - **來源**：`MS-BDD-033` → `MS-AC-006`；**目標**：恰好72小時邀請已過期。
  - **前置**：邀請有效時間設定72小時。
  - **執行**：在建立後恰好72小時提交接受。
  - **斷言**：拒絕接受並標記expired；沒有round或占用。

- [ ] **MS-UT-034** — `RenderMatchingScreen_MSBDD049_RespectsRule`（normal）
  - **來源**：`MS-BDD-049` → `MS-AC-005`；**目標**：配對頁初始載入顯示安全候選卡。
  - **前置**：A有效登入、資料就緒且存在可配對B。
  - **執行**：A開啟候選頁。
  - **斷言**：顯示B化身暱稱與契合分數；不顯示照片與完整本人名片。

- [ ] **MS-UT-035** — `RenderMatchingScreen_MSBDD050_RespectsRule`（normal）
  - **來源**：`MS-BDD-050` → `MS-AC-005`；**目標**：沒有對象時呈現空狀態。
  - **前置**：A目前沒有適格候選。
  - **執行**：A開啟候選頁。
  - **斷言**：顯示目前沒有可配對的對象；不插入任何固定測試角色。

- [ ] **MS-UT-036** — `RenderMatchingScreen_MSBDD051_RespectsRule`（critical）
  - **來源**：`MS-BDD-051` → `MS-AC-006`；**目標**：發起邀請後顯示等待。
  - **前置**：A的候選清單已載入且B可配。
  - **執行**：A點想認識。
  - **斷言**：B卡片顯示等待回覆；不直接開啟雙人房間。

- [ ] **MS-UT-037** — `RenderMatchingScreen_MSBDD052_RespectsRule`（critical）
  - **來源**：`MS-BDD-052` → `MS-AC-008`；**目標**：婉拒前先明示永遠不再配對。
  - **前置**：B收到A的pending邀請。
  - **執行**：B點婉拒。
  - **斷言**：顯示婉拒後你們將無法再次互相配對；只有B確認後才送出decline。

- [ ] **MS-UT-038** — `RenderMatchingScreen_MSBDD053_RespectsRule`（normal）
  - **來源**：`MS-BDD-053` → `MS-AC-006`；**目標**：取消邀請顯示非永久拒絕。
  - **前置**：A正在檢視自己送出的pending邀請。
  - **執行**：A按取消邀請。
  - **斷言**：顯示已取消並更新列表；不顯示永久封鎖文案。

- [ ] **MS-UT-039** — `RenderMatchingScreen_MSBDD054_RespectsRule`（normal）
  - **來源**：`MS-BDD-054` → `MS-AC-006`；**目標**：逾期邀請顯示已逾期。
  - **前置**：B開啟已到期的邀請詳情。
  - **執行**：B重新載入狀態。
  - **斷言**：顯示已逾期且接受鈕不可用；不進入遊戲。

- [ ] **MS-UT-040** — `RenderMatchingScreen_MSBDD055_RespectsRule`（critical）
  - **來源**：`MS-BDD-055` → `MS-AC-007`；**目標**：接受成功兩端導向同一場遊戲。
  - **前置**：A與B已互相確認。
  - **執行**：A與B各自開啟輪次入口。
  - **斷言**：兩端都顯示同一roundId專屬房間；沒有偽造劇情或假訊息。

- [ ] **MS-UT-041** — `RenderMatchingScreen_MSBDD056_RespectsRule`（critical）
  - **來源**：`MS-BDD-056` → `MS-AC-009`；**目標**：遊戲中配對入口被阻擋。
  - **前置**：A已有active遊戲。
  - **執行**：A點配對入口。
  - **斷言**：顯示遊戲進行中結束後才能重新配對；可返回目前那場遊戲。

- [ ] **MS-UT-042** — `RenderMatchingScreen_MSBDD057_RespectsRule`（normal）
  - **來源**：`MS-BDD-057` → `MS-AC-009`；**目標**：第三方收到的邀請會顯示失效。
  - **前置**：C原本邀請A而A已和B開始遊戲。
  - **執行**：C開啟邀請列表。
  - **斷言**：涵蓋 BDD-057 兩個 Examples：other_round_started 顯示「對方目前無法配對，這次邀請已失效」，eligibility_changed 顯示「配對條件已變更，請重新搜尋」；兩者都不顯示婉拒、永久互斥或新的配對對象（RQ-02=A）。

- [ ] **MS-UT-043** — `RenderMatchingScreen_MSBDD058_RespectsRule`（normal）
  - **來源**：`MS-BDD-058` → `MS-AC-013`；**目標**：切換裝置後恢復真配對狀態。
  - **前置**：A已發pending或已有active round。
  - **執行**：A在另一裝置有效登入並重載。
  - **斷言**：讀出持久化真狀態；不以本機記憶陣列假冒已接受。

- [ ] **MS-UT-044** — `RenderMatchingScreen_MSBDD059_RespectsRule`（normal）
  - **來源**：`MS-BDD-059` → `MS-AC-013`；**目標**：網路中斷時不假裝邀請成功。
  - **前置**：A按想認識後網路失去回覆。
  - **執行**：A檢視結果並重試進入列表。
  - **斷言**：顯示狀態不明請重新整理；先唯讀回查不盲目創第二筆。

- [ ] **MS-UT-045** — `RenderMatchingScreen_MSBDD060_RespectsRule`（normal）
  - **來源**：`MS-BDD-060` → `MS-AC-011`；**目標**：連點邀請按鈕不得重複發送。
  - **前置**：A看到B候選且尚無pending。
  - **執行**：A連續快速點想認識。
  - **斷言**：按鈕載入中禁用；server最終只有一筆有效邀請。

- [ ] **MS-UT-046** — `RenderMatchingScreen_MSBDD061_RespectsRule`（normal）
  - **來源**：`MS-BDD-061` → `MS-AC-001`；**目標**：分頁及同分排序穩定。
  - **前置**：A可探索超過20名候選且含同分者。
  - **執行**：A翻下一頁。
  - **斷言**：顯示分頁與固定同分順序；不顯示他人隱藏偏好分量。

- [ ] **MS-UT-047** — `RenderMatchingScreen_MSBDD062_RespectsRule`（critical）
  - **來源**：`MS-BDD-062` → `MS-AC-014`；**目標**：配對成功仍不可直接看真人照。
  - **前置**：A與B已同意配對但未同意交換名片。
  - **執行**：A點進B人物資訊。
  - **斷言**：只顯示安全角色內容；不可取得私人R2照片或職業欄位。

- [ ] **MS-UT-048** — `RenderMatchingScreen_MSBDD063_RespectsRule`（normal）
  - **來源**：`MS-BDD-063` → `MS-AC-002`；**目標**：資料尚未完成提供返回設定入口。
  - **前置**：A缺性別或未儲存性向。
  - **執行**：A開啟配對探索。
  - **斷言**：顯示請先完成個人資料；提供返回設定入口且不顯示其他人的資料。


### 2026-11-05 [補強] Unit 稽核新增測試（2 項）

**狀態**：未開始，已確認 RiskAudit RQ-01=A、RQ-02=A。

- [ ] **MS-UT-049** — `RegionScore_RepresentativeCountyCoordinates_UsesStableDistance`（RiskAudit `MS-GAP-19`）
  - **追溯**：`MS-BDD-026` → `MS-AC-003`；完整需求見 RiskAudit §三。
  - **前置／操作**：以 §4.2／BDD-026,027 情境配置必要的雙人／三人帳號、本人登入及資料狀態；執行 `RegionScore_RepresentativeCountyCoordinates_UsesStableDistance`。
  - **斷言**：同縣市0、距離遞減、外島及對照表全集；實際落地與安全性均符合 SDD，無假成功或額外副作用。

- [ ] **MS-UT-050** — `CompatibilityScore_UnsetOptionalPreferences_RenormalizesWeights`（RiskAudit `MS-GAP-20`）
  - **追溯**：`MS-BDD-013` → `MS-AC-004`；完整需求見 RiskAudit §三。
  - **前置／操作**：以 §4.2／BDD-013,014,015 情境配置必要的雙人／三人帳號、本人登入及資料狀態；執行 `CompatibilityScore_UnsetOptionalPreferences_RenormalizesWeights`。
  - **斷言**：無／只有單邊／都有；最後四捨五入；實際落地與安全性均符合 SDD，無假成功或額外副作用。

### 2026-11-06 [補強] UT 新增測試（10項）

- [ ] **MS-UT-051** — `OnlyReadyProfileCreatesMatchCondition`（critical）
  - **來源**：`MS-BDD-064` → `MS-AC-005`；**目標**：新版設計規劃補強。
  - **前置／操作**：配置BDD-064描述的真實帳號及條件後執行 OnlyReadyProfileCreatesMatchCondition。
  - **斷言**：未完成資料仍保留user_profiles，合格才建立accountId唯一的match_conditions且不儲存source_profile_revision；僅配對相關條件改變時同步投影，無關照片排序或分享設定不觸發同步；須有真實測試證據，不能僅以 mock 驗SQL。

- [ ] **MS-UT-052** — `ProfileLossRemovesSearchProjection`（critical）
  - **來源**：`MS-BDD-065` → `MS-AC-005`；**目標**：新版設計規劃補強。
  - **前置／操作**：配置BDD-065描述的真實帳號及條件後執行 ProfileLossRemovesSearchProjection。
  - **斷言**：資料不合格時原子移除投影，但game_rounds及參與者不提前結束；須有真實測試證據，不能僅以 mock 驗SQL。

- [ ] **MS-UT-053** — `PendingBeforeOrientationEditRemainsValid`（critical）
  - **來源**：`MS-BDD-066` → `MS-AC-007`；**目標**：新版設計規劃補強。
  - **前置／操作**：配置BDD-066描述的真實帳號及條件後執行 PendingBeforeOrientationEditRemainsValid。
  - **斷言**：舊pending不因性向變更或match_conditions列被移除而失效；成年及化身仍須有效；須有真實測試證據，不能僅以 mock 驗SQL。

- [ ] **MS-UT-054** — `UpdatedOrientationFiltersNewCandidates`（critical）
  - **來源**：`MS-BDD-067` → `MS-AC-002`；**目標**：新版設計規劃補強。
  - **前置／操作**：配置BDD-067描述的真實帳號及條件後執行 UpdatedOrientationFiltersNewCandidates。
  - **斷言**：新搜尋與新邀請使用最新條件，原pending不改；須有真實測試證據，不能僅以 mock 驗SQL。

- [ ] **MS-UT-055** — `LoginRouting_ProfileActiveOrReady`（critical）
  - **來源**：`MS-BDD-068` → `MS-AC-005`；**目標**：新版設計規劃補強。
  - **前置／操作**：配置BDD-068描述的真實帳號及條件後執行 LoginRouting_ProfileActiveOrReady。
  - **斷言**：初次登入未完成導向Profile、有遊戲導向遊戲、就緒導向探索，API未知安全重試；須有真實測試證據，不能僅以 mock 驗SQL。

- [ ] **MS-UT-056** — `RankBeforePaginationAndFetchPersonaOnDemand`（critical）
  - **來源**：`MS-BDD-069` → `MS-AC-001`；**目標**：新版設計規劃補強。
  - **前置／操作**：配置BDD-069描述的真實帳號及條件後執行 RankBeforePaginationAndFetchPersonaOnDemand。
  - **斷言**：先完整計分排序再分頁；GET單筆安全人物卡、禁止透露私有資料；須有真實測試證據，不能僅以 mock 驗SQL。

- [ ] **MS-UT-057** — `SingleGameParticipantUniqueByAccount`（critical）
  - **來源**：`MS-BDD-070` → `MS-AC-011`；**目標**：新版設計規劃補強。
  - **前置／操作**：配置BDD-070描述的真實帳號及條件後執行 SingleGameParticipantUniqueByAccount。
  - **斷言**：game_round_participants.account_id UNIQUE及真D1並行失敗回滾；須有真實測試證據，不能僅以 mock 驗SQL。

- [ ] **MS-UT-058** — `EndGame_UnreadyPlayerStillNotDiscoverable`（critical）
  - **來源**：`MS-BDD-071` → `MS-AC-010`；**目標**：新版設計規劃補強。
  - **前置／操作**：配置BDD-071描述的真實帳號及條件後執行 EndGame_UnreadyPlayerStillNotDiscoverable。
  - **斷言**：遊戲結束只釋放占用，不會替不合格玩家重建投影；須有真實測試證據，不能僅以 mock 驗SQL。

- [ ] **MS-UT-059** — `PendingDirections_ReturnCorrectActions`（critical）
  - **來源**：`MS-BDD-072` → `MS-AC-006`；**目標**：新版設計規劃補強。
  - **前置／操作**：配置BDD-072描述的真實帳號及條件後執行 PendingDirections_ReturnCorrectActions。
  - **斷言**：incoming可接受、outgoing等待不重送，不能全量排除pending；須有真實測試證據，不能僅以 mock 驗SQL。

- [ ] **MS-UT-060** — `UnrelatedProfileEdit_DoesNotTouchMatchingConditions`（critical）
  - **來源**：`MS-BDD-075` → `MS-AC-005`、`MS-AC-012`；**目標**：無關個資更新不影響配對搜尋。
  - **前置**：玩家符合資格且有 match_conditions，真人照片排序或名片可見性調整會增加 user_profiles.revision。
  - **執行**：模擬僅變更非配對欄位；執行共用配對輸入差異判斷。
  - **斷言**：不產生 match_conditions UPSERT／DELETE，不進行兩表 revision 相等檢查，仍符合配對資格。
## 2️⃣ 集成測試（Integration）

**建議測試位置**：`cloudflare/tests/matching-sessions-d1.integration.test.ts；tests/integration/matching-sessions.test.mjs`。必須使用真 Miniflare D1 及 Worker fixed commands，確認交易回滾、UNIQUE、FK／CHECK、跨 pair 競態與持久重讀；HTTP fixture 不足以作為 D1 證據。

- [ ] **MS-IT-001** — `PersistMatchingState_MSBDD001_PersistsCorrectly`（critical）
  - **來源**：`MS-BDD-001` → `MS-AC-005`；**目標**：資料完成即可被探索。
  - **前置**：A與B均成年、資料就緒且未在遊戲中。
  - **執行**：A搜尋候選。
  - **斷言**：B出現在候選清單；不需額外開啟配對開關。

- [ ] **MS-IT-002** — `PersistMatchingState_MSBDD002_PersistsCorrectly`（critical）
  - **來源**：`MS-BDD-002` → `MS-AC-001`；**目標**：雙方以同一契合分數排序。
  - **前置**：A與B有興趣、生活型態及偏好資料。
  - **執行**：雙方各自搜尋對方。
  - **斷言**：兩方看到相同0至100整數契合分數；列表依分數遞減排列。

- [ ] **MS-IT-003** — `PersistMatchingState_MSBDD003_PersistsCorrectly`（critical）
  - **來源**：`MS-BDD-003` → `MS-AC-003`；**目標**：年齡不符合偏好也不淘汰。
  - **前置**：A偏好25至35歲且B為40歲。
  - **執行**：A搜尋合格候選。
  - **斷言**：B仍可列入候選；A對B年齡分量為75分。

- [ ] **MS-IT-004** — `PersistMatchingState_MSBDD004_PersistsCorrectly`（critical）
  - **來源**：`MS-BDD-004` → `MS-AC-003`；**目標**：地區距離只扣分不封鎖。
  - **前置**：A偏好台北、B位於遠方縣市。
  - **執行**：A搜尋合格候選。
  - **斷言**：B仍可能列出；距離越遠地區分量越低。

- [ ] **MS-IT-005** — `PersistMatchingState_MSBDD005_PersistsCorrectly`（critical）
  - **來源**：`MS-BDD-005` → `MS-AC-002`；**目標**：雙向性別性向相容才互配。
  - **前置**：A與B的性向各包含對方性別。
  - **執行**：A與B各自搜尋。
  - **斷言**：雙方可互相探索；不顯示對方私有性向欄位。

- [ ] **MS-IT-006** — `PersistMatchingState_MSBDD006_PersistsCorrectly`（critical）
  - **來源**：`MS-BDD-006` → `MS-AC-006`；**目標**：一方邀請只建立待回覆。
  - **前置**：A可配對B且尚無邀請。
  - **執行**：A點想認識。
  - **斷言**：僅有pending邀請；沒有active輪次與假聊天。

- [ ] **MS-IT-007** — `PersistMatchingState_MSBDD007_PersistsCorrectly`（critical）
  - **來源**：`MS-BDD-007` → `MS-AC-007`；**目標**：接收者接受後建立唯一遊戲。
  - **前置**：A已向B送有效pending邀請且雙方空閒。
  - **執行**：B點接受。
  - **斷言**：只建立一個active round；A與B進入相同roundId且各有一筆game_round_participants。

- [ ] **MS-IT-008** — `PersistMatchingState_MSBDD008_PersistsCorrectly`（critical）
  - **來源**：`MS-BDD-008` → `MS-AC-007`；**目標**：反向主動邀請視為第二次同意。
  - **前置**：B已向A發送有效pending邀請。
  - **執行**：A明確對B點想認識。
  - **斷言**：原邀請被接受；只建立一個active round。

- [ ] **MS-IT-009** — `PersistMatchingState_MSBDD009_PersistsCorrectly`（critical）
  - **來源**：`MS-BDD-009` → `MS-AC-008`；**目標**：明確婉拒永久排除這一對。
  - **前置**：A已邀請B且B尚未回覆。
  - **執行**：B確認婉拒。
  - **斷言**：邀請永久成為declined；往後A與B彼此都不可出現在候選。

- [ ] **MS-IT-010** — `PersistMatchingState_MSBDD010_PersistsCorrectly`（normal）
  - **來源**：`MS-BDD-010` → `MS-AC-006`；**目標**：取消邀請不構成永久拒絕。
  - **前置**：A對B有pending邀請。
  - **執行**：A按取消邀請。
  - **斷言**：邀請成為cancelled且無round；後續仍可重新探索對方。

- [ ] **MS-IT-011** — `PersistMatchingState_MSBDD011_PersistsCorrectly`（normal）
  - **來源**：`MS-BDD-011` → `MS-AC-006`；**目標**：72小時未回覆不構成永久拒絕。
  - **前置**：A的邀請已逾72小時且B無回覆。
  - **執行**：A或B重新載入邀請。
  - **斷言**：邀請成為expired且不建立round；未來A與B可再次配對。

- [ ] **MS-IT-012** — `PersistMatchingState_MSBDD012_PersistsCorrectly`（critical）
  - **來源**：`MS-BDD-012` → `MS-AC-010`；**目標**：遊戲結束恢復與其他人配對。
  - **前置**：A與B有active遊戲且C與A性向相容。
  - **執行**：合法結束A與B的遊戲。
  - **斷言**：A與B釋放占用且與C可重新配對；A與B之間永久不能再配。

- [ ] **MS-IT-013** — `PersistMatchingState_MSBDD013_PersistsCorrectly`（normal）
  - **來源**：`MS-BDD-013` → `MS-AC-004`；**目標**：雙方都沒填年齡與地區偏好。
  - **前置**：A與B皆未設定兩種偏好。
  - **執行**：計算契合度。
  - **斷言**：僅興趣生活B占100百分比；兩人沒有因未填偏好被扣固定分數。

- [ ] **MS-IT-014** — `PersistMatchingState_MSBDD014_PersistsCorrectly`（critical）
  - **來源**：`MS-BDD-014` → `MS-AC-004`；**目標**：只有A設定年齡偏好。
  - **前置**：A設定年齡偏好但B沒有。
  - **執行**：計算配對分數。
  - **斷言**：只計A對B的年齡評價；基準與年齡按65比20重新正規化。

- [ ] **MS-IT-015** — `PersistMatchingState_MSBDD015_PersistsCorrectly`（critical）
  - **來源**：`MS-BDD-015` → `MS-AC-004`；**目標**：只有B設定地區偏好。
  - **前置**：只有B設定偏好縣市。
  - **執行**：計算配對分數。
  - **斷言**：只計B對A的地區評價；基準與地區按65比15重新正規化。

- [ ] **MS-IT-016** — `PersistMatchingState_MSBDD016_PersistsCorrectly`（normal）
  - **來源**：`MS-BDD-016` → `MS-AC-003`；**目標**：對方未提供所在地區。
  - **前置**：A設定偏好縣市而B的目前地區為空。
  - **執行**：計算地區分量。
  - **斷言**：該方向得到中性50分；B不因未填地區被排除。

- [ ] **MS-IT-017** — `PersistMatchingState_MSBDD017_PersistsCorrectly`（normal）
  - **來源**：`MS-BDD-017` → `MS-AC-003`；**目標**：多個偏好地區選距離最近者。
  - **前置**：A偏好台北與高雄而B位於台南。
  - **執行**：計算A對B的地區分量。
  - **斷言**：使用與台南較近的偏好縣市；不計最遠地區或平均多地區距離。

- [ ] **MS-IT-018** — `PersistMatchingState_MSBDD018_PersistsCorrectly`（normal）
  - **來源**：`MS-BDD-018` → `MS-AC-004`；**目標**：沒有共同標籤仍可得分。
  - **前置**：A與B沒有共同興趣但生活型態相同。
  - **執行**：計算契合度。
  - **斷言**：共同興趣子分量為零；生活型態及合法偏好仍可貢獻分數。

- [ ] **MS-IT-019** — `PersistMatchingState_MSBDD019_PersistsCorrectly`（critical）
  - **來源**：`MS-BDD-019` → `MS-AC-009`；**目標**：等待期間可同時收到不同邀請。
  - **前置**：A與B與C都空閒且都符合相容規則。
  - **執行**：A收到B和C的待決邀請。
  - **斷言**：可存在兩組不同pair的pending；任何一組未接受前A仍可被探索。

- [ ] **MS-IT-020** — `PersistMatchingState_MSBDD020_PersistsCorrectly`（normal）
  - **來源**：`MS-BDD-020` → `MS-AC-004`；**目標**：修改個人偏好後重算排序。
  - **前置**：A已在第一次搜尋後修改偏好並成功保存。
  - **執行**：A再次搜尋。
  - **斷言**：依最新資料重新算分排序；不信任前一次候選分數。

- [ ] **MS-IT-021** — `PersistMatchingState_MSBDD021_PersistsCorrectly`（critical）
  - **來源**：`MS-BDD-021` → `MS-AC-009`；**目標**：遊戲結束後第三人的邀請可重新發起。
  - **前置**：A與B已結束遊戲且C先前邀請因A開始遊戲失效。
  - **執行**：C再次探索A。
  - **斷言**：A重新出現在C候選；C可發新的邀請且舊invalidated不永久排除。

- [ ] **MS-IT-022** — `PersistMatchingState_MSBDD022_PersistsCorrectly`（critical）
  - **來源**：`MS-BDD-022` → `MS-AC-002`；**目標**：成年生日界線依台灣日期。
  - **前置**：某帳號今日正好滿18歲而另帳號尚未滿18歲。
  - **執行**：兩者分別請求配對。
  - **斷言**：滿18歲者可參與且未滿18歲者被排除；不回傳精確生日。

- [ ] **MS-IT-023** — `PersistMatchingState_MSBDD023_PersistsCorrectly`（critical）
  - **來源**：`MS-BDD-023` → `MS-AC-003`；**目標**：偏好閉區間端點給滿分。
  - **前置**：A年齡偏好25至35歲。
  - **執行**：B分別為25或35歲。
  - **斷言**：兩個年齡邊界均給100分；不視為超出一歲。

- [ ] **MS-IT-024** — `PersistMatchingState_MSBDD024_PersistsCorrectly`（critical）
  - **來源**：`MS-BDD-024` → `MS-AC-003`；**目標**：年齡超出一歲扣五分。
  - **前置**：A偏好25至35歲且B為36歲。
  - **執行**：計算A對B的年齡分量。
  - **斷言**：該分量是95分；B仍可列入候選。

- [ ] **MS-IT-025** — `PersistMatchingState_MSBDD025_PersistsCorrectly`（critical）
  - **來源**：`MS-BDD-025` → `MS-AC-003`；**目標**：年齡差二十歲扣至零。
  - **前置**：A偏好25至35歲且B為55歲。
  - **執行**：計算A對B的年齡分量。
  - **斷言**：該分量是0分；總分仍可由其他面向貢獻。

- [ ] **MS-IT-026** — `PersistMatchingState_MSBDD026_PersistsCorrectly`（normal）
  - **來源**：`MS-BDD-026` → `MS-AC-003`；**目標**：同一地區代碼距離為零。
  - **前置**：A偏好台北且B所在地區代碼也是台北。
  - **執行**：計算地區分量。
  - **斷言**：地區距離0公里且得到100分；不因代表座標精度降低同地區分數。

- [ ] **MS-IT-027** — `PersistMatchingState_MSBDD027_PersistsCorrectly`（normal）
  - **來源**：`MS-BDD-027` → `MS-AC-003`；**目標**：距離150公里地區分量約37。
  - **前置**：A偏好縣市到B的代表座標距離為150公里。
  - **執行**：計算地區分量。
  - **斷言**：取得約37分；300公里分數需比150公里低。

- [ ] **MS-IT-028** — `PersistMatchingState_MSBDD028_PersistsCorrectly`（critical）
  - **來源**：`MS-BDD-028` → `MS-AC-004`；**目標**：雙方年齡評價不同仍共用一分。
  - **前置**：A對B年齡評分75而B對A年齡評分100。
  - **執行**：計算雙向年齡面向。
  - **斷言**：年齡分量為87.5；雙方看同一個總分。

- [ ] **MS-IT-029** — `PersistMatchingState_MSBDD029_PersistsCorrectly`（normal）
  - **來源**：`MS-BDD-029` → `MS-AC-004`；**目標**：雙方地區偏好取兩向平均。
  - **前置**：A與B皆有地區偏好而距離不同。
  - **執行**：計算雙向地區分量。
  - **斷言**：使用兩個方向的算術平均；交換A與B輸入順序分數不變。

- [ ] **MS-IT-030** — `PersistMatchingState_MSBDD030_PersistsCorrectly`（critical）
  - **來源**：`MS-BDD-030` → `MS-AC-004`；**目標**：共同興趣權重零只看生活。
  - **前置**：雙方共同興趣權重皆為0。
  - **執行**：計算基準契合分量。
  - **斷言**：基準B只根據生活型態L；興趣I不影響基準。

- [ ] **MS-IT-031** — `PersistMatchingState_MSBDD031_PersistsCorrectly`（critical）
  - **來源**：`MS-BDD-031` → `MS-AC-004`；**目標**：共同興趣權重滿分只看興趣。
  - **前置**：雙方共同興趣權重皆為100。
  - **執行**：計算基準契合分量。
  - **斷言**：基準B只根據興趣I；生活型態L不影響基準。

- [ ] **MS-IT-032** — `PersistMatchingState_MSBDD032_PersistsCorrectly`（critical）
  - **來源**：`MS-BDD-032` → `MS-AC-004`；**目標**：所有分量最後才四捨五入。
  - **前置**：輸入包含非整數地區指數與雙向平均。
  - **執行**：計算總契合分數。
  - **斷言**：僅最後一次四捨五入且限制0至100；雙方交換順序仍同分。

- [ ] **MS-IT-033** — `PersistMatchingState_MSBDD033_PersistsCorrectly`（critical）
  - **來源**：`MS-BDD-033` → `MS-AC-006`；**目標**：恰好72小時邀請已過期。
  - **前置**：邀請有效時間設定72小時。
  - **執行**：在建立後恰好72小時提交接受。
  - **斷言**：拒絕接受並標記expired；沒有round或占用。

- [ ] **MS-IT-034** — `PersistMatchingState_MSBDD034_PersistsCorrectly`（critical）
  - **來源**：`MS-BDD-034` → `MS-AC-002`；**目標**：單向性向相容不能配對。
  - **前置**：A願意認識B但B的性向不包含A性別。
  - **執行**：A搜尋或發邀請。
  - **斷言**：B不在A候選且邀請拒絕；不能洩漏B的具體性向。

- [ ] **MS-IT-035** — `PersistMatchingState_MSBDD035_PersistsCorrectly`（critical）
  - **來源**：`MS-BDD-035` → `MS-AC-002`；**目標**：個人資料不就緒不能探索。
  - **前置**：A的性別或性向未完成儲存。
  - **執行**：A搜尋候選。
  - **斷言**：得到PROFILE_NOT_READY；不把未填性向當作接受所有人。

- [ ] **MS-IT-036** — `PersistMatchingState_MSBDD036_PersistsCorrectly`（critical）
  - **來源**：`MS-BDD-036` → `MS-AC-009`；**目標**：正在遊戲的人不得再次被探索。
  - **前置**：A與B已有active遊戲而C欲搜尋A。
  - **執行**：C搜尋候選並嘗試舊ID邀請。
  - **斷言**：A不在清單且舊ID送邀失敗；不產生第二個pending或round。

- [ ] **MS-IT-037** — `PersistMatchingState_MSBDD037_PersistsCorrectly`（critical）
  - **來源**：`MS-BDD-037` → `MS-AC-008`；**目標**：被婉拒的pair反向也不能再邀。
  - **前置**：B已拒絕A且留下declined歷史。
  - **執行**：B反過來搜尋並邀請A。
  - **斷言**：A不在B候選且送邀被拒；回覆不得洩漏敏感拒絕理由。

- [ ] **MS-IT-038** — `PersistMatchingState_MSBDD038_PersistsCorrectly`（critical）
  - **來源**：`MS-BDD-038` → `MS-AC-010`；**目標**：曾結束遊戲不能重新配對。
  - **前置**：A與B有ended round歷史。
  - **執行**：A或B搜尋對方或直接提交ID。
  - **斷言**：原 accountId pair 彼此不再是候選且不能送邀；即使空閒、重登或修改資料也不能再互配；不跨新註冊 accountId 追查真人（RQ-01=A）。

- [ ] **MS-IT-039** — `PersistMatchingState_MSBDD039_PersistsCorrectly`（critical）
  - **來源**：`MS-BDD-039` → `MS-AC-009`；**目標**：開始遊戲時第三方邀請失效。
  - **前置**：A有B與C兩筆pending且接受B。
  - **執行**：B接受使A與B開始active。
  - **斷言**：A與C的pending成為invalidated；C之後可重新邀A而非永久拒絕。

- [ ] **MS-IT-040** — `PersistMatchingState_MSBDD040_PersistsCorrectly`（critical）
  - **來源**：`MS-BDD-040` → `MS-AC-011`；**目標**：不同pair共用一人同時接受只准一場。
  - **前置**：B與C同時要和A建立遊戲。
  - **執行**：B與C的接受交易競爭。
  - **斷言**：恰好一場active成功；另一筆回衝突且A只存一筆active participant。

- [ ] **MS-IT-041** — `PersistMatchingState_MSBDD041_PersistsCorrectly`（critical）
  - **來源**：`MS-BDD-041` → `MS-AC-011`；**目標**：同一對雙向競爭不建立兩個房間。
  - **前置**：A與B幾乎同時互相發起。
  - **執行**：兩個請求同時提交。
  - **斷言**：同pair只有一個有效邀請或輪次；不會有兩個roundId。

- [ ] **MS-IT-042** — `PersistMatchingState_MSBDD042_PersistsCorrectly`（critical）
  - **來源**：`MS-BDD-042` → `MS-AC-011`；**目標**：冪等鍵重送不增加邀請。
  - **前置**：A以同一clientRequestId向B送兩次。
  - **執行**：重送完全相同請求。
  - **斷言**：回同一邀請結果；資料庫不增加重複資料。

- [ ] **MS-IT-043** — `AcceptExistingInvitation_OrientationChanged_UsesOriginalEligibility`（critical）
  - **來源**：`MS-BDD-043` → `MS-AC-012`；**目標**：建立邀請後改性向不應撤銷原pending。
  - **前置**：建立時雙向相容、邀請未過期，之後改性向但帳號、成年、化身有效且無遊戲占用。
  - **執行**：於真D1接受原邀請並以最新條件嘗試新配對。
  - **斷言**：原邀請accepted＋唯一game_rounds與兩筆game_round_participants，新邀請才適用最新性向，不產生eligibility_changed。

- [ ] **MS-IT-044** — `PersistMatchingState_MSBDD044_PersistsCorrectly`（critical）
  - **來源**：`MS-BDD-044` → `MS-AC-012`；**目標**：已撤銷Session不能接受。
  - **前置**：B登入Session已被撤銷。
  - **執行**：B提交邀請接受。
  - **斷言**：拒絕該請求；不產生round或participants。

- [ ] **MS-IT-045** — `PersistMatchingState_MSBDD045_PersistsCorrectly`（critical）
  - **來源**：`MS-BDD-045` → `MS-AC-007`；**目標**：D1中途失敗全部回滾。
  - **前置**：接受過程注入插入第二筆participant失敗。
  - **執行**：接收者提交接受。
  - **斷言**：邀請仍pending且round與participants皆未建立；其他pending也不可被部分失效。

- [ ] **MS-IT-046** — `PersistMatchingState_MSBDD046_PersistsCorrectly`（critical）
  - **來源**：`MS-BDD-046` → `MS-AC-012`；**目標**：猜邀請或輪次ID不能越權。
  - **前置**：C並非A與B邀請或round成員。
  - **執行**：C對該ID送讀取或操作。
  - **斷言**：回資源不可存取錯誤；回覆不包含任何私有角色資料。

- [ ] **MS-IT-047** — `PersistMatchingState_MSBDD047_PersistsCorrectly`（normal）
  - **來源**：`MS-BDD-047` → `MS-AC-012`；**目標**：邀請超過速率限制遭拒。
  - **前置**：A在一小時內已達正式邀請速率上限。
  - **執行**：A再次發送邀請。
  - **斷言**：得到RATE_LIMITED；不新增pending。

- [ ] **MS-IT-048** — `PersistMatchingState_MSBDD048_PersistsCorrectly`（normal）
  - **來源**：`MS-BDD-048` → `MS-AC-012`；**目標**：嚴格JSON拒絕未知或重複鍵。
  - **前置**：A已登入但提交未知欄位或重複clientRequestId鍵。
  - **執行**：A發送邀請。
  - **斷言**：得到INVALID_MATCH_REQUEST；不新增資料。


### 2026-11-05 [補強] Integration 稽核新增測試（8 項）

**狀態**：未開始，已確認 RiskAudit RQ-01=A、RQ-02=A。

- [ ] **MS-IT-049** — `AcceptCrossPairs_SameAccount_EnforcesUniqueParticipant`（RiskAudit `MS-GAP-13`）
  - **追溯**：`MS-BDD-040` → `MS-AC-011`；完整需求見 RiskAudit §三。
  - **前置／操作**：以 §6.2／BDD-040 情境配置必要的雙人／三人帳號、本人登入及資料狀態；執行 `AcceptCrossPairs_SameAccount_EnforcesUniqueParticipant`。
  - **斷言**：A不得同時開兩輪；其中一批完整回滾；實際落地與安全性均符合 SDD，無假成功或額外副作用。

- [ ] **MS-IT-050** — `AcceptInvitation_SecondParticipantFails_RollsBackWholeBatch`（RiskAudit `MS-GAP-14`）
  - **追溯**：`MS-BDD-045` → `MS-AC-007`；完整需求見 RiskAudit §三。
  - **前置／操作**：以 §6.3／BDD-045 情境配置必要的雙人／三人帳號、本人登入及資料狀態；執行 `AcceptInvitation_SecondParticipantFails_RollsBackWholeBatch`。
  - **斷言**：不殘留第一筆participant或round；實際落地與安全性均符合 SDD，無假成功或額外副作用。

- [ ] **MS-IT-051** — `AcceptInvitation_ZeroConditionalChanges_DoesNotCommitPartialState`（RiskAudit `MS-GAP-15`）
  - **追溯**：`MS-BDD-045`、`MS-BDD-074` → `MS-AC-012`；完整需求見 RiskAudit §三。
  - **前置／操作**：以 §6.3／BDD-045、074 情境配置必要的雙人／三人帳號、本人登入及資料狀態；執行 `AcceptInvitation_ZeroConditionalChanges_DoesNotCommitPartialState`。
  - **斷言**：不將0列UPDATE當成功；實際落地與安全性均符合 SDD，無假成功或額外副作用。

- [ ] **MS-IT-052** — `AcceptInvitation_OtherPending_InvalidateBothDirections`（RiskAudit `MS-GAP-16`）
  - **追溯**：`MS-BDD-039` → `MS-AC-009`；完整需求見 RiskAudit §三。
  - **前置／操作**：以 §6.3／BDD-039 情境配置必要的雙人／三人帳號、本人登入及資料狀態；執行 `AcceptInvitation_OtherPending_InvalidateBothDirections`。
  - **斷言**：同批失效兩人所有其他邀請，不永久排除第三人；實際落地與安全性均符合 SDD，無假成功或額外副作用。

- [ ] **MS-IT-053** — `EndRound_ReleaseTwoParticipants_StoresEndedHistoryAtomically`（RiskAudit `MS-GAP-17`）
  - **追溯**：`MS-BDD-012` → `MS-AC-010`；完整需求見 RiskAudit §三。
  - **前置／操作**：以 §6.2／BDD-012 情境配置必要的雙人／三人帳號、本人登入及資料狀態；執行 `EndRound_ReleaseTwoParticipants_StoresEndedHistoryAtomically`。
  - **斷言**：兩筆game_round_participants均釋放且仍永久互斥該pair；實際落地與安全性均符合 SDD，無假成功或額外副作用。

- [ ] **MS-IT-054** — `SearchCandidate_DeclinedOrEndedPair_RejectsBothDirections`（RiskAudit `MS-GAP-18`）
  - **追溯**：`MS-BDD-037` → `MS-AC-008`、`MS-AC-010`；完整需求見 RiskAudit §三。
  - **前置／操作**：以 §6.2／BDD-037,038 情境配置必要的雙人／三人帳號、本人登入及資料狀態；執行 `SearchCandidate_DeclinedOrEndedPair_RejectsBothDirections`。
  - **斷言**：換發起方向仍不得再配；實際落地與安全性均符合 SDD，無假成功或額外副作用。

- [ ] **MS-IT-055** — `CreateInvitation_ExpiredPending_ReleasesPairUniqueAtomically`（RiskAudit `MS-GAP-21`）
  - **追溯**：`MS-BDD-042` → `MS-AC-011`；完整需求見 RiskAudit §三。
  - **前置／操作**：以 §4.1／BDD-042 情境配置必要的雙人／三人帳號、本人登入及資料狀態；執行 `CreateInvitation_ExpiredPending_ReleasesPairUniqueAtomically`。
  - **斷言**：72h跨界與同pair pending UNIQUE；實際落地與安全性均符合 SDD，無假成功或額外副作用。

- [ ] **MS-IT-056** — `InvalidateInvitation_DifferentReasons_PersistsSafeReason`（RiskAudit `MS-GAP-22`）
  - **追溯**：`MS-BDD-057` → `MS-AC-009`、`MS-AC-012`；完整需求見 RiskAudit §三。
  - **前置／操作**：以 §3／BDD-057 情境配置必要的雙人／三人帳號、本人登入及資料狀態；執行 `InvalidateInvitation_DifferentReasons_PersistsSafeReason`。
  - **斷言**：區分 other_round_started／eligibility_changed；性向／偏好變動不屬eligibility_changed；兩種失效原因只在 invalidated 有值，其他狀態 NULL；重登後安全文案各不同且不得揭露另一對象；實際落地與安全性均符合 SDD，無假成功或額外副作用。

### 2026-11-06 [補強] IT 新增測試（8項）

- [ ] **MS-IT-057** — `ProfileProjection_ReadyOnlyPersist`（critical）
  - **來源**：`MS-BDD-064` → `MS-AC-005`；**目標**：新版設計規劃補強。
  - **前置／操作**：配置BDD-064描述的真實帳號及條件後執行 ProfileProjection_ReadyOnlyPersist。
  - **斷言**：未完成資料仍保留user_profiles，合格才建立accountId唯一的match_conditions且不儲存source_profile_revision；僅配對相關條件改變時同步投影，無關照片排序或分享設定不觸發同步；須有真實測試證據，不能僅以 mock 驗SQL。

- [ ] **MS-IT-058** — `ProfileProjection_LossPreservesActiveGame`（critical）
  - **來源**：`MS-BDD-065` → `MS-AC-005`；**目標**：新版設計規劃補強。
  - **前置／操作**：配置BDD-065描述的真實帳號及條件後執行 ProfileProjection_LossPreservesActiveGame。
  - **斷言**：資料不合格時原子移除投影，但game_rounds及參與者不提前結束；須有真實測試證據，不能僅以 mock 驗SQL。

- [ ] **MS-IT-059** — `AcceptExistingPending_NoConditionRowStillValid`（critical）
  - **來源**：`MS-BDD-066` → `MS-AC-007`；**目標**：新版設計規劃補強。
  - **前置／操作**：配置BDD-066描述的真實帳號及條件後執行 AcceptExistingPending_NoConditionRowStillValid。
  - **斷言**：舊pending不因性向變更或match_conditions列被移除而失效；成年及化身仍須有效；須有真實測試證據，不能僅以 mock 驗SQL。

- [ ] **MS-IT-060** — `CrossPairAcceptance_AtomicUniqueConstraint`（critical）
  - **來源**：`MS-BDD-070` → `MS-AC-011`；**目標**：新版設計規劃補強。
  - **前置／操作**：配置BDD-070描述的真實帳號及條件後執行 CrossPairAcceptance_AtomicUniqueConstraint。
  - **斷言**：game_round_participants.account_id UNIQUE及真D1並行失敗回滾；須有真實測試證據，不能僅以 mock 驗SQL。

- [ ] **MS-IT-061** — `EndedRound_NoProfileConditionDoesNotShow`（critical）
  - **來源**：`MS-BDD-071` → `MS-AC-010`；**目標**：新版設計規劃補強。
  - **前置／操作**：配置BDD-071描述的真實帳號及條件後執行 EndedRound_NoProfileConditionDoesNotShow。
  - **斷言**：遊戲結束只釋放占用，不會替不合格玩家重建投影；須有真實測試證據，不能僅以 mock 驗SQL。

- [ ] **MS-IT-062** — `ResetPolicy_NonProductionOnly_NoETL`（critical）
  - **來源**：`MS-BDD-073` → `MS-AC-012`；**目標**：新版設計規劃補強。
  - **前置／操作**：配置BDD-073描述的真實帳號及條件後執行 ResetPolicy_NonProductionOnly_NoETL。
  - **斷言**：指定非正式環境重建四表、R2測資一致，不轉換舊資料不清正式資料；須有真實測試證據，不能僅以 mock 驗SQL。

- [ ] **MS-IT-063** — `ProjectionChange_ZeroChangesFailClosed`（critical）
  - **來源**：`MS-BDD-074` → `MS-AC-012`；**目標**：新版設計規劃補強。
  - **前置／操作**：配置BDD-074描述的真實帳號及條件後執行 ProjectionChange_ZeroChangesFailClosed。
  - **斷言**：真D1配對相關更新及投影同步失敗時不可部分提交或保留錯誤的舊條件；無關個資更新不應觸發投影指令；須有真實測試證據，不能僅以 mock 驗SQL。

- [ ] **MS-IT-064** — `PhotoReorder_RevisionChange_KeepsConditionUnchanged`（critical）
  - **來源**：`MS-BDD-075` → `MS-AC-005`、`MS-AC-012`；**目標**：真 D1 驗證不必要的投影同步完全省略。
  - **前置**：真人帳號已建立合格 match_conditions，記錄原本投影內容與 updated_at。
  - **執行**：在真 Miniflare D1 只更新真人照片排序／分享設定，確認 user_profiles.revision 依原設計增加。
  - **斷言**：match_conditions 無 UPDATE／DELETE、內容及 updated_at 不變，候選搜尋仍顯示本人；不得依 revision 不相同排除。
## 3️⃣ API 端點測試

**建議測試位置**：`backend/tests/DatingHigh.Api.Tests/MatchingSessionsApiTests.cs；tests/integration/matching-sessions-api.test.mjs`。實際登入／Session、JSON、HTTP 狀態碼、權限、no-store、冪等及資料不外洩。

- [ ] **MS-API-001** — `CallMatchingApi_MSBDD034_RejectsOrReturnsExpectedStatus`（critical）
  - **來源**：`MS-BDD-034` → `MS-AC-002`；**目標**：單向性向相容不能配對。
  - **前置**：A願意認識B但B的性向不包含A性別。
  - **執行**：A搜尋或發邀請。
  - **斷言**：B不在A候選且邀請拒絕；不能洩漏B的具體性向。

- [ ] **MS-API-002** — `CallMatchingApi_MSBDD035_RejectsOrReturnsExpectedStatus`（critical）
  - **來源**：`MS-BDD-035` → `MS-AC-002`；**目標**：個人資料不就緒不能探索。
  - **前置**：A的性別或性向未完成儲存。
  - **執行**：A搜尋候選。
  - **斷言**：得到PROFILE_NOT_READY；不把未填性向當作接受所有人。

- [ ] **MS-API-003** — `CallMatchingApi_MSBDD036_RejectsOrReturnsExpectedStatus`（critical）
  - **來源**：`MS-BDD-036` → `MS-AC-009`；**目標**：正在遊戲的人不得再次被探索。
  - **前置**：A與B已有active遊戲而C欲搜尋A。
  - **執行**：C搜尋候選並嘗試舊ID邀請。
  - **斷言**：A不在清單且舊ID送邀失敗；不產生第二個pending或round。

- [ ] **MS-API-004** — `CallMatchingApi_MSBDD037_RejectsOrReturnsExpectedStatus`（critical）
  - **來源**：`MS-BDD-037` → `MS-AC-008`；**目標**：被婉拒的pair反向也不能再邀。
  - **前置**：B已拒絕A且留下declined歷史。
  - **執行**：B反過來搜尋並邀請A。
  - **斷言**：A不在B候選且送邀被拒；回覆不得洩漏敏感拒絕理由。

- [ ] **MS-API-005** — `CallMatchingApi_MSBDD038_RejectsOrReturnsExpectedStatus`（critical）
  - **來源**：`MS-BDD-038` → `MS-AC-010`；**目標**：曾結束遊戲不能重新配對。
  - **前置**：A與B有ended round歷史。
  - **執行**：A或B搜尋對方或直接提交ID。
  - **斷言**：彼此不再是候選且不能送邀；即使兩人各自空閒也不能再互配。

- [ ] **MS-API-006** — `CallMatchingApi_MSBDD039_RejectsOrReturnsExpectedStatus`（critical）
  - **來源**：`MS-BDD-039` → `MS-AC-009`；**目標**：開始遊戲時第三方邀請失效。
  - **前置**：A有B與C兩筆pending且接受B。
  - **執行**：B接受使A與B開始active。
  - **斷言**：A與C的pending成為invalidated；C之後可重新邀A而非永久拒絕。

- [ ] **MS-API-007** — `CallMatchingApi_MSBDD040_RejectsOrReturnsExpectedStatus`（critical）
  - **來源**：`MS-BDD-040` → `MS-AC-011`；**目標**：不同pair共用一人同時接受只准一場。
  - **前置**：B與C同時要和A建立遊戲。
  - **執行**：B與C的接受交易競爭。
  - **斷言**：恰好一場active成功；另一筆回衝突且A只存一筆active participant。

- [ ] **MS-API-008** — `CallMatchingApi_MSBDD041_RejectsOrReturnsExpectedStatus`（critical）
  - **來源**：`MS-BDD-041` → `MS-AC-011`；**目標**：同一對雙向競爭不建立兩個房間。
  - **前置**：A與B幾乎同時互相發起。
  - **執行**：兩個請求同時提交。
  - **斷言**：同pair只有一個有效邀請或輪次；不會有兩個roundId。

- [ ] **MS-API-009** — `CallMatchingApi_MSBDD042_RejectsOrReturnsExpectedStatus`（critical）
  - **來源**：`MS-BDD-042` → `MS-AC-011`；**目標**：冪等鍵重送不增加邀請。
  - **前置**：A以同一clientRequestId向B送兩次。
  - **執行**：重送完全相同請求。
  - **斷言**：回同一邀請結果；資料庫不增加重複資料。

- [ ] **MS-API-010** — `AcceptInvitation_OrientationChanged_DoesNotInvalidatePriorPending`（critical）
  - **來源**：`MS-BDD-043` → `MS-AC-012`；**目標**：既有邀請保持原本成立時的雙向條件判定。
  - **前置**：發邀後修改性向導致目前不相容，但帳號成年、化身與原pending均有效。
  - **執行**：POST /match-invitations/{id}/accept。
  - **斷言**：200 accepted與同一個game_rounds.roundId；不得因性向異動回MATCH_ELIGIBILITY_CHANGED。

- [ ] **MS-API-011** — `CallMatchingApi_MSBDD044_RejectsOrReturnsExpectedStatus`（critical）
  - **來源**：`MS-BDD-044` → `MS-AC-012`；**目標**：已撤銷Session不能接受。
  - **前置**：B登入Session已被撤銷。
  - **執行**：B提交邀請接受。
  - **斷言**：拒絕該請求；不產生round或participants。

- [ ] **MS-API-012** — `CallMatchingApi_MSBDD045_RejectsOrReturnsExpectedStatus`（critical）
  - **來源**：`MS-BDD-045` → `MS-AC-007`；**目標**：D1中途失敗全部回滾。
  - **前置**：接受過程注入插入第二筆participant失敗。
  - **執行**：接收者提交接受。
  - **斷言**：邀請仍pending且round與participants皆未建立；其他pending也不可被部分失效。

- [ ] **MS-API-013** — `CallMatchingApi_MSBDD046_RejectsOrReturnsExpectedStatus`（critical）
  - **來源**：`MS-BDD-046` → `MS-AC-012`；**目標**：猜邀請或輪次ID不能越權。
  - **前置**：C並非A與B邀請或round成員。
  - **執行**：C對該ID送讀取或操作。
  - **斷言**：回資源不可存取錯誤；回覆不包含任何私有角色資料。

- [ ] **MS-API-014** — `CallMatchingApi_MSBDD047_RejectsOrReturnsExpectedStatus`（normal）
  - **來源**：`MS-BDD-047` → `MS-AC-012`；**目標**：邀請超過速率限制遭拒。
  - **前置**：A在一小時內已達正式邀請速率上限。
  - **執行**：A再次發送邀請。
  - **斷言**：得到RATE_LIMITED；不新增pending。

- [ ] **MS-API-015** — `CallMatchingApi_MSBDD048_RejectsOrReturnsExpectedStatus`（normal）
  - **來源**：`MS-BDD-048` → `MS-AC-012`；**目標**：嚴格JSON拒絕未知或重複鍵。
  - **前置**：A已登入但提交未知欄位或重複clientRequestId鍵。
  - **執行**：A發送邀請。
  - **斷言**：得到INVALID_MATCH_REQUEST；不新增資料。


### 2026-11-05 [補強] API 稽核新增測試（12 項）

**狀態**：未開始，已確認 RiskAudit RQ-01=A、RQ-02=A。

- [ ] **MS-API-016** — `SearchCandidates_ValidReadyProfiles_ReturnsRankedCandidates`（RiskAudit `MS-GAP-01`）
  - **追溯**：`MS-BDD-001` → `MS-AC-005`、`MS-AC-001`；完整需求見 RiskAudit §三。
  - **前置／操作**：以 §7／BDD-001,061 情境配置必要的雙人／三人帳號、本人登入及資料狀態；執行 `SearchCandidates_ValidReadyProfiles_ReturnsRankedCandidates`。
  - **斷言**：搜尋200、分頁及同分排序；另驗分頁 0/1/20/21/5000 邊界與同分排序；實際落地與安全性均符合 SDD，無假成功或額外副作用。

- [ ] **MS-API-017** — `CreateInvitation_ValidRequest_Returns201Pending`（RiskAudit `MS-GAP-02`）
  - **追溯**：`MS-BDD-006` → `MS-AC-006`；完整需求見 RiskAudit §三。
  - **前置／操作**：以 §7／BDD-006 情境配置必要的雙人／三人帳號、本人登入及資料狀態；執行 `CreateInvitation_ValidRequest_Returns201Pending`。
  - **斷言**：建立201 pending及原子保留；實際落地與安全性均符合 SDD，無假成功或額外副作用。

- [ ] **MS-API-018** — `GetInvitations_AsParticipant_ReturnsSafeLists`（RiskAudit `MS-GAP-03`）
  - **追溯**：`MS-BDD-051` → `MS-AC-006`；完整需求見 RiskAudit §三。
  - **前置／操作**：以 §7／BDD-051 情境配置必要的雙人／三人帳號、本人登入及資料狀態；執行 `GetInvitations_AsParticipant_ReturnsSafeLists`。
  - **斷言**：incoming/outgoing合法且無私有欄位；實際落地與安全性均符合 SDD，無假成功或額外副作用。

- [ ] **MS-API-019** — `AcceptInvitation_ValidReceiver_ReturnsSameRoundId`（RiskAudit `MS-GAP-04`）
  - **追溯**：`MS-BDD-007` → `MS-AC-007`；完整需求見 RiskAudit §三。
  - **前置／操作**：以 §7／BDD-007 情境配置必要的雙人／三人帳號、本人登入及資料狀態；執行 `AcceptInvitation_ValidReceiver_ReturnsSameRoundId`。
  - **斷言**：接受200、兩端同輪；實際落地與安全性均符合 SDD，無假成功或額外副作用。

- [ ] **MS-API-020** — `DeclineInvitation_ValidReceiver_PermanentlyExcludesPair`（RiskAudit `MS-GAP-05`）
  - **追溯**：`MS-BDD-009` → `MS-AC-008`；完整需求見 RiskAudit §三。
  - **前置／操作**：以 §7／BDD-009 情境配置必要的雙人／三人帳號、本人登入及資料狀態；執行 `DeclineInvitation_ValidReceiver_PermanentlyExcludesPair`。
  - **斷言**：婉拒後雙向封鎖；實際落地與安全性均符合 SDD，無假成功或額外副作用。

- [ ] **MS-API-021** — `CancelInvitation_AsInitiator_LeavesPairEligible`（RiskAudit `MS-GAP-06`）
  - **追溯**：`MS-BDD-010` → `MS-AC-006`；完整需求見 RiskAudit §三。
  - **前置／操作**：以 §7／BDD-010 情境配置必要的雙人／三人帳號、本人登入及資料狀態；執行 `CancelInvitation_AsInitiator_LeavesPairEligible`。
  - **斷言**：自己取消不封鎖；實際落地與安全性均符合 SDD，無假成功或額外副作用。

- [ ] **MS-API-022** — `GetRounds_AsParticipant_ReturnsAtMostOneActive`（RiskAudit `MS-GAP-07`）
  - **追溯**：`MS-BDD-055` → `MS-AC-007`；完整需求見 RiskAudit §三。
  - **前置／操作**：以 §7／BDD-055 情境配置必要的雙人／三人帳號、本人登入及資料狀態；執行 `GetRounds_AsParticipant_ReturnsAtMostOneActive`。
  - **斷言**：本人一場，非本人無權；實際落地與安全性均符合 SDD，無假成功或額外副作用。

- [ ] **MS-API-023** — `GetRound_ById_AsParticipant_ReturnsSafeContext`（RiskAudit `MS-GAP-08`）
  - **追溯**：`MS-BDD-055` → `MS-AC-007`；完整需求見 RiskAudit §三。
  - **前置／操作**：以 §7／BDD-055 情境配置必要的雙人／三人帳號、本人登入及資料狀態；執行 `GetRound_ById_AsParticipant_ReturnsSafeContext`。
  - **斷言**：active及權限保護；實際落地與安全性均符合 SDD，無假成功或額外副作用。

- [ ] **MS-API-024** — `SearchCandidates_Unauthenticated_Returns401`（RiskAudit `MS-GAP-09`）
  - **追溯**：`MS-BDD-034` → `MS-AC-002`；完整需求見 RiskAudit §三。
  - **前置／操作**：以 §7／BDD-034 情境配置必要的雙人／三人帳號、本人登入及資料狀態；執行 `SearchCandidates_Unauthenticated_Returns401`。
  - **斷言**：登入防護與no-store；實際落地與安全性均符合 SDD，無假成功或額外副作用。

- [ ] **MS-API-025** — `GetInvitations_NonOwner_DoesNotLeak`（RiskAudit `MS-GAP-10`）
  - **追溯**：`MS-BDD-046` → `MS-AC-012`；完整需求見 RiskAudit §三。
  - **前置／操作**：以 §7／BDD-046 情境配置必要的雙人／三人帳號、本人登入及資料狀態；執行 `GetInvitations_NonOwner_DoesNotLeak`。
  - **斷言**：猜對方記錄不外洩；實際落地與安全性均符合 SDD，無假成功或額外副作用。

- [ ] **MS-API-026** — `GetRound_NonParticipant_ReturnsSafeFailure`（RiskAudit `MS-GAP-11`）
  - **追溯**：`MS-BDD-046` → `MS-AC-012`；完整需求見 RiskAudit §三。
  - **前置／操作**：以 §7／BDD-046 情境配置必要的雙人／三人帳號、本人登入及資料狀態；執行 `GetRound_NonParticipant_ReturnsSafeFailure`。
  - **斷言**：猜roundId不得取得資料；實際落地與安全性均符合 SDD，無假成功或額外副作用。

- [ ] **MS-API-027** — `CreateInvitation_WhenParticipantActive_Returns409`（RiskAudit `MS-GAP-12`）
  - **追溯**：`MS-BDD-036` → `MS-AC-009`；完整需求見 RiskAudit §三。
  - **前置／操作**：以 §7／BDD-036 情境配置必要的雙人／三人帳號、本人登入及資料狀態；執行 `CreateInvitation_WhenParticipantActive_Returns409`。
  - **斷言**：活躍遊戲期間不產生pending；實際落地與安全性均符合 SDD，無假成功或額外副作用。

### 2026-11-06 [補強] API 新增測試（4項）

- [ ] **MS-API-028** — `NewInvitation_UsesLatestOrientation`（critical）
  - **來源**：`MS-BDD-067` → `MS-AC-002`；**目標**：新版設計規劃補強。
  - **前置／操作**：配置BDD-067描述的真實帳號及條件後執行 NewInvitation_UsesLatestOrientation。
  - **斷言**：新搜尋與新邀請使用最新條件，原pending不改；須有真實測試證據，不能僅以 mock 驗SQL。

- [ ] **MS-API-029** — `GetCandidatePersona_AsAuthorizedUser`（critical）
  - **來源**：`MS-BDD-069` → `MS-AC-001`；**目標**：新版設計規劃補強。
  - **前置／操作**：配置BDD-069描述的真實帳號及條件後執行 GetCandidatePersona_AsAuthorizedUser。
  - **斷言**：先完整計分排序再分頁；GET單筆安全人物卡、禁止透露私有資料；須有真實測試證據，不能僅以 mock 驗SQL。

- [ ] **MS-API-030** — `FreshTestDb_OnlyConfirmedTarget`（critical）
  - **來源**：`MS-BDD-073` → `MS-AC-012`；**目標**：新版設計規劃補強。
  - **前置／操作**：配置BDD-073描述的真實帳號及條件後執行 FreshTestDb_OnlyConfirmedTarget。
  - **斷言**：指定非正式環境重建四表、R2測資一致，不轉換舊資料不清正式資料；須有真實測試證據，不能僅以 mock 驗SQL。

- [ ] **MS-API-031** — `ProfileProjectionFailure_AtomicRollback`（critical）
  - **來源**：`MS-BDD-074` → `MS-AC-012`；**目標**：新版設計規劃補強。
  - **前置／操作**：配置BDD-074描述的真實帳號及條件後執行 ProfileProjectionFailure_AtomicRollback。
  - **斷言**：真D1配對相關更新及投影同步失敗時不可部分提交或保留錯誤的舊條件；無關個資更新不應觸發投影指令；須有真實測試證據，不能僅以 mock 驗SQL。

## 4️⃣ E2E（Web／Android）

**建議測試位置**：`tests/e2e/web/matching-sessions.spec.ts；tests/e2e/android/matching-sessions.mjs`。Web 與 Android 需各自有真觀察結果；至少三個隔離帳號；不得以模擬帳號陣列或 HTTP 假成功替代。

- [ ] **MS-ET-001** — `RenderMatchingUI_MSBDD049_ShowsExpectedOutcome`（normal）
  - **來源**：`MS-BDD-049` → `MS-AC-005`；**目標**：配對頁初始載入顯示安全候選卡。
  - **前置**：A有效登入、資料就緒且存在可配對B。
  - **執行**：A開啟候選頁。
  - **斷言**：顯示B化身暱稱與契合分數；不顯示照片與完整本人名片。

- [ ] **MS-ET-002** — `RenderMatchingUI_MSBDD050_ShowsExpectedOutcome`（normal）
  - **來源**：`MS-BDD-050` → `MS-AC-005`；**目標**：沒有對象時呈現空狀態。
  - **前置**：A目前沒有適格候選。
  - **執行**：A開啟候選頁。
  - **斷言**：顯示目前沒有可配對的對象；不插入任何固定測試角色。

- [ ] **MS-ET-003** — `RenderMatchingUI_MSBDD051_ShowsExpectedOutcome`（critical）
  - **來源**：`MS-BDD-051` → `MS-AC-006`；**目標**：發起邀請後顯示等待。
  - **前置**：A的候選清單已載入且B可配。
  - **執行**：A點想認識。
  - **斷言**：B卡片顯示等待回覆；不直接開啟雙人房間。

- [ ] **MS-ET-004** — `RenderMatchingUI_MSBDD052_ShowsExpectedOutcome`（critical）
  - **來源**：`MS-BDD-052` → `MS-AC-008`；**目標**：婉拒前先明示永遠不再配對。
  - **前置**：B收到A的pending邀請。
  - **執行**：B點婉拒。
  - **斷言**：顯示婉拒後你們將無法再次互相配對；只有B確認後才送出decline。

- [ ] **MS-ET-005** — `RenderMatchingUI_MSBDD053_ShowsExpectedOutcome`（normal）
  - **來源**：`MS-BDD-053` → `MS-AC-006`；**目標**：取消邀請顯示非永久拒絕。
  - **前置**：A正在檢視自己送出的pending邀請。
  - **執行**：A按取消邀請。
  - **斷言**：顯示已取消並更新列表；不顯示永久封鎖文案。

- [ ] **MS-ET-006** — `RenderMatchingUI_MSBDD054_ShowsExpectedOutcome`（normal）
  - **來源**：`MS-BDD-054` → `MS-AC-006`；**目標**：逾期邀請顯示已逾期。
  - **前置**：B開啟已到期的邀請詳情。
  - **執行**：B重新載入狀態。
  - **斷言**：顯示已逾期且接受鈕不可用；不進入遊戲。

- [ ] **MS-ET-007** — `RenderMatchingUI_MSBDD055_ShowsExpectedOutcome`（critical）
  - **來源**：`MS-BDD-055` → `MS-AC-007`；**目標**：接受成功兩端導向同一場遊戲。
  - **前置**：A與B已互相確認。
  - **執行**：A與B各自開啟輪次入口。
  - **斷言**：兩端都顯示同一roundId專屬房間；沒有偽造劇情或假訊息。

- [ ] **MS-ET-008** — `RenderMatchingUI_MSBDD056_ShowsExpectedOutcome`（critical）
  - **來源**：`MS-BDD-056` → `MS-AC-009`；**目標**：遊戲中配對入口被阻擋。
  - **前置**：A已有active遊戲。
  - **執行**：A點配對入口。
  - **斷言**：顯示遊戲進行中結束後才能重新配對；可返回目前那場遊戲。

- [ ] **MS-ET-009** — `RenderMatchingUI_MSBDD057_ShowsExpectedOutcome`（normal）
  - **來源**：`MS-BDD-057` → `MS-AC-009`；**目標**：第三方收到的邀請會顯示失效。
  - **前置**：C原本邀請A而A已和B開始遊戲。
  - **執行**：C開啟邀請列表。
  - **斷言**：C對A的邀請標成因其他遊戲開始而失效；不顯示婉拒或永久互斥。

- [ ] **MS-ET-010** — `RenderMatchingUI_MSBDD058_ShowsExpectedOutcome`（normal）
  - **來源**：`MS-BDD-058` → `MS-AC-013`；**目標**：切換裝置後恢復真配對狀態。
  - **前置**：A已發pending或已有active round。
  - **執行**：A在另一裝置有效登入並重載。
  - **斷言**：讀出持久化真狀態；不以本機記憶陣列假冒已接受。

- [ ] **MS-ET-011** — `RenderMatchingUI_MSBDD059_ShowsExpectedOutcome`（normal）
  - **來源**：`MS-BDD-059` → `MS-AC-013`；**目標**：網路中斷時不假裝邀請成功。
  - **前置**：A按想認識後網路失去回覆。
  - **執行**：A檢視結果並重試進入列表。
  - **斷言**：顯示狀態不明請重新整理；先唯讀回查不盲目創第二筆。

- [ ] **MS-ET-012** — `RenderMatchingUI_MSBDD060_ShowsExpectedOutcome`（normal）
  - **來源**：`MS-BDD-060` → `MS-AC-011`；**目標**：連點邀請按鈕不得重複發送。
  - **前置**：A看到B候選且尚無pending。
  - **執行**：A連續快速點想認識。
  - **斷言**：按鈕載入中禁用；server最終只有一筆有效邀請。

- [ ] **MS-ET-013** — `RenderMatchingUI_MSBDD061_ShowsExpectedOutcome`（normal）
  - **來源**：`MS-BDD-061` → `MS-AC-001`；**目標**：分頁及同分排序穩定。
  - **前置**：A可探索超過20名候選且含同分者。
  - **執行**：A翻下一頁。
  - **斷言**：顯示分頁與固定同分順序；不顯示他人隱藏偏好分量。

- [ ] **MS-ET-014** — `RenderMatchingUI_MSBDD062_ShowsExpectedOutcome`（critical）
  - **來源**：`MS-BDD-062` → `MS-AC-014`；**目標**：配對成功仍不可直接看真人照。
  - **前置**：A與B已同意配對但未同意交換名片。
  - **執行**：A點進B人物資訊。
  - **斷言**：只顯示安全角色內容；不可取得私人R2照片或職業欄位。

- [ ] **MS-ET-015** — `RenderMatchingUI_MSBDD063_ShowsExpectedOutcome`（normal）
  - **來源**：`MS-BDD-063` → `MS-AC-002`；**目標**：資料尚未完成提供返回設定入口。
  - **前置**：A缺性別或未儲存性向。
  - **執行**：A開啟配對探索。
  - **斷言**：顯示請先完成個人資料；提供返回設定入口且不顯示其他人的資料。

### 2026-11-05 [補強] E2E 稽核新增測試（2 項）

**狀態**：未開始，已確認 RiskAudit RQ-01=A、RQ-02=A。

- [ ] **MS-ET-016** — `DeclineDialog_Cancelled_DoesNotPermanentlyExclude`（RiskAudit `MS-GAP-23`）
  - **追溯**：`MS-BDD-052` → `MS-AC-008`；完整需求見 RiskAudit §三。
  - **前置／操作**：以 §8／BDD-052 情境配置必要的雙人／三人帳號、本人登入及資料狀態；執行 `DeclineDialog_Cancelled_DoesNotPermanentlyExclude`。
  - **斷言**：永久拒絕確認視窗按取消後不落地；實際落地與安全性均符合 SDD，無假成功或額外副作用。

- [ ] **MS-ET-017** — `AfterEnding_ReloadCandidates_ExcludesOldPairAndAllowsNewPair`（RiskAudit `MS-GAP-24`）
  - **追溯**：`MS-BDD-012` → `MS-AC-010`；完整需求見 RiskAudit §三。
  - **前置／操作**：以 §5／BDD-012 情境配置必要的雙人／三人帳號、本人登入及資料狀態；執行 `AfterEnding_ReloadCandidates_ExcludesOldPairAndAllowsNewPair`。
  - **斷言**：下游退出完成後才驗真Web／Android端到端；未實作不得先通過；完整退出 Web／Android E2E 需等待後續 StoryDialogueAndExit 串接，不得先勾選；實際落地與安全性均符合 SDD，無假成功或額外副作用。

### 2026-11-06 [補強] ET 新增測試（2項）

- [ ] **MS-ET-018** — `LoginFlow_ThreeStatesAndUnavailable`（critical）
  - **來源**：`MS-BDD-068` → `MS-AC-005`；**目標**：新版設計規劃補強。
  - **前置／操作**：配置BDD-068描述的真實帳號及條件後執行 LoginFlow_ThreeStatesAndUnavailable。
  - **斷言**：初次登入未完成導向Profile、有遊戲導向遊戲、就緒導向探索，API未知安全重試；須有真實測試證據，不能僅以 mock 驗SQL。

- [ ] **MS-ET-019** — `PendingUI_IncomingVsOutgoing`（critical）
  - **來源**：`MS-BDD-072` → `MS-AC-006`；**目標**：新版設計規劃補強。
  - **前置／操作**：配置BDD-072描述的真實帳號及條件後執行 PendingUI_IncomingVsOutgoing。
  - **斷言**：incoming可接受、outgoing等待不重送，不能全量排除pending；須有真實測試證據，不能僅以 mock 驗SQL。

## 測試清單使用說明

1. 每一項先以失敗測試證明功能尚未滿足（Red），再最小實作（Green），最後重構；同一測試不可因名稱吻合而記完成。
2. D1 確認 migration 四表、永久拒絕／ended 保留、`UNIQUE(account_id)`、accept＋兩 participants＋其他待決邀請失效，以及 round end＋participant 釋放均為**真資料庫原子行為**。
3. API 必須逐端點驗成功、400／401／403／409／410／429／503及必要的冪等；前端 Web／Android 分別實測空狀態、Loading、雙方同意、單場限制、明確婉拒與私人名片保護。
4. 遊戲結束的可觸發產品流程由 `StoryDialogueAndExit` 實作；本份先以受控整合檢查終止契約與持久資料，不宣稱已存在完整退出畫面。
5. 使用者已確認 RQ-01=A、RQ-02=A；保留原126項編號並追加24項獨立 ID。全部仍未實作，不得自動勾選。

## 需求追溯

| SPEC AC | BDD Scenario | 對應 TDD |
|---|---|---|
| `MS-AC-001` | `MS-BDD-002`、`MS-BDD-061`、`MS-BDD-069` | `MS-UT-002`、`MS-UT-046`、`MS-IT-002`、`MS-ET-013`、`MS-API-016`、`MS-UT-056`、`MS-API-029` |
| `MS-AC-002` | `MS-BDD-005`、`MS-BDD-022`、`MS-BDD-034`、`MS-BDD-035`、`MS-BDD-063`、`MS-BDD-067` | `MS-UT-005`、`MS-UT-022`、`MS-UT-048`、`MS-IT-005`、`MS-IT-022`、`MS-IT-034`、`MS-IT-035`、`MS-API-001`、`MS-API-002`、`MS-ET-015`、`MS-API-024`、`MS-UT-054`、`MS-API-028` |
| `MS-AC-003` | `MS-BDD-003`、`MS-BDD-004`、`MS-BDD-016`、`MS-BDD-017`、`MS-BDD-023`、`MS-BDD-024`、`MS-BDD-025`、`MS-BDD-026`、`MS-BDD-027` | `MS-UT-003`、`MS-UT-004`、`MS-UT-016`、`MS-UT-017`、`MS-UT-023`、`MS-UT-024`、`MS-UT-025`、`MS-UT-026`、`MS-UT-027`、`MS-IT-003`、`MS-IT-004`、`MS-IT-016`、`MS-IT-017`、`MS-IT-023`、`MS-IT-024`、`MS-IT-025`、`MS-IT-026`、`MS-IT-027`、`MS-UT-049` |
| `MS-AC-004` | `MS-BDD-013`、`MS-BDD-014`、`MS-BDD-015`、`MS-BDD-018`、`MS-BDD-020`、`MS-BDD-028`、`MS-BDD-029`、`MS-BDD-030`、`MS-BDD-031`、`MS-BDD-032` | `MS-UT-013`、`MS-UT-014`、`MS-UT-015`、`MS-UT-018`、`MS-UT-020`、`MS-UT-028`、`MS-UT-029`、`MS-UT-030`、`MS-UT-031`、`MS-UT-032`、`MS-IT-013`、`MS-IT-014`、`MS-IT-015`、`MS-IT-018`、`MS-IT-020`、`MS-IT-028`、`MS-IT-029`、`MS-IT-030`、`MS-IT-031`、`MS-IT-032`、`MS-UT-050` |
| `MS-AC-005` | `MS-BDD-001`、`MS-BDD-049`、`MS-BDD-050`、`MS-BDD-064`、`MS-BDD-065`、`MS-BDD-068`、`MS-BDD-069`、`MS-BDD-074`、`MS-BDD-075` | `MS-UT-001`、`MS-UT-034`、`MS-UT-035`、`MS-IT-001`、`MS-ET-001`、`MS-ET-002`、`MS-API-016`、`MS-UT-051`、`MS-IT-057`、`MS-UT-052`、`MS-IT-058`、`MS-UT-055`、`MS-ET-018`、`MS-UT-056`、`MS-API-029`、`MS-IT-063`、`MS-API-031`、`MS-UT-060`、`MS-IT-064` |
| `MS-AC-006` | `MS-BDD-006`、`MS-BDD-010`、`MS-BDD-011`、`MS-BDD-033`、`MS-BDD-051`、`MS-BDD-053`、`MS-BDD-054`、`MS-BDD-072` | `MS-UT-006`、`MS-UT-010`、`MS-UT-011`、`MS-UT-033`、`MS-UT-036`、`MS-UT-038`、`MS-UT-039`、`MS-IT-006`、`MS-IT-010`、`MS-IT-011`、`MS-IT-033`、`MS-ET-003`、`MS-ET-005`、`MS-ET-006`、`MS-API-017`、`MS-API-018`、`MS-API-021`、`MS-UT-059`、`MS-ET-019` |
| `MS-AC-007` | `MS-BDD-007`、`MS-BDD-008`、`MS-BDD-045`、`MS-BDD-055`、`MS-BDD-066`、`MS-BDD-072` | `MS-UT-007`、`MS-UT-008`、`MS-UT-040`、`MS-IT-007`、`MS-IT-008`、`MS-IT-045`、`MS-API-012`、`MS-ET-007`、`MS-API-019`、`MS-API-022`、`MS-API-023`、`MS-IT-050`、`MS-UT-053`、`MS-IT-059`、`MS-UT-059`、`MS-ET-019` |
| `MS-AC-008` | `MS-BDD-009`、`MS-BDD-037`、`MS-BDD-052` | `MS-UT-009`、`MS-UT-037`、`MS-IT-009`、`MS-IT-037`、`MS-API-004`、`MS-ET-004`、`MS-API-020`、`MS-IT-054`、`MS-ET-016` |
| `MS-AC-009` | `MS-BDD-019`、`MS-BDD-021`、`MS-BDD-036`、`MS-BDD-039`、`MS-BDD-056`、`MS-BDD-057`、`MS-BDD-065`、`MS-BDD-068`、`MS-BDD-071` | `MS-UT-019`、`MS-UT-021`、`MS-UT-041`、`MS-UT-042`、`MS-IT-019`、`MS-IT-021`、`MS-IT-036`、`MS-IT-039`、`MS-API-003`、`MS-API-006`、`MS-ET-008`、`MS-ET-009`、`MS-API-027`、`MS-IT-052`、`MS-IT-056`、`MS-UT-052`、`MS-IT-058`、`MS-UT-055`、`MS-ET-018`、`MS-UT-058`、`MS-IT-061` |
| `MS-AC-010` | `MS-BDD-012`、`MS-BDD-038`、`MS-BDD-071` | `MS-UT-012`、`MS-IT-012`、`MS-IT-038`、`MS-API-005`、`MS-IT-053`、`MS-IT-054`、`MS-ET-017`、`MS-UT-058`、`MS-IT-061` |
| `MS-AC-011` | `MS-BDD-040`、`MS-BDD-041`、`MS-BDD-042`、`MS-BDD-060`、`MS-BDD-070` | `MS-UT-045`、`MS-IT-040`、`MS-IT-041`、`MS-IT-042`、`MS-API-007`、`MS-API-008`、`MS-API-009`、`MS-ET-012`、`MS-IT-049`、`MS-IT-055`、`MS-UT-057`、`MS-IT-060` |
| `MS-AC-012` | `MS-BDD-043`、`MS-BDD-044`、`MS-BDD-046`、`MS-BDD-047`、`MS-BDD-048`、`MS-BDD-066`、`MS-BDD-067`、`MS-BDD-069`、`MS-BDD-073`、`MS-BDD-074`、`MS-BDD-075` | `MS-IT-043`、`MS-IT-044`、`MS-IT-046`、`MS-IT-047`、`MS-IT-048`、`MS-API-010`、`MS-API-011`、`MS-API-013`、`MS-API-014`、`MS-API-015`、`MS-API-025`、`MS-API-026`、`MS-IT-051`、`MS-IT-056`、`MS-UT-053`、`MS-IT-059`、`MS-UT-054`、`MS-API-028`、`MS-UT-056`、`MS-API-029`、`MS-IT-062`、`MS-API-030`、`MS-IT-063`、`MS-API-031`、`MS-UT-060`、`MS-IT-064` |
| `MS-AC-013` | `MS-BDD-058`、`MS-BDD-059` | `MS-UT-043`、`MS-UT-044`、`MS-ET-010`、`MS-ET-011` |
| `MS-AC-014` | `MS-BDD-062` | `MS-UT-047`、`MS-ET-014` |

## 2026-11-06 新架構與決策補強追溯

| BDD | 新增 TDD IDs | 驗收重點 |
|---|---|---|
| `MS-BDD-064` | `MS-UT-051`、`MS-IT-057` | 未完成資料仍保留user_profiles，合格才建立accountId唯一的match_conditions且不儲存source_profile_revision；僅配對相關條件改變時同步投影，無關照片排序或分享設定不觸發同步 |
| `MS-BDD-065` | `MS-UT-052`、`MS-IT-058` | 資料不合格時原子移除投影，但game_rounds及參與者不提前結束 |
| `MS-BDD-066` | `MS-UT-053`、`MS-IT-059` | 舊pending不因性向變更或match_conditions列被移除而失效；成年及化身仍須有效 |
| `MS-BDD-067` | `MS-UT-054`、`MS-API-028` | 新搜尋與新邀請使用最新條件，原pending不改 |
| `MS-BDD-068` | `MS-UT-055`、`MS-ET-018` | 初次登入未完成導向Profile、有遊戲導向遊戲、就緒導向探索，API未知安全重試 |
| `MS-BDD-069` | `MS-UT-056`、`MS-API-029` | 先完整計分排序再分頁；GET單筆安全人物卡、禁止透露私有資料 |
| `MS-BDD-070` | `MS-UT-057`、`MS-IT-060` | game_round_participants.account_id UNIQUE及真D1並行失敗回滾 |
| `MS-BDD-071` | `MS-UT-058`、`MS-IT-061` | 遊戲結束只釋放占用，不會替不合格玩家重建投影 |
| `MS-BDD-072` | `MS-UT-059`、`MS-ET-019` | incoming可接受、outgoing等待不重送，不能全量排除pending |
| `MS-BDD-073` | `MS-IT-062`、`MS-API-030` | 指定非正式環境重建四表、R2測資一致，不轉換舊資料不清正式資料 |
| `MS-BDD-074` | `MS-IT-063`、`MS-API-031` | 真D1配對相關更新及投影同步失敗時不可部分提交或保留錯誤的舊條件；無關個資更新不應觸發投影指令 |
| `MS-BDD-075` | `MS-UT-060`、`MS-IT-064` | 無關照片排序／分享設定即使使Profile revision增加，match_conditions也不更新、不依版本相等排除，玩家仍可被探索 |

此輪四表：match_conditions、match_invitations、game_rounds、game_round_participants；user_profiles仍是基本資料唯一來源，只有配對相關欄位／資格異動才與投影同一D1原子更新，無關個資變動不操作投影。既有pending不因性向變動失效，新探索／邀請用最新條件；不做暫停探索、上線資料遷移。登入導航及按需人物卡是本次前端交付。以上均為未實作驗收項，不改既有已實作模組的事實證據。

## 規劃交接紀錄

**交接狀態**：Ready for well-done（只代表規劃交接完成）
**最後確認日期**：2026-11-06（四表、既有邀請不因性向修改失效、無暫停探索、未上線清除重建不轉換）
**文件包**：MVP、SDD、BDD、TDD 與 [RiskAudit](../specs/SPEC-001-MatchingSessions-RiskAudit.md)。
**已確認業務決策**：配對 65／20／15 加權、年齡和地區選填、拒絕或結束後永久排除同一對、同時只一場遊戲、資料ready自動探索。
**不得進入開發的阻斷項**：無（完整遊戲退出 E2E 依賴後續 StoryDialogueAndExit，尚不得視為通過）。
**範圍限制**：此為規劃文件，沒有任何功能實作／測試通過，亦不表示下游終止或名片交換功能已存在。


### 文件包

| 類型 | 路徑 | 狀態 |
|---|---|---|
| MVP | `docs/requirements/MVP-001-LoveGameDatingApp.md` | 2026-10-24 已確認，20故事／68 AC；本份 US-004 |
| SPEC | `docs/specs/SPEC-001-MatchingSessions.md` | Q1～Q4、RQ-01=A／RQ-02=A 均已確認 |
| BDD | `docs/bdd/SPEC-001-MatchingSessions-BDD.md` | 63 場景已產生；0項實作通過 |
| TDD | `docs/tdd/SPEC-001-MatchingSessions-TDD.md` | 原126＋24補強＝150；0項實作通過 |
| RiskAudit | `docs/specs/SPEC-001-MatchingSessions-RiskAudit.md` | 14風險記錄決策與緩解，24缺漏已補 |

### 已確認風險（20項）

| 風險 ID | 風險及影響 | 已確認決策／緩解 | 回寫位置及注意事項 |
|---|---|---|---|
| `MS-RA-01`（高） | SDD §6.2 跨 pair 一人一場；只用 `game_rounds` pair UNIQUE 不足；A 可能同時與 B、C 各開始一場 | 已在 SDD 設計 `game_round_participants.account_id UNIQUE`；真 D1 測跨 pair 併發、雙方占用與 ended 釋放 | SDD §6.2、MS-IT-049（唯一 participant）；RiskAudit §二／本 TDD 補強 |
| `MS-RA-02`（高） | SDD §6.3 條件更新可能 0 changes；D1 batch 雖會對 SQL 失敗回滾，但**無異常的0列更新不會自動回滾**；回答成功但邀請未被接受，或有孤兒 round、殘留 participant、其他邀請錯誤失效 | 固定命令設計可證明行數的失敗封閉 guard，真 Miniflare D1 注入「第二筆 participant 失敗／0 changes／併發」 | SDD §6.3、MS-IT-051／063（0 changes fail-closed）；RiskAudit §二／本 TDD 補強 |
| `MS-RA-03`（高） | SDD §4.1、§5 永久排除依 account pair 歷史，但沒有說明刪除帳號後重新註冊是否算原本那個人；重新註冊可能再次遇到曾拒絕的人；若追蹤真人身分則造成超出本 MVP 的識別與隱私蒐集 | **RQ-01=A**：只封鎖舊 accountId pair、不跨註冊辨識真人 | SDD §4.1、MS-IT-054（RQ-01=A）；RiskAudit §二／本 TDD 補強 |
| `MS-RA-04`（高） | SDD §3、§8 的 `invalidated` 同時代表「與別人開始遊戲」及「資料資格變更」；單靠 status 無法區分；用戶可能誤認被婉拒，或畫面顯示不正確原因 | **RQ-02=A**：保存兩種受控失效原因、UI 只給安全文案 | SDD §3／§6.2／§8、MS-IT-056（RQ-02=A）；RiskAudit §二／本 TDD 補強 |
| `MS-RA-05`（高） | SDD §6.1、§6.3 配對前 reader；現有 `IAvatarAndPreferencesReader` 需要真 `RoundId`；未配對者可能繞過授權讀取對方性向／原照／名片 | 只能新增受限內部 `IMatchingCandidateProfileReader`，按 profileReady／active／性向／pair 過濾，投影只輸出 `CandidatePersona` 與總分 | SDD §6.1、MS-API-025／026（受限讀取）；RiskAudit §二／本 TDD 補強 |
| `MS-RA-06`（高） | SDD §5、§6.3 profile revision、Session 及 pair 狀態跨多步查核；新邀請可能用到過期性向或占用，但舊pending應保持原邀請效力 | SQL 交易內新邀請重查最新投影、占用、declined／ended；接受舊pending不回溯性向；用 stale revision 與撤銷 Session 的真 D1 競態測試 | SDD §5、MS-IT-043（revision／Session）；RiskAudit §二／本 TDD 補強 |
| `MS-RA-07`（中） | SDD §4.2 目前地區選填，行政區代表座標不是實際住址；缺資料給50；跨縣市邊界或外島會出現不夠直覺的距離排序 | 固定完整縣市 code→代表座標版本，測同代碼距離0、外島／邊界、更新版本前後一致性；UI 說明「概略地理契合」 | SDD §4.2、MS-UT-049（縣市）；RiskAudit §二／本 TDD 補強 |
| `MS-RA-08`（中） | SDD §4.2 興趣／生活偏好可選填，空標籤或兩人無共同可比欄位 B=0；資料稀疏者總分較低，可能被誤會成不適合 | 不改已確認公式；UI 不稱「科學配對」，用計算測試固定 0／100／中間值及重分配精度 | SDD §4.2、MS-UT-050（空偏好）；RiskAudit §二／本 TDD 補強 |
| `MS-RA-09`（中） | SDD §5 多個 pending 中一個被接受，須一次失效雙方所有其他 incoming/outgoing；第三人的邀請可能在遊戲中仍顯示可接受 | D1 用 pair 參與者索引查雙方向、同一 batch invalidated，並覆核原邀請未被永久拒絕 | SDD §5／§6.3、MS-IT-052（全部待決失效）；RiskAudit §二／本 TDD 補強 |
| `MS-RA-10`（中） | SDD §5、§7 72h 邊界、重送與反向邀請的判定；期限附近可能多生邀請或錯誤把過期視為拒絕 | 查伺服器時間 `now >= expires_at`；反向重送 CAS＋回查；`clientRequestId` 冪等一次成功 | SDD §5、MS-IT-055（72小時／冪等）；RiskAudit §二／本 TDD 補強 |
| `MS-RA-11`（中） | TDD 現有 API 項主要來自錯誤場景；9 個 REST 端點缺逐端點正常路徑及授權矩陣；Endpoint 已接線但未被完整測試，可能漏接認證／錯誤代碼 | 補全部8條 happy API與各自401／403／409錯誤測試；含嚴格 JSON、no-store 與重送 | SDD §7、MS-API-016～027（9端點及安全）；RiskAudit §二／本 TDD 補強 |
| `MS-RA-12`（中） | SDD §7 搜尋 offset 0～5000 與每次重新評分，無跨頁快照；D1 profiles 成長時全表評分；大量候選延遲、跨頁重複／遺漏與讀取成本增加 | 補 0／1／20／21／5000 邊界及資料中途變更；實測具代表性資料量與 Cloudflare D1 查詢預算 | SDD §7／§9、MS-API-016（分頁與效能）；RiskAudit §二／本 TDD 補強 |
| `MS-RA-13`（中） | `StoryDialogueAndExit` 尚未實作真正 ended 入口；本份只有終止契約；本份若先宣稱「可結束後再配對」，會把下一 SPEC 尚未完成功能當成本份通過 | 本份只以受控整合驗 `ended` 原子狀態轉移；完整 UX／真人中止流程留給 Story SPEC 後再做跨 SPEC 驗收 | SDD §5／§8、MS-ET-017（後續劇情終止）；RiskAudit §二／本 TDD 補強 |
| `MS-RA-14`（低） | 明確婉拒是不可逆的永久決策；錯點會永久失去此 pair；玩家可能不知道婉拒是永久性的 | BDD `MS-BDD-052` 顯示確認文案，取消 Dialog 不能寫入 declined；限流與雙端狀態一致 | SDD §8、MS-ET-016（婉拒二次確認）；RiskAudit §二／本 TDD 補強 |

| `MS-RA-15`（高） | match_conditions 與 user_profiles 分開寫會資料漂移 | 配對欄位／資格異動才同步原子UPSERT或DELETE；不做revision相等檢查，無關個資變更不碰投影 | BDD-064/065/074、IT-057/058/063 |
| `MS-RA-16`（高） | 舊 pending 性向編輯後若回溯重驗會錯誤失效 | 舊邀請保留建立時雙向相容判斷；新搜尋與新發邀採最新條件 | BDD-043/066/067、IT-043/059、API-010/028 |
| `MS-RA-17`（高） | 改 game_rounds／game_round_participants 後可能單人多輪 | participants.account_id UNIQUE、原子接受／釋放／失敗回滾 | BDD-070、IT-049/050/060 |
| `MS-RA-18`（中） | 先分頁後評分排名錯誤；逐筆人物卡有延遲／越權風險 | 全量候選先排序後分頁；GET 單筆安全人物卡並預載1至3筆 | BDD-061/069、UT-056、API-029 |
| `MS-RA-19`（中） | 首次登入導引缺漏 | Profile未就緒、空閒就緒及遊戲中三分流，API不明需重試 | BDD-068、UT-055、ET-018 |
| `MS-RA-20`（高） | 未上線清空重建若目標錯誤或 R2 孤兒殘留 | 僅指定DatingHigh非正式測試環境重建，不做ETL，R2同步清理 | BDD-073、IT-062、API-030 |

### 原始補強缺漏（24項，另有新版11項見上方追溯表）

| 缺漏 ID | 來源／補強內容 | 回寫 TDD ID | 狀態 |
|---|---|---|---|
| `MS-GAP-01` | §7／BDD-001,061：搜尋200、分頁及同分排序 | `MS-API-016`（API） | 已補回，待實作 |
| `MS-GAP-02` | §7／BDD-006：建立201 pending及原子保留 | `MS-API-017`（API） | 已補回，待實作 |
| `MS-GAP-03` | §7／BDD-051：incoming/outgoing合法且無私有欄位 | `MS-API-018`（API） | 已補回，待實作 |
| `MS-GAP-04` | §7／BDD-007：接受200、兩端同輪 | `MS-API-019`（API） | 已補回，待實作 |
| `MS-GAP-05` | §7／BDD-009：婉拒後雙向封鎖 | `MS-API-020`（API） | 已補回，待實作 |
| `MS-GAP-06` | §7／BDD-010：自己取消不封鎖 | `MS-API-021`（API） | 已補回，待實作 |
| `MS-GAP-07` | §7／BDD-055：本人一場，非本人無權 | `MS-API-022`（API） | 已補回，待實作 |
| `MS-GAP-08` | §7／BDD-055：active及權限保護 | `MS-API-023`（API） | 已補回，待實作 |
| `MS-GAP-09` | §7／BDD-034：登入防護與no-store | `MS-API-024`（API） | 已補回，待實作 |
| `MS-GAP-10` | §7／BDD-046：猜對方記錄不外洩 | `MS-API-025`（API） | 已補回，待實作 |
| `MS-GAP-11` | §7／BDD-046：猜roundId不得取得資料 | `MS-API-026`（API） | 已補回，待實作 |
| `MS-GAP-12` | §7／BDD-036：活躍遊戲期間不產生pending | `MS-API-027`（API） | 已補回，待實作 |
| `MS-GAP-13` | §6.2／BDD-040：A不得同時開兩輪；其中一批完整回滾 | `MS-IT-049`（Integration） | 已補回，待實作 |
| `MS-GAP-14` | §6.3／BDD-045：不殘留第一筆participant或round | `MS-IT-050`（Integration） | 已補回，待實作 |
| `MS-GAP-15` | §6.3／BDD-045,074：不將0列UPDATE當成功 | `MS-IT-051`（Integration） | 已補回，待實作 |
| `MS-GAP-16` | §6.3／BDD-039：同批失效兩人所有其他邀請，不永久排除第三人 | `MS-IT-052`（Integration） | 已補回，待實作 |
| `MS-GAP-17` | §6.2／BDD-012：兩筆game_round_participants均釋放且仍永久互斥該pair | `MS-IT-053`（Integration） | 已補回，待實作 |
| `MS-GAP-18` | §6.2／BDD-037,038：換發起方向仍不得再配 | `MS-IT-054`（Integration） | 已補回，待實作 |
| `MS-GAP-19` | §4.2／BDD-026,027：同縣市0、距離遞減、外島及對照表全集 | `MS-UT-049`（Unit） | 已補回，待實作 |
| `MS-GAP-20` | §4.2／BDD-013,014,015：無／只有單邊／都有；最後四捨五入 | `MS-UT-050`（Unit） | 已補回，待實作 |
| `MS-GAP-21` | §4.1／BDD-042：72h跨界與同pair pending UNIQUE | `MS-IT-055`（Integration） | 已補回，待實作 |
| `MS-GAP-22` | §3／BDD-057：區分 other_round_started／eligibility_changed | `MS-IT-056`（Integration） | 已補回，待實作 |
| `MS-GAP-23` | §8／BDD-052：永久拒絕確認視窗按取消後不落地 | `MS-ET-016`（E2E） | 已補回，待實作 |
| `MS-GAP-24` | §5／BDD-012：下游退出完成後才驗真Web／Android端到端；未實作不得先通過 | `MS-ET-017`（E2E） | 已補回，待實作 |

### 實作注意事項與驗收邊界

- **已確認業務規則**：新搜尋／新發邀仍須性別／性向雙向相容，原pending不因後續性向修改失效；年齡、地區偏好維持選填且按65／20／15權重與雙方偏好計分；明確婉拒或遊戲結束後同一對永久互斥；每人同時最多一場；profileReady並有有效match_conditions且非遊戲中才可探索。
- **RQ-01=A**：永久互斥的識別單位是既有兩個 `accountId` 的 pair；重新登入、換裝置、改個人資料仍永久排除。刪除後以新帳號重新註冊不跨帳號追蹤真人；不可為此額外保存私人生日、性向、裝置指紋。
- **RQ-02=A**：`match_invitations.invalidated_reason` 僅 `invalidated` 有受控值 `other_round_started/eligibility_changed`，其他狀態為 NULL；Web／Android 分別呈現「對方目前無法配對，這次邀請已失效」／「配對條件已變更，請重新搜尋」，不透露對方新對象／私人偏好，也不將失效誤當永久婉拒。
- **併發與資料原子性**：四張 D1 表，`game_round_participants.account_id UNIQUE` 保證每人一場；同批處理 accept、round、兩個 participants、其他 pending 失效；結束時同批將 round ended 與釋放兩個 participants。任何條件式更新零列須 fail-close，不能因 SQL 未拋錯而部分寫入成功；要用真 Miniflare D1 和故障注入證實。
- **資料與授權**：登入 Family／新邀請profile revision與性向重查；舊pending接受不追溯性向；不偽造 RoundId 讀取未配對的完整個資，專用受限 reader 只能向候選公開 `CandidatePersona` 與總分，名片及真人照仍需後續雙方明確同意。
- **MS-D-064**：移除 match_conditions.source_profile_revision；user_profiles.revision 仍僅為本人個資CAS。共用配對欄位差異檢測決定是否同步 UPSERT／DELETE；照片排序、分享設定等非配對異動不操作投影。BDD-075／UT-060／IT-064 驗證無關修改不能讓玩家從候選消失。
- **跨 SPEC**：`StoryDialogueAndExit` 才負責真正可觸發的退出／停止劇情；本份規劃原子結束邊界，`MS-ET-017` 的真 Web／Android 端到端只能待後續整合後通過，不可提前核准。正式 API／migration／UI 與 overview 的實作同步由下一階段 `well-done` 執行。
- **平台**：Web／Android 必須各自有實測；iOS 依 D-052 暫緩，無障礙專項依 D-051 不納入；production 尚無證據，不得標成已發布。

### 不得進入開發的阻斷項

- **無**：SDD Q1～Q4、風險 RQ-01=A／RQ-02=A 已全部確認，20項風險都已記錄解法與後續驗證門檻，原24項缺漏與新增12場景24項測試均已回寫、沒有待確認產品決策。
- `Ready for well-done` 僅表示**可以開始本 SPEC 的測試先行實作**；目前 **BDD 0/75、TDD 0/174**，不代表配對模組已有 API／DB／UI 或測試通過。下一步只交給 `well-done` 處理 MatchingSessions，不自主規劃下一份 SPEC。
