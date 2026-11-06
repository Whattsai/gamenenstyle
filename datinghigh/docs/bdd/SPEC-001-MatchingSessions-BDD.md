# SPEC-001-MatchingSessions — BDD 場景規格

> **來源 MVP**：[MVP-001-LoveGameDatingApp](../requirements/MVP-001-LoveGameDatingApp.md)；**已確認 SDD**：[SPEC-001-MatchingSessions](../specs/SPEC-001-MatchingSessions.md)（Q1～Q4、RQ-01=A、RQ-02=A；2026-11-06四表架構及邀請沿用決策）
> **日期**：2026-11-06；**規劃狀態**：本輪本地責任實作及驗收完成；iOS 暫緩、無障礙專項不在本 MVP 範圍。

## Feature 描述

Feature：根據雙方適格性及年齡／地區／興趣生活契合度，安全探索真人候選、由雙方明確同意開始單一遊戲，並永久排除被拒絕或已結束的同一對。

## 前端 UX 與規劃進度

- 整體 BDD：**75/75** 完整業務斷言覆核（100%）；結束相關場景只含本份內部契約。
- 前端 UX：**18/18** 完成；Web／Android已各別驗證。
- 追溯：每項 `MS-AC-001～014` 都有獨立場景；BDD 場景對應 TDD 至少兩項不同層級的測試／完整斷言證據。
- 界線：`StoryDialogueAndExit` 才負責真正的遊戲結束入口，本份已以真D1驗證內部原子終止契約，未宣稱已完成後續模組。

## Background（共同前提）

```gherkin
Feature: 條件契合配對與雙方確認
  Background:
    Given 使用兩個以上互相隔離的真實已註冊帳號
    And 以伺服器保存的 Profile 與真實 D1 狀態判定
    And 未指定的年齡與地區偏好都不作硬性排除
    And 不使用固定假候選、模擬同意或已過期的登入憑證
```


## Happy Path — 正常流程

### MS-BDD-001：資料完成即可被探索

- [x] **Scenario: 資料完成即可被探索**
  **SPEC 對應**：`MS-AC-005`；**優先級**：critical；**標籤**：@smoke @happy-path @critical

```gherkin
@smoke @happy-path @critical
Scenario: MS-BDD-001 資料完成即可被探索
  Given A與B均成年、資料就緒且未在遊戲中
  When A搜尋候選
  Then B出現在候選清單
  And 不需額外開啟配對開關
```

### MS-BDD-002：雙方以同一契合分數排序

- [x] **Scenario: 雙方以同一契合分數排序**
  **SPEC 對應**：`MS-AC-001`；**優先級**：critical；**標籤**：@smoke @happy-path @critical

```gherkin
@smoke @happy-path @critical
Scenario: MS-BDD-002 雙方以同一契合分數排序
  Given A與B有興趣、生活型態及偏好資料
  When 雙方各自搜尋對方
  Then 兩方看到相同0至100整數契合分數
  And 列表依分數遞減排列
```

### MS-BDD-003：年齡不符合偏好也不淘汰

- [x] **Scenario: 年齡不符合偏好也不淘汰**
  **SPEC 對應**：`MS-AC-003`；**優先級**：critical；**標籤**：@happy-path @critical

```gherkin
@happy-path @critical
Scenario: MS-BDD-003 年齡不符合偏好也不淘汰
  Given A偏好25至35歲且B為40歲
  When A搜尋合格候選
  Then B仍可列入候選
  And A對B年齡分量為75分
```

### MS-BDD-004：地區距離只扣分不封鎖

- [x] **Scenario: 地區距離只扣分不封鎖**
  **SPEC 對應**：`MS-AC-003`；**優先級**：critical；**標籤**：@happy-path @critical

```gherkin
@happy-path @critical
Scenario: MS-BDD-004 地區距離只扣分不封鎖
  Given A偏好台北、B位於遠方縣市
  When A搜尋合格候選
  Then B仍可能列出
  And 距離越遠地區分量越低
```

### MS-BDD-005：雙向性別性向相容才互配

- [x] **Scenario: 雙向性別性向相容才互配**
  **SPEC 對應**：`MS-AC-002`；**優先級**：critical；**標籤**：@happy-path @critical

```gherkin
@happy-path @critical
Scenario: MS-BDD-005 雙向性別性向相容才互配
  Given A與B的性向各包含對方性別
  When A與B各自搜尋
  Then 雙方可互相探索
  And 不顯示對方私有性向欄位
```

### MS-BDD-006：一方邀請只建立待回覆

- [x] **Scenario: 一方邀請只建立待回覆**
  **SPEC 對應**：`MS-AC-006`；**優先級**：critical；**標籤**：@happy-path @critical

```gherkin
@happy-path @critical
Scenario: MS-BDD-006 一方邀請只建立待回覆
  Given A可配對B且尚無邀請
  When A點想認識
  Then 僅有pending邀請
  And 沒有active輪次與假聊天
```

### MS-BDD-007：接收者接受後建立唯一遊戲

- [x] **Scenario: 接收者接受後建立唯一遊戲**
  **SPEC 對應**：`MS-AC-007`；**優先級**：critical；**標籤**：@happy-path @critical

```gherkin
@happy-path @critical
Scenario: MS-BDD-007 接收者接受後建立唯一遊戲
  Given A已向B送有效pending邀請且雙方空閒
  When B點接受
  Then 只建立一個active round
  And A與B進入相同roundId且game_round_participants各有一筆帳號唯一占用
```

### MS-BDD-008：反向主動邀請視為第二次同意

- [x] **Scenario: 反向主動邀請視為第二次同意**
  **SPEC 對應**：`MS-AC-007`；**優先級**：critical；**標籤**：@happy-path @critical

```gherkin
@happy-path @critical
Scenario: MS-BDD-008 反向主動邀請視為第二次同意
  Given B已向A發送有效pending邀請
  When A明確對B點想認識
  Then 原邀請被接受
  And 只建立一個active round
```

### MS-BDD-009：明確婉拒永久排除這一對

- [x] **Scenario: 明確婉拒永久排除這一對**
  **SPEC 對應**：`MS-AC-008`；**優先級**：critical；**標籤**：@happy-path @critical

```gherkin
@happy-path @critical
Scenario: MS-BDD-009 明確婉拒永久排除這一對
  Given A已邀請B且B尚未回覆
  When B確認婉拒
  Then 邀請永久成為declined
  And 往後A與B彼此都不可出現在候選
```

### MS-BDD-010：取消邀請不構成永久拒絕

- [x] **Scenario: 取消邀請不構成永久拒絕**
  **SPEC 對應**：`MS-AC-006`；**優先級**：normal；**標籤**：@happy-path @normal

```gherkin
@happy-path @normal
Scenario: MS-BDD-010 取消邀請不構成永久拒絕
  Given A對B有pending邀請
  When A按取消邀請
  Then 邀請成為cancelled且無round
  And 後續仍可重新探索對方
```

### MS-BDD-011：72小時未回覆不構成永久拒絕

- [x] **Scenario: 72小時未回覆不構成永久拒絕**
  **SPEC 對應**：`MS-AC-006`；**優先級**：normal；**標籤**：@happy-path @normal

```gherkin
@happy-path @normal
Scenario: MS-BDD-011 72小時未回覆不構成永久拒絕
  Given A的邀請已逾72小時且B無回覆
  When A或B重新載入邀請
  Then 邀請成為expired且不建立round
  And 未來A與B可再次配對
```

### MS-BDD-012：遊戲結束恢復與其他人配對

- [x] **Scenario: 遊戲結束恢復與其他人配對**
  **SPEC 對應**：`MS-AC-010`；**優先級**：critical；**標籤**：@happy-path @critical

```gherkin
@happy-path @critical
Scenario: MS-BDD-012 遊戲結束恢復與其他人配對
  Given A與B有active遊戲且C與A性向相容
  When 合法結束A與B的遊戲
  Then A與B釋放占用且與C可重新配對
  And A與B之間永久不能再配
```


## Alternative Path — 替代流程

### MS-BDD-013：雙方都沒填年齡與地區偏好

- [x] **Scenario: 雙方都沒填年齡與地區偏好**
  **SPEC 對應**：`MS-AC-004`；**優先級**：normal；**標籤**：@alternative-path @normal

```gherkin
@alternative-path @normal
Scenario: MS-BDD-013 雙方都沒填年齡與地區偏好
  Given A與B皆未設定兩種偏好
  When 計算契合度
  Then 僅興趣生活B占100百分比
  And 兩人沒有因未填偏好被扣固定分數
```

### MS-BDD-014：只有A設定年齡偏好

- [x] **Scenario: 只有A設定年齡偏好**
  **SPEC 對應**：`MS-AC-004`；**優先級**：critical；**標籤**：@alternative-path @critical

```gherkin
@alternative-path @critical
Scenario: MS-BDD-014 只有A設定年齡偏好
  Given A設定年齡偏好但B沒有
  When 計算配對分數
  Then 只計A對B的年齡評價
  And 基準與年齡按65比20重新正規化
```

### MS-BDD-015：只有B設定地區偏好

- [x] **Scenario: 只有B設定地區偏好**
  **SPEC 對應**：`MS-AC-004`；**優先級**：critical；**標籤**：@alternative-path @critical

```gherkin
@alternative-path @critical
Scenario: MS-BDD-015 只有B設定地區偏好
  Given 只有B設定偏好縣市
  When 計算配對分數
  Then 只計B對A的地區評價
  And 基準與地區按65比15重新正規化
```

### MS-BDD-016：對方未提供所在地區

- [x] **Scenario: 對方未提供所在地區**
  **SPEC 對應**：`MS-AC-003`；**優先級**：normal；**標籤**：@alternative-path @normal

```gherkin
@alternative-path @normal
Scenario: MS-BDD-016 對方未提供所在地區
  Given A設定偏好縣市而B的目前地區為空
  When 計算地區分量
  Then 該方向得到中性50分
  And B不因未填地區被排除
```

### MS-BDD-017：多個偏好地區選距離最近者

- [x] **Scenario: 多個偏好地區選距離最近者**
  **SPEC 對應**：`MS-AC-003`；**優先級**：normal；**標籤**：@alternative-path @normal

```gherkin
@alternative-path @normal
Scenario: MS-BDD-017 多個偏好地區選距離最近者
  Given A偏好台北與高雄而B位於台南
  When 計算A對B的地區分量
  Then 使用與台南較近的偏好縣市
  And 不計最遠地區或平均多地區距離
```

### MS-BDD-018：沒有共同標籤仍可得分

- [x] **Scenario: 沒有共同標籤仍可得分**
  **SPEC 對應**：`MS-AC-004`；**優先級**：normal；**標籤**：@alternative-path @normal

```gherkin
@alternative-path @normal
Scenario: MS-BDD-018 沒有共同標籤仍可得分
  Given A與B沒有共同興趣但生活型態相同
  When 計算契合度
  Then 共同興趣子分量為零
  And 生活型態及合法偏好仍可貢獻分數
```

### MS-BDD-019：等待期間可同時收到不同邀請

- [x] **Scenario: 等待期間可同時收到不同邀請**
  **SPEC 對應**：`MS-AC-009`；**優先級**：critical；**標籤**：@alternative-path @critical

```gherkin
@alternative-path @critical
Scenario: MS-BDD-019 等待期間可同時收到不同邀請
  Given A與B與C都空閒且都符合相容規則
  When A收到B和C的待決邀請
  Then 可存在兩組不同pair的pending
  And 任何一組未接受前A仍可被探索
```

### MS-BDD-020：修改個人偏好後重算排序

- [x] **Scenario: 修改個人偏好後重算排序**
  **SPEC 對應**：`MS-AC-004`；**優先級**：normal；**標籤**：@alternative-path @normal

```gherkin
@alternative-path @normal
Scenario: MS-BDD-020 修改個人偏好後重算排序
  Given A已在第一次搜尋後修改偏好並成功保存
  When A再次搜尋
  Then 依最新資料重新算分排序
  And 不信任前一次候選分數
```

### MS-BDD-021：遊戲結束後第三人的邀請可重新發起

- [x] **Scenario: 遊戲結束後第三人的邀請可重新發起**
  **SPEC 對應**：`MS-AC-009`；**優先級**：critical；**標籤**：@alternative-path @critical

```gherkin
@alternative-path @critical
Scenario: MS-BDD-021 遊戲結束後第三人的邀請可重新發起
  Given A與B已結束遊戲且C先前邀請因A開始遊戲失效
  When C再次探索A
  Then A重新出現在C候選
  And C可發新的邀請且舊invalidated不永久排除
```


## Boundary Conditions — 邊界條件

### MS-BDD-022：成年生日界線依台灣日期

- [x] **Scenario: 成年生日界線依台灣日期**
  **SPEC 對應**：`MS-AC-002`；**優先級**：critical；**標籤**：@edge-case @critical

```gherkin
@edge-case @critical
Scenario: MS-BDD-022 成年生日界線依台灣日期
  Given 某帳號今日正好滿18歲而另帳號尚未滿18歲
  When 兩者分別請求配對
  Then 滿18歲者可參與且未滿18歲者被排除
  And 不回傳精確生日
```

### MS-BDD-023：偏好閉區間端點給滿分

- [x] **Scenario: 偏好閉區間端點給滿分**
  **SPEC 對應**：`MS-AC-003`；**優先級**：critical；**標籤**：@edge-case @critical

```gherkin
@edge-case @critical
Scenario: MS-BDD-023 偏好閉區間端點給滿分
  Given A年齡偏好25至35歲
  When B分別為25或35歲
  Then 兩個年齡邊界均給100分
  And 不視為超出一歲
```

### MS-BDD-024：年齡超出一歲扣五分

- [x] **Scenario: 年齡超出一歲扣五分**
  **SPEC 對應**：`MS-AC-003`；**優先級**：critical；**標籤**：@edge-case @critical

```gherkin
@edge-case @critical
Scenario: MS-BDD-024 年齡超出一歲扣五分
  Given A偏好25至35歲且B為36歲
  When 計算A對B的年齡分量
  Then 該分量是95分
  And B仍可列入候選
```

### MS-BDD-025：年齡差二十歲扣至零

- [x] **Scenario: 年齡差二十歲扣至零**
  **SPEC 對應**：`MS-AC-003`；**優先級**：critical；**標籤**：@edge-case @critical

```gherkin
@edge-case @critical
Scenario: MS-BDD-025 年齡差二十歲扣至零
  Given A偏好25至35歲且B為55歲
  When 計算A對B的年齡分量
  Then 該分量是0分
  And 總分仍可由其他面向貢獻
```

### MS-BDD-026：同一地區代碼距離為零

- [x] **Scenario: 同一地區代碼距離為零**
  **SPEC 對應**：`MS-AC-003`；**優先級**：normal；**標籤**：@edge-case @normal

```gherkin
@edge-case @normal
Scenario: MS-BDD-026 同一地區代碼距離為零
  Given A偏好台北且B所在地區代碼也是台北
  When 計算地區分量
  Then 地區距離0公里且得到100分
  And 不因代表座標精度降低同地區分數
```

### MS-BDD-027：距離150公里地區分量約37

- [x] **Scenario: 距離150公里地區分量約37**
  **SPEC 對應**：`MS-AC-003`；**優先級**：normal；**標籤**：@edge-case @normal

```gherkin
@edge-case @normal
Scenario: MS-BDD-027 距離150公里地區分量約37
  Given A偏好縣市到B的代表座標距離為150公里
  When 計算地區分量
  Then 取得約37分
  And 300公里分數需比150公里低
```

### MS-BDD-028：雙方年齡評價不同仍共用一分

- [x] **Scenario: 雙方年齡評價不同仍共用一分**
  **SPEC 對應**：`MS-AC-004`；**優先級**：critical；**標籤**：@edge-case @critical

```gherkin
@edge-case @critical
Scenario: MS-BDD-028 雙方年齡評價不同仍共用一分
  Given A對B年齡評分75而B對A年齡評分100
  When 計算雙向年齡面向
  Then 年齡分量為87.5
  And 雙方看同一個總分
```

### MS-BDD-029：雙方地區偏好取兩向平均

- [x] **Scenario: 雙方地區偏好取兩向平均**
  **SPEC 對應**：`MS-AC-004`；**優先級**：normal；**標籤**：@edge-case @normal

```gherkin
@edge-case @normal
Scenario: MS-BDD-029 雙方地區偏好取兩向平均
  Given A與B皆有地區偏好而距離不同
  When 計算雙向地區分量
  Then 使用兩個方向的算術平均
  And 交換A與B輸入順序分數不變
```

### MS-BDD-030：共同興趣權重零只看生活

- [x] **Scenario: 共同興趣權重零只看生活**
  **SPEC 對應**：`MS-AC-004`；**優先級**：critical；**標籤**：@edge-case @critical

```gherkin
@edge-case @critical
Scenario: MS-BDD-030 共同興趣權重零只看生活
  Given 雙方共同興趣權重皆為0
  When 計算基準契合分量
  Then 基準B只根據生活型態L
  And 興趣I不影響基準
```

### MS-BDD-031：共同興趣權重滿分只看興趣

- [x] **Scenario: 共同興趣權重滿分只看興趣**
  **SPEC 對應**：`MS-AC-004`；**優先級**：critical；**標籤**：@edge-case @critical

```gherkin
@edge-case @critical
Scenario: MS-BDD-031 共同興趣權重滿分只看興趣
  Given 雙方共同興趣權重皆為100
  When 計算基準契合分量
  Then 基準B只根據興趣I
  And 生活型態L不影響基準
```

### MS-BDD-032：所有分量最後才四捨五入

- [x] **Scenario: 所有分量最後才四捨五入**
  **SPEC 對應**：`MS-AC-004`；**優先級**：critical；**標籤**：@edge-case @critical

```gherkin
@edge-case @critical
Scenario: MS-BDD-032 所有分量最後才四捨五入
  Given 輸入包含非整數地區指數與雙向平均
  When 計算總契合分數
  Then 僅最後一次四捨五入且限制0至100
  And 雙方交換順序仍同分
```

### MS-BDD-033：恰好72小時邀請已過期

- [x] **Scenario: 恰好72小時邀請已過期**
  **SPEC 對應**：`MS-AC-006`；**優先級**：critical；**標籤**：@edge-case @critical

```gherkin
@edge-case @critical
Scenario: MS-BDD-033 恰好72小時邀請已過期
  Given 邀請有效時間設定72小時
  When 在建立後恰好72小時提交接受
  Then 拒絕接受並標記expired
  And 沒有game_rounds或game_round_participants占用
```


## Error Handling — 錯誤處理

### MS-BDD-034：單向性向相容不能配對

- [x] **Scenario: 單向性向相容不能配對**
  **SPEC 對應**：`MS-AC-002`；**優先級**：critical；**標籤**：@error-handling @critical

```gherkin
@error-handling @critical
Scenario: MS-BDD-034 單向性向相容不能配對
  Given A願意認識B但B的性向不包含A性別
  When A搜尋或發邀請
  Then B不在A候選且邀請拒絕
  And 不能洩漏B的具體性向
```

### MS-BDD-035：個人資料不就緒不能探索

- [x] **Scenario: 個人資料不就緒不能探索**
  **SPEC 對應**：`MS-AC-002`；**優先級**：critical；**標籤**：@error-handling @critical

```gherkin
@error-handling @critical
Scenario: MS-BDD-035 個人資料不就緒不能探索
  Given A的性別或性向未完成儲存
  When A搜尋候選
  Then 得到PROFILE_NOT_READY
  And 不把未填性向當作接受所有人
```

### MS-BDD-036：正在遊戲的人不得再次被探索

- [x] **Scenario: 正在遊戲的人不得再次被探索**
  **SPEC 對應**：`MS-AC-009`；**優先級**：critical；**標籤**：@error-handling @critical

```gherkin
@error-handling @critical
Scenario: MS-BDD-036 正在遊戲的人不得再次被探索
  Given A與B已有active遊戲而C欲搜尋A
  When C搜尋候選並嘗試舊ID邀請
  Then A不在清單且舊ID送邀失敗
  And 不產生第二個pending或round
```

### MS-BDD-037：被婉拒的pair反向也不能再邀

- [x] **Scenario: 被婉拒的pair反向也不能再邀**
  **SPEC 對應**：`MS-AC-008`；**優先級**：critical；**標籤**：@error-handling @critical

```gherkin
@error-handling @critical
Scenario: MS-BDD-037 被婉拒的pair反向也不能再邀
  Given B已拒絕A且留下declined歷史
  When B反過來搜尋並邀請A
  Then A不在B候選且送邀被拒
  And 回覆不得洩漏敏感拒絕理由
```

### MS-BDD-038：曾結束遊戲不能重新配對

- [x] **Scenario: 曾結束遊戲不能重新配對**
  **SPEC 對應**：`MS-AC-010`；**優先級**：critical；**標籤**：@error-handling @critical

```gherkin
@error-handling @critical
Scenario: MS-BDD-038 曾結束遊戲不能重新配對
  Given A與B兩個既有accountId組成的pair有ended round歷史
  When A或B以原帳號搜尋對方或直接提交ID
  Then 彼此不再是候選且不能送邀
  And 即使兩人各自空閒、重登或修改個人資料也不能再互配
  And 不要求辨認重新註冊且accountId不同的真人
```

### MS-BDD-039：開始遊戲時第三方邀請失效

- [x] **Scenario: 開始遊戲時第三方邀請失效**
  **SPEC 對應**：`MS-AC-009`；**優先級**：critical；**標籤**：@error-handling @critical

```gherkin
@error-handling @critical
Scenario: MS-BDD-039 開始遊戲時第三方邀請失效
  Given A有B與C兩筆pending且接受B
  When B接受使A與B開始active
  Then A與C的pending成為invalidated
  And C之後可重新邀A而非永久拒絕
```

### MS-BDD-040：不同pair共用一人同時接受只准一場

- [x] **Scenario: 不同pair共用一人同時接受只准一場**
  **SPEC 對應**：`MS-AC-011`；**優先級**：critical；**標籤**：@error-handling @critical

```gherkin
@error-handling @critical
Scenario: MS-BDD-040 不同pair共用一人同時接受只准一場
  Given B與C同時要和A建立遊戲
  When B與C的接受交易競爭
  Then 恰好一場active成功
  And 另一筆回衝突且game_round_participants中A只存一筆唯一占用
```

### MS-BDD-041：同一對雙向競爭不建立兩個房間

- [x] **Scenario: 同一對雙向競爭不建立兩個房間**
  **SPEC 對應**：`MS-AC-011`；**優先級**：critical；**標籤**：@error-handling @critical

```gherkin
@error-handling @critical
Scenario: MS-BDD-041 同一對雙向競爭不建立兩個房間
  Given A與B幾乎同時互相發起
  When 兩個請求同時提交
  Then 同pair只有一個有效邀請或輪次
  And 不會有兩個roundId
```

### MS-BDD-042：冪等鍵重送不增加邀請

- [x] **Scenario: 冪等鍵重送不增加邀請**
  **SPEC 對應**：`MS-AC-011`；**優先級**：critical；**標籤**：@error-handling @critical

```gherkin
@error-handling @critical
Scenario: MS-BDD-042 冪等鍵重送不增加邀請
  Given A以同一clientRequestId向B送兩次
  When 重送完全相同請求
  Then 回同一邀請結果
  And 資料庫不增加重複資料
```

### MS-BDD-043：已建立邀請不因後續性向修改而失效
- [x] **Scenario: 已建立邀請不因後續性向修改而失效**
  **SPEC 對應**：`MS-AC-012`、`MS-AC-009`；**優先級**：critical；**標籤**：@alternative @critical
```gherkin
@alternative @critical
Scenario: MS-BDD-043 已建立邀請不因後續性向修改而失效
  Given A向B建立pending時雙向性向相容
  And A或B之後修改性向造成目前互相不相容
  When 原邀請在72小時內由對方明確接受且雙方帳號成年化身有效無遊戲占用
  Then 依原邀請成立唯一game_rounds輪次
  And 原pending不因性向變更轉eligibility_changed
  And 後續新的探索與新邀請使用修改後的性向
```

### MS-BDD-044：已撤銷Session不能接受

- [x] **Scenario: 已撤銷Session不能接受**
  **SPEC 對應**：`MS-AC-012`；**優先級**：critical；**標籤**：@error-handling @critical

```gherkin
@error-handling @critical
Scenario: MS-BDD-044 已撤銷Session不能接受
  Given B登入Session已被撤銷
  When B提交邀請接受
  Then 拒絕該請求
  And 不產生game_rounds或game_round_participants占用
```

### MS-BDD-045：D1中途失敗全部回滾

- [x] **Scenario: D1中途失敗全部回滾**
  **SPEC 對應**：`MS-AC-007`；**優先級**：critical；**標籤**：@error-handling @critical

```gherkin
@error-handling @critical
Scenario: MS-BDD-045 D1中途失敗全部回滾
  Given 接受過程注入插入第二筆game_round_participants失敗
  When 接收者提交接受
  Then 邀請仍pending且game_rounds與game_round_participants皆未建立
  And 其他pending也不可被部分失效
```

### MS-BDD-046：猜邀請或輪次ID不能越權

- [x] **Scenario: 猜邀請或輪次ID不能越權**
  **SPEC 對應**：`MS-AC-012`；**優先級**：critical；**標籤**：@error-handling @critical

```gherkin
@error-handling @critical
Scenario: MS-BDD-046 猜邀請或輪次ID不能越權
  Given C並非A與B邀請或round成員
  When C對該ID送讀取或操作
  Then 回資源不可存取錯誤
  And 回覆不包含任何私有角色資料
```

### MS-BDD-047：邀請超過速率限制遭拒

- [x] **Scenario: 邀請超過速率限制遭拒**
  **SPEC 對應**：`MS-AC-012`；**優先級**：normal；**標籤**：@error-handling @normal

```gherkin
@error-handling @normal
Scenario: MS-BDD-047 邀請超過速率限制遭拒
  Given A在一小時內已達正式邀請速率上限
  When A再次發送邀請
  Then 得到RATE_LIMITED
  And 不新增pending
```

### MS-BDD-048：嚴格JSON拒絕未知或重複鍵

- [x] **Scenario: 嚴格JSON拒絕未知或重複鍵**
  **SPEC 對應**：`MS-AC-012`；**優先級**：normal；**標籤**：@error-handling @normal

```gherkin
@error-handling @normal
Scenario: MS-BDD-048 嚴格JSON拒絕未知或重複鍵
  Given A已登入但提交未知欄位或重複clientRequestId鍵
  When A發送邀請
  Then 得到INVALID_MATCH_REQUEST
  And 不新增資料
```


## Frontend UX — 前端畫面

### MS-BDD-049：配對頁初始載入顯示安全候選卡

- [x] **Scenario: 配對頁初始載入顯示安全候選卡**
  **SPEC 對應**：`MS-AC-005`；**優先級**：normal；**標籤**：@frontend @normal

```gherkin
@frontend @normal
Scenario: MS-BDD-049 配對頁初始載入顯示安全候選卡
  Given A有效登入、資料就緒且存在可配對B
  When A開啟候選頁
  Then 排序清單先回candidateId與契合分數
  And 只有畫面實際需要B時才另行載入安全化身暱稱人物卡
  And 不顯示照片與完整本人名片
```

### MS-BDD-050：沒有對象時呈現空狀態

- [x] **Scenario: 沒有對象時呈現空狀態**
  **SPEC 對應**：`MS-AC-005`；**優先級**：normal；**標籤**：@frontend @normal

```gherkin
@frontend @normal
Scenario: MS-BDD-050 沒有對象時呈現空狀態
  Given A目前沒有適格候選
  When A開啟候選頁
  Then 顯示目前沒有可配對的對象
  And 不插入任何固定測試角色
```

### MS-BDD-051：發起邀請後顯示等待

- [x] **Scenario: 發起邀請後顯示等待**
  **SPEC 對應**：`MS-AC-006`；**優先級**：critical；**標籤**：@frontend @critical @frontend

```gherkin
@frontend @critical @frontend
Scenario: MS-BDD-051 發起邀請後顯示等待
  Given A的候選清單已載入且B可配
  When A點想認識
  Then B卡片顯示等待回覆
  And 不直接開啟雙人房間
```

### MS-BDD-052：婉拒前先明示永遠不再配對

- [x] **Scenario: 婉拒前先明示永遠不再配對**
  **SPEC 對應**：`MS-AC-008`；**優先級**：critical；**標籤**：@frontend @critical @frontend

```gherkin
@frontend @critical @frontend
Scenario: MS-BDD-052 婉拒前先明示永遠不再配對
  Given B收到A的pending邀請
  And B可從探索卡或收到的邀請清單選擇婉拒
  When B點婉拒
  Then 顯示婉拒後你們將無法再次互相配對
  And 只有B確認後才送出decline
```

### MS-BDD-053：取消邀請顯示非永久拒絕

- [x] **Scenario: 取消邀請顯示非永久拒絕**
  **SPEC 對應**：`MS-AC-006`；**優先級**：normal；**標籤**：@frontend @normal

```gherkin
@frontend @normal
Scenario: MS-BDD-053 取消邀請顯示非永久拒絕
  Given A正在檢視自己送出的pending邀請
  When A按取消邀請
  Then 顯示已取消並更新列表
  And 不顯示永久封鎖文案
```

### MS-BDD-054：逾期邀請顯示已逾期

- [x] **Scenario: 逾期邀請顯示已逾期**
  **SPEC 對應**：`MS-AC-006`；**優先級**：normal；**標籤**：@frontend @normal

```gherkin
@frontend @normal
Scenario: MS-BDD-054 逾期邀請顯示已逾期
  Given B開啟已到期的邀請詳情
  When B重新載入狀態
  Then 顯示已逾期且接受鈕不可用
  And 不進入遊戲
```

### MS-BDD-055：接受成功兩端導向同一場遊戲

- [x] **Scenario: 接受成功兩端導向同一場遊戲**
  **SPEC 對應**：`MS-AC-007`；**優先級**：critical；**標籤**：@frontend @critical @frontend

```gherkin
@frontend @critical @frontend
Scenario: MS-BDD-055 接受成功兩端導向同一場遊戲
  Given A與B已互相確認
  When A與B各自開啟輪次入口
  Then 兩端都顯示同一roundId專屬房間
  And 沒有偽造劇情或假訊息
```

### MS-BDD-056：遊戲中配對入口被阻擋

- [x] **Scenario: 遊戲中配對入口被阻擋**
  **SPEC 對應**：`MS-AC-009`；**優先級**：critical；**標籤**：@frontend @critical @frontend

```gherkin
@frontend @critical @frontend
Scenario: MS-BDD-056 遊戲中配對入口被阻擋
  Given A已有active遊戲
  When A點配對入口
  Then 顯示遊戲進行中結束後才能重新配對
  And 可返回目前那場遊戲
```

### MS-BDD-057：第三方收到的邀請會顯示失效

- [x] **Scenario: 第三方收到的邀請依原因顯示安全文案**
  **SPEC 對應**：`MS-AC-009`；**優先級**：normal；**標籤**：@frontend @normal

```gherkin
@frontend @normal
Scenario Outline: MS-BDD-057 第三方邀請按受控失效原因安全顯示
  Given C曾向A發送一筆pending邀請
  And A發生<狀況>導致邀請invalidated
  When C重新登入或開啟邀請列表
  Then 頁面顯示「<提示文案>」
  And 後端保存invalidated_reason為<原因>
  And 不顯示新配對者、具體性向或個人資料變更細節
  And 不把本次失效視為永久婉拒

Examples:
  | 狀況 | 原因 | 提示文案 |
  | 與B開始另一場遊戲 | other_round_started | 對方目前無法配對，這次邀請已失效 |
  | 帳號停用或成年／正式化身等必要基本資格失效（非單純性向修改） | eligibility_changed | 配對條件已變更，請重新搜尋 |
```

### MS-BDD-058：切換裝置後恢復真配對狀態

- [x] **Scenario: 切換裝置後恢復真配對狀態**
  **SPEC 對應**：`MS-AC-013`；**優先級**：normal；**標籤**：@frontend @normal

```gherkin
@frontend @normal
Scenario: MS-BDD-058 切換裝置後恢復真配對狀態
  Given A已發pending或已有active round
  When A在另一裝置有效登入並重載
  Then 讀出持久化真狀態
  And 不以本機記憶陣列假冒已接受
```

### MS-BDD-059：網路中斷時不假裝邀請成功

- [x] **Scenario: 網路中斷時不假裝邀請成功**
  **SPEC 對應**：`MS-AC-013`；**優先級**：normal；**標籤**：@frontend @normal

```gherkin
@frontend @normal
Scenario: MS-BDD-059 網路中斷時不假裝邀請成功
  Given A按想認識後網路失去回覆
  When A檢視結果並重試進入列表
  Then 顯示狀態不明請重新整理
  And 先唯讀回查不盲目創第二筆
```

### MS-BDD-060：連點邀請按鈕不得重複發送

- [x] **Scenario: 連點邀請按鈕不得重複發送**
  **SPEC 對應**：`MS-AC-011`；**優先級**：normal；**標籤**：@frontend @normal

```gherkin
@frontend @normal
Scenario: MS-BDD-060 連點邀請按鈕不得重複發送
  Given A看到B候選且尚無pending
  When A連續快速點想認識
  Then 按鈕載入中禁用
  And server最終只有一筆有效邀請
```

### MS-BDD-061：分頁及同分排序穩定

- [x] **Scenario: 分頁及同分排序穩定**
  **SPEC 對應**：`MS-AC-001`；**優先級**：normal；**標籤**：@frontend @normal

```gherkin
@frontend @normal
Scenario: MS-BDD-061 分頁及同分排序穩定
  Given A可探索超過20名候選且含同分者
  When A翻下一頁
  Then 先為整個適格集合計分排序再分頁，顯示固定同分順序
  And 不顯示他人隱藏偏好分量
```

### MS-BDD-062：配對成功仍不可直接看真人照

- [x] **Scenario: 配對成功仍不可直接看真人照**
  **SPEC 對應**：`MS-AC-014`；**優先級**：critical；**標籤**：@frontend @critical @frontend

```gherkin
@frontend @critical @frontend
Scenario: MS-BDD-062 配對成功仍不可直接看真人照
  Given A與B已同意配對但未同意交換名片
  When A點進B人物資訊
  Then 只顯示安全角色內容
  And 不可取得私人R2照片或職業欄位
```

### MS-BDD-063：資料尚未完成提供返回設定入口

- [x] **Scenario: 資料尚未完成提供返回設定入口**
  **SPEC 對應**：`MS-AC-002`；**優先級**：normal；**標籤**：@frontend @normal

```gherkin
@frontend @normal
Scenario: MS-BDD-063 資料尚未完成提供返回設定入口
  Given A缺性別或未儲存性向
  When A開啟配對探索
  Then 顯示請先完成個人資料
  And 提供返回設定入口且不顯示其他人的資料
```

## 2026-11-06 補強場景：資料表解耦、既有邀請、按需人物卡與重建

### MS-BDD-064：只有符合配對資格才建立搜尋投影
- [x] **Scenario: 只有符合配對資格才建立搜尋投影**
  **SPEC 對應**：`MS-AC-005`；**優先級**：critical；**標籤**：@happy-path @critical
```gherkin
@happy-path @critical
Scenario: MS-BDD-064 只有符合配對資格才建立搜尋投影
  Given A已註冊且user_profiles已存在但未完成必要欄位
  When A先儲存未完成個人資料再完成成年生日性別性向與正式化身
  Then 未完成階段沒有match_conditions且資料仍保留在user_profiles
  And 完成階段在match_conditions建立一筆accountId唯一的搜尋投影
  And 條件表不保存source_profile_revision，也不驗證兩表revision是否相同
```

### MS-BDD-065：失去資格即移除投影但不提前終止遊戲
- [x] **Scenario: 失去資格即移除投影但不提前終止遊戲**
  **SPEC 對應**：`MS-AC-005`、`MS-AC-009`；**優先級**：critical；**標籤**：@edge-case @critical
```gherkin
@edge-case @critical
Scenario: MS-BDD-065 失去資格即移除投影但不提前終止遊戲
  Given A已有合格match_conditions且正在active遊戲
  When A把性向設為空並成功保存個人資料
  Then match_conditions投影原子移除且A不再被新搜尋探索
  And game_rounds與game_round_participants仍有效直到合法結束
  And A先前已發出的pending不因單純性向修改自動失效
```

### MS-BDD-066：既有待決邀請不依賴現行搜尋投影
- [x] **Scenario: 既有待決邀請不依賴現行搜尋投影**
  **SPEC 對應**：`MS-AC-007`、`MS-AC-012`；**優先級**：critical；**標籤**：@alternative @critical
```gherkin
@alternative @critical
Scenario: MS-BDD-066 既有待決邀請不依賴現行搜尋投影
  Given A與B建立pending時已互相相容
  And B之後清空性向但仍為成年且持有有效化身與帳號
  When B在有效期限內主動接受該pending
  Then 不要求B當下存在match_conditions而成功成立game_rounds
  And 原邀請不被誤標為eligibility_changed或declined
```

### MS-BDD-067：修改性向只影響後續探索與新邀請
- [x] **Scenario: 修改性向只影響後續探索與新邀請**
  **SPEC 對應**：`MS-AC-002`、`MS-AC-012`；**優先級**：critical；**標籤**：@alternative @critical
```gherkin
@alternative @critical
Scenario: MS-BDD-067 修改性向只影響後續探索與新邀請
  Given A與B已有有效pending且A修改性向使B不再互容
  When A搜尋新候選或對其他人發起新邀請
  Then 新操作以最新match_conditions驗雙向相容
  And 原A與B的pending保留至本身終局事件
```

### MS-BDD-068：登入後按Profile與遊戲狀態導引
- [x] **Scenario: 登入後按Profile與遊戲狀態導引**
  **SPEC 對應**：`MS-AC-005`、`MS-AC-009`；**優先級**：critical；**標籤**：@frontend @critical
```gherkin
@frontend @critical
Scenario Outline: MS-BDD-068 登入後導向正確入口
  Given A已有效登入且處於<狀態>
  When 登入成功或恢復有效Session且完成Profile與遊戲狀態查詢
  Then 不需使用者手動點擊即自動導向<入口>
Examples:
  | 狀態 | 入口 |
  | profileReady為false | /profile完成資料 |
  | profileReady且無active遊戲 | 配對探索頁 |
  | 存在active遊戲 | 目前game_rounds遊戲入口 |
```

### MS-BDD-069：先全量排序再按需取安全候選
- [x] **Scenario: 先全量排序再按需取安全候選**
  **SPEC 對應**：`MS-AC-001`、`MS-AC-005`、`MS-AC-012`；**優先級**：critical；**標籤**：@frontend @critical
```gherkin
@frontend @critical
Scenario: MS-BDD-069 先全量排序再按需取安全候選
  Given A有超過一頁候選且其中高分者不在原始DB前20筆
  When A搜尋並滑至排名下一位候選
  Then API先對全部適格候選計分排序再分頁只回ID分數與邀請狀態
  And 畫面按需GET該候選安全人物卡並預取少量後續項
  And 不能讀到Email生日私人性向偏好真人照片或過期不可配對資料
```

### MS-BDD-070：兩個同時接受仍只有一場遊戲
- [x] **Scenario: 兩個同時接受仍只有一場遊戲**
  **SPEC 對應**：`MS-AC-011`；**優先級**：critical；**標籤**：@edge-case @critical
```gherkin
@edge-case @critical
Scenario: MS-BDD-070 兩個同時接受仍只有一場遊戲
  Given B與C同時與A發生有效邀請接受操作
  When 真D1並行建立兩個game_rounds與game_round_participants
  Then game_round_participants.account_id唯一約束只允許A占用一場
  And 失敗交易的round邀請與第三人邀請無任何部分提交
```

### MS-BDD-071：遊戲結束不能讓未合格玩家進入候選
- [x] **Scenario: 遊戲結束不能讓未合格玩家進入候選**
  **SPEC 對應**：`MS-AC-009`、`MS-AC-010`；**優先級**：critical；**標籤**：@edge-case @critical
```gherkin
@edge-case @critical
Scenario: MS-BDD-071 遊戲結束不能讓未合格玩家進入候選
  Given A在active遊戲中變成profileReady為false且已移除match_conditions
  When A合法結束遊戲並解除占用
  Then game_rounds保留ended歷史
  And A在重新完成Profile前仍不能被探索
```

### MS-BDD-072：原有待決邀請保留方向與回覆入口
- [x] **Scenario: 原有待決邀請保留方向與回覆入口**
  **SPEC 對應**：`MS-AC-006`、`MS-AC-007`；**優先級**：critical；**標籤**：@frontend @critical
```gherkin
@frontend @critical
Scenario: MS-BDD-072 原有待決邀請保留方向與回覆入口
  Given A對B有outgoing pending且C對A有incoming pending
  When A開啟探索排序列表與邀請頁
  Then B顯示等待回覆不可再送同一筆
  And C的incoming仍可在邀請頁接受而不被差集排除
```

### MS-BDD-073：未上線測試環境清除重建而非搬移
- [x] **Scenario: 未上線測試環境清除重建而非搬移**
  **SPEC 對應**：`MS-AC-012`；**優先級**：critical；**標籤**：@edge-case @critical
```gherkin
@edge-case @critical
Scenario: MS-BDD-073 未上線測試環境清除重建而非搬移
  Given 明確標示並確認了DatingHigh的非正式測試資料環境
  When 依部署作業清除測試資料並套用新的四表Schema
  Then 不執行舊Schema到新Schema的ETL或雙軌相容
  And 新建測試帳號與私有R2殘留資產的清理範圍一致
  And 未指定的遠端環境或正式資料絕不可被清除
```

### MS-BDD-075：無關照片排序不影響配對資格
- [x] **Scenario: 無關照片排序不影響配對資格**
  **SPEC 對應**：`MS-AC-005`、`MS-AC-012`；**優先級**：critical；**標籤**：@edge-case @critical
```gherkin
@edge-case @critical
Scenario: MS-BDD-075 無關照片排序不影響配對資格
  Given A的match_conditions已存在且符合配對資格
  When A只修改真人照片排序或名片分享設定並成功保存，導致user_profiles.revision增加
  Then match_conditions的配對條件及updated_at保持不變
  And A仍可被其他合格玩家探索，不需要兩表revision相等
```

### MS-BDD-074：個人資料與搜尋投影不可部分提交
- [x] **Scenario: 個人資料與搜尋投影不可部分提交**
  **SPEC 對應**：`MS-AC-005`、`MS-AC-012`；**優先級**：critical；**標籤**：@error-handling @critical
```gherkin
@error-handling @critical
Scenario: MS-BDD-074 個人資料與搜尋投影不可部分提交
  Given A修改了性向、成年生日、有效化身或其他會影響配對資格／分數的資料
  When 真D1同步match_conditions新增／更新／刪除發生約束失敗或不符合預期的0 changes
  Then 配對相關的user_profiles變更與match_conditions不能部分提交
  And 任何未能確認同步完成的配對結果必須fail-closed，不得以舊條件錯誤配對
```
## 前端 SPEC 覆蓋

| 類型 | 覆蓋範圍 |
|---|---|
| 候選頁 | 初始載入、先全量評分排序再分頁、按需安全人物卡、空狀態、未就緒導引、遊戲中限制 |
| 邀請頁 | incoming/outgoing 方向、發送、等待、取消、逾期、舊邀請不因性向修改失效、婉拒提醒與兩種安全失效原因 |
| 專屬輪次入口 | 雙方確認、重登恢復、禁止未授權名片與真人照 |
| UX 安全 | Loading／重複點擊、網路不明回覆、陳舊候選刷新、非本人授權 |

**SPEC 補充**：14 項 `MS-AC` 均已映射；原63場景保留ID並修正 BDD-043／045／049／057／061，新補 BDD-064～075 共12項；無暫停探索，原pending不因性向更動失效。新風險與TDD對照見相應TDD／RiskAudit；逐案執行證據見[Verification](../verification/SPEC-001-MatchingSessions-Verification.md)及[追溯JSON](../verification/matching-sessions-traceability.json)。

## 相關文件

- [MVP](../requirements/MVP-001-LoveGameDatingApp.md)
- [SDD](../specs/SPEC-001-MatchingSessions.md)
- [TDD](../tdd/SPEC-001-MatchingSessions-TDD.md)
- [RiskAudit](../specs/SPEC-001-MatchingSessions-RiskAudit.md)

**最後更新**：2026-11-06；**狀態**：已移除配對投影跨表revision綁定，加入無關個資異動不影響探索的驗收；75/75本份業務斷言覆核；完整Story退出E2E仍未驗收（BDD-057／068 為 Scenario Outline，均各計一個場景 ID）。
