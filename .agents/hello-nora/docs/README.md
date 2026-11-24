# Hello Nora！你的 AI 行銷團隊
<p align="left">

  <img src="images/fullteam.png" alt="Hello Nora AI 行銷團隊" width="600">

</p>

**嗨！歡迎加入**

這裡是你的行銷團隊大本營——五位 AI 同事、八個單元的教學、可安裝使用的指令包，全收在這份工具目錄裡。你不用到處翻，下面的課程目錄點一下就跳到對應單元，這份 README 就是你的地圖。

還沒上手沒關係，從 Unit 0 開始就好：先把團隊裝起來、教 AI 記住你的品牌，後面再一位一位把同事請進來。

有任何不懂的，都可以直接問你自己的 AI，每跟它一起解決一次問題，它就更懂你、更貼近你的品牌，你的團隊會越養越強，慢慢長成真正屬於你的那一支。真的還搞不定，我們也都在😊

---

> 一個能立即上工的 AI 行銷團隊，丟進你的 AI 就會動起來。



## 使用能力

安裝需要 Python 3.10 以上與目標專案的檔案讀寫權限；不需要 Git。使用技能的 AI 需能讀取專案 `.agents/skills/`。
問答、規劃、寫作與策略可直接使用；搜尋、圖像生成、MCP、API、命令執行與排程則依環境實際提供的能力啟用。
缺少工具時，團隊提供可手動發布的內容，或分析你貼上的真實數據。Leon 維持提供生圖 brief。

⚠️ 表示注意事項，✏️ 表示可交辦的指令，✅ 表示驗收結果。平台 OAuth／API 權限仍需另外設定。

## 這是什麼？

一包可以立刻上工的小型 AI 行銷團隊。安裝流程統一見 [INSTALL.md](<INSTALL.md>)。

你只需要開口跟 **Nora（營運長）** 說話，她會自動把任務派給最適合的夥伴，幫你把事情做完：

```
你 → Nora → Maya / Leon / Iris / Jack → 產出
```

---

## 你的 5 位 AI 同事

<table>
  <tr>
    <td colspan="4" align="center">
      <b>👑 Nora｜營運長</b><br>
      <sub>你唯一需要說話的人——她替你管理整個團隊，任務派發、進度追蹤、團隊週報一手包辦</sub>
    </td>
  </tr>
  <tr><td colspan="4"><br></td></tr>
  <tr>
    <td align="center" width="25%">
      <b>✍️ Maya</b><br>
      <sub>社群小編</sub><br><br>
      貼文排程＋一稿多發<br>
      <sub>FB／IG／Threads／LINE<br>輪播圖卡・留言私訊回覆</sub>
    </td>
    <td align="center" width="25%">
      <b>🎨 Leon</b><br>
      <sub>設計總監</sub><br><br>
      頁面＋視覺＋影片<br>
      <sub>Landing/Sales Page<br>輪播圖卡・影片上字幕</sub>
    </td>
    <td align="center" width="25%">
      <b>🔍 Iris</b><br>
      <sub>SEO 策略師</sub><br><br>
      關鍵字＋寫文章<br>
      <sub>SEO/GEO・GSC 分析<br>競品持續監控</sub>
    </td>
    <td align="center" width="25%">
      <b>📊 Jack</b><br>
      <sub>廣告投放手</sub><br><br>
      投放＋數據＋優化<br>
      <sub>Meta 數據週報<br>Hook・漏斗・腳本</sub>
    </td>
  </tr>
</table>

> Nora 還會：**策略分析**（看數據給方向）、**幫你接平台**（防呆設定精靈）、**出客戶簡報**。詳見下方指令小抄。

> ℹ️ **關於「自動」的說明**：需要檔案／命令、MCP／API 與對應平台權限，定時執行另需排程。沒接也能手動發文、貼數據分析。

---

## 🚀 快速安裝

指定目標專案，先預覽，再執行：

```text
python "<工具位置>/scripts/install.py" --project-root "<目標專案>"
python "<工具位置>/scripts/install.py" --project-root "<目標專案>" --install
```

技能固定安裝到目標專案 `.agents/skills/`，品牌沿用 `_brand*`；既有資料只補缺少的模板。
支援中文與空白路徑、有 Git 或無 Git 的專案。同名非管理技能或已修改的管理檔案會停止並列出衝突。
安裝不會修改使用者家目錄的技能，也不會自動開啟平台權限。完整更新與移除方式見 [INSTALL.md](<INSTALL.md>)。

---

## 📚 課綱總覽（點單元或技能點，跳到對應教學文）

> **8 個單元、30+ 個技能點。** 每個技能點都是「**學一個 → 立刻做 → 當場驗收**」——一路打勾，團隊就建起來了。
> 安裝已在 Unit 0 一次完成，之後每個單元都是「先認識一位夥伴 → 馬上用他做事」。

> ❓ 卡關或有疑問？先看 **[常見問題 FAQ](<FAQ.md>)**——安裝排錯、未連線時能做什麼、AI 當機自救、怎麼聯絡我們，都在裡面。

### 📦 單元 00 ｜ 開始之前：環境建置

> 完全沒用過 AI？先把環境跟整個團隊一次裝好。

| # | 標題 | 補充說明 |
|:--:|------|------|
| 0-1 | [安裝 AI 工作環境 桌面版](<course/unit-0-setup.md>) | Mac 和 Windows 都能裝；AI 工作環境 已原生支援 Windows，不需要 WSL |
| 0-2 | [一次裝好整個團隊](<course/unit-0-setup.md>) | 用統一安裝器預覽、安裝五位成員＋所有指令 |
| 0-3 | [填寫你的品牌資料](<course/unit-0-setup.md>) | 填好語氣、產品、理想客戶，團隊才會「懂你」、產出才貼近你的風格 |
| 0-4 | [開啟安全防護](<course/unit-0-setup.md>) | 幫 AI 加上危險指令防護，避免不小心刪掉或改壞重要檔案 |

### 👑 單元 01 ｜ Nora 營運長

> 你唯一需要說話的人——她替你調度全隊、追蹤進度。

| # | 標題 | 補充說明 |
|:--:|------|------|
| 1-1 | [任務拆解與派工](<course/unit-1-nora.md>) | 你說「我要推新課」，她自動拆解成一串任務、分派給最適合的夥伴 |
| 1-2 | [進度追蹤 + 團隊週報](<course/unit-1-nora.md>) | 一句話請她彙整這週做了什麼、成效如何、下週該優先做什麼 |
| 1-3 | [策略分析（看數據給方向）](<course/unit-1-nora.md>) | 看你的數據和現況，告訴你接下來最該集中火力的幾件事 |
| 1-4 | [出客戶／老闆簡報](<course/unit-1-nora.md>) | 用指令 `/deck` 把成果做成給老闆或客戶看的成效投影片 |
| 1-5 | [防呆精靈幫你接平台](<course/unit-1-nora.md>) | 用指令 `/setup` 一步步把 FB／IG／LINE／廣告接起來，每步即時驗證 |

### ✍️ 單元 02 ｜ Maya 社群小編

> FB／IG／Threads／LINE 的內容，她全包。

| # | 標題 | 補充說明 |
|:--:|------|------|
| 2-1 | [寫貼文 / Hook](<course/unit-2-maya.md>) | 給你完整貼文，或一次多個開頭讓你挑，附上 hashtag 和配圖建議 |
| 2-2 | [排一週貼文行事曆](<course/unit-2-maya.md>) | 7 天發什麼一次排好，對照台灣行銷節日幫你借勢檔期 |
| 2-3 | [一稿多發](<course/unit-2-maya.md>) | 同一個主題針對 FB／IG／LINE 各裂變一版，不是複製貼上 |
| 2-4 | [IG 輪播圖卡](<course/unit-2-maya.md>) | 拆成封面 Hook、重點卡、CTA，再交給 Leon 套品牌色出圖 |
| 2-5 | [回留言 / 私訊](<course/unit-2-maya.md>) | 把留言貼或截圖給她，依你的品牌語氣逐則建議回覆 |
| 2-6 | [FB 自動發文 / LINE 群發](<course/unit-2-maya.md>) | 接好帳號後直接發布；FB 自動發文需先完成單元 07 的串接 |

### 🎨 單元 03 ｜ Leon 設計總監

> 頁面、視覺、影片，一次到位。

| # | 標題 | 補充說明 |
|:--:|------|------|
| 3-1 | [Landing Page](<course/unit-3-leon.md>) | 完整 HTML 頁面，逐區塊的標題、文案和視覺建議，可直接預覽 |
| 3-2 | [Sales Page](<course/unit-3-leon.md>) | 從痛點、好處、社證到保證和 CTA 的完整銷售頁文案＋結構 |
| 3-3 | [IG 輪播圖卡](<course/unit-3-leon.md>) | 套你的品牌色出整組圖卡，自動輸出成精準尺寸 PNG（或一卡一頁 PDF），不用手動截圖 |
| 3-4 | [廣告圖 brief](<course/unit-3-leon.md>) | 給你一份貼進 圖像生成工具就能用的完整生圖指示 |
| 3-5 | [影片上字幕 / 轉直式](<course/unit-3-leon.md>) | 你提供素材，幫你自動上中文字幕、轉成 9:16 直式 Reels |
| 3-6 | [圖片影片托管](<course/unit-3-leon.md>) | 自動上傳拿到永久公開連結，方便 Maya 發文時直接引用 |

### 🔍 單元 04 ｜ Iris SEO 專員

> 讓 Google 和 AI 都找得到你。

| # | 標題 | 補充說明 |
|:--:|------|------|
| 4-1 | [關鍵字研究](<course/unit-4-iris.md>) | 教你用 Google 免費工具查到飽，給你分類好、標好優先順序的關鍵字 |
| 4-2 | [寫完整 SEO 文章](<course/unit-4-iris.md>) | 不只大綱，直接寫整篇；有網站寫部落格版、沒網站寫 FB 長文版 |
| 4-3 | [GEO 生成式引擎優化](<course/unit-4-iris.md>) | 優化內容，讓 ChatGPT、Perplexity、Google AI 回答時也引用你 |
| 4-4 | [競品分析 + 持續監控](<course/unit-4-iris.md>) | 拆解對手的內容結構、強弱項，找出你的切入點，並定期幫你盯 |
| 4-5 | [GSC 搜尋成效分析](<course/unit-4-iris.md>) | 有網站的話，幫你讀 Search Console 數據、找出值得加碼的頁面 |

### 📊 單元 05 ｜ Jack 廣告投放手

> 廣告不再燒錢看運氣。

| # | 標題 | 補充說明 |
|:--:|------|------|
| 5-1 | [廣告文案 / Hook](<course/unit-5-jack.md>) | 用痛點／好處／社證／敘事／爭議 5 種公式給你 hook，建議先測哪個 |
| 5-2 | [影片廣告腳本](<course/unit-5-jack.md>) | 照鉤子→痛點→方案→證明→行動的五大架構，寫成可直接拍的腳本 |
| 5-3 | [受眾 + 預算規劃](<course/unit-5-jack.md>) | 用冷／暖／熱三層漏斗幫你分配預算、建議開幾組廣告組合 |
| 5-4 | [廣告數據週報](<course/unit-5-jack.md>) | 自動拉 Meta 數據（或你貼數字），告訴你該加碼、暫停還是換素材 |
| 5-5 | [兩階段投放](<course/unit-5-jack.md>) | 沒投過廣告也行，先了解你的現況，再一步步帶你規劃第一波 |

### 🤝 單元 06 ｜ 全隊協作

> 讓 Nora 統一調度，跑一場完整的行銷作戰。

| # | 標題 | 補充說明 |
|:--:|------|------|
| 6-1 | [一句話啟動全隊作戰](<course/unit-6-full-team.md>) | 例如「規劃下個月新課上市」，Nora 調度全隊一起完成整套行銷 |

### 🔧 單元 07 ｜ 串接 Meta 自動化（選用）

> 進階單元：讓 Maya 直接幫你發文。**需 可執行平台 API 的環境 + Facebook 粉專。**

| # | 標題 | 補充說明 |
|:--:|------|------|
| 7-1 | [FB 自動排程 ／ IG 即時發](<course/unit-7-meta.md>) | Maya 排完行事曆：FB 可排程到未來自動發，IG 只能即時發（IG 不支援未來排程；需平台連線與命令執行能力） |
| 7-2 | [自動回覆留言](<course/unit-7-meta.md>) | 設定回覆規則，Maya 幫你自動回貼文留言（需平台連線與命令執行能力） |
| 7-3 | [競品廣告分析](<course/unit-7-meta.md>) | 查任意品牌在 Meta 廣告庫的在投廣告，拿來做競品研究 |
| 7-4 | [過往貼文表現分析](<course/unit-7-meta.md>) | 拉出你自己貼文的觸及、互動數據，分析哪種內容最有效 |

> 從 Unit 0 開始，照順序走完。Unit 7 為選用單元，需要平台連線、API 執行能力與 Facebook 粉絲專頁。

---

## ⚡ 指令總覽小抄（你可以對團隊說這些）

> 不用背——直接用白話跟 Nora 說也通。這張是給你快速參考。

> 🌐 **想用英文？** 預設是繁體中文；直接用英文跟 Nora 說，或跟她說「**use English**」，整個團隊就會全程改用英文跟你對話、產出英文內容（想切回中文跟她說一聲就好）。
> *Prefer English? Just talk to Nora in English (or say "use English") and the whole team will switch — chat and deliverables — for the rest of the session.*

> 斜線指令需環境支援技能探索；不支援斜線時，請指定技能名稱與 SKILL.md。自動操作需先連線平台。

### 🚀 一鍵指令
| 指令 | 做什麼 |
|------|--------|
| `/hello-nora` | 叫出 Nora，開始對話 |
| `/setup` | 防呆設定精靈——帶你把 FB／IG／LINE／廣告接起來 |
| `/report` | 策略彙整報告——看你的數據，給你下一步該怎麼做 |
| `/deck` | 客戶成效簡報——把成果做成給老闆／客戶看的投影片 |
| `/ad` | 一鍵廣告文案 |
| `/post` | 一鍵社群貼文 |
| `/sales` | 一鍵銷售信 |
| `/brand-setup` | 品牌建置精靈（第一次用先跑這個）|

### 💬 直接用白話交辦（Nora 自動派工）
| 你說 | 誰接手 |
|------|--------|
| 「排這週的貼文」「幫我回留言」「發 LINE」 | Maya |
| 「做一個銷售頁」「這篇做成輪播圖卡」「影片上字幕」 | Leon |
| 「找關鍵字」「寫一篇 SEO 文章」「競品有什麼動靜」 | Iris |
| 「看我的廣告數據」「這支該加碼還暫停」「寫廣告 Hook」 | Jack |
| 「給我策略建議」「我接下來該做什麼」 | Nora（策略分析）|
| 「**補充產業知識**」「這個領域的資料給你」 | Nora（存進知識庫，全隊共用）|
| 「**幫我查一下 XX 這個主題**」 | Nora／Iris（自己上網查，整理成可用的資料）|
| 「**新增品牌**」「我有另一個客戶」「切換到 XX 品牌」 | Nora（多品牌管理）|
| 「更新團隊」 | Nora（來源更新後另行確認同步）|

### 🛠️ 維護
| 指令 | 做什麼 |
|------|--------|
| `/health-check` | 檢查設定還正不正常（抓 token 過期）|
| 「更新團隊」 | 先三方更新工具，確認後再同步專案|

---

## AI 工作流設定包

不只「擁有」團隊，還幫你**真的接起來、跑起來、不出包**：

- **`/setup` 防呆設定精靈**——一步步接平台，每步即時驗證、卡關截圖帶路、報錯自動診斷
- **`/health-check`**——實測當下已失效的 token，避免某天突然不能用
- **帳號安全護欄**——發文/群發前確認＋節流，避免帳號被封
- **資源盤點 + 戰情記錄**——團隊記得你做過什麼，策略分析才有依據
- **工作流知識庫**——漏斗素材表、台灣行銷節日曆、FAQ 範本、競品觀察清單

> 啟用：裝好後跟 Nora 說「**幫我設定**」即可。完整說明見 [resources/ai-workflow-pack.md](<resources/ai-workflow-pack.md>)

> **還送你 [30 個實戰 Prompt ](<resources/30-prompts.md>)**——上市衝刺、一篇文章榨成一週素材、競品逆向工程…複製貼上就能跑的情境組合技，挑你正要做的那件事開始。

---

## 🔄 來源更新與專案同步

跟 Nora 說「更新團隊」，會轉到工具內的 [update-hello-nora-source](<../../../tools/hello-nora-main/.agents/skills/update-hello-nora-source/SKILL.md>)。
來源網址記在 `.maintenance/source-lock.json` 的 `repository`，已整合版本記在 `commit`；`source_observation` 另記遠端查核時間與結果。
更新先取得舊、新 commit 的完整來源 patch 與增刪改／重新命名，再深入讀取變更檔與受影響關聯，依需要擴大為全範圍閱讀。
以舊來源、目前通用化版本和新來源做三方比較，在暫存區保留新舊快照並合併、驗證；相同 commit 且本地稽核通過時直接回報無更新。
只保留局部 AGENTS.md 明列的通用化差異；其餘業務更新逐字帶入，衝突未解決不推進來源紀錄。
最後回報能力變更、例外與驗證結果，**明確詢問是否同步至所在專案根目錄技能；收到同意才執行安裝器**。
來源取得失敗時保持工具與已安裝技能不變。這個流程不會直接從來源覆蓋已安裝技能。

---

## 資料夾結構

```
hello-nora/
├── README.md                  ← 你在這裡
├── INSTALL.md                 ← 安裝步驟
├── FAQ.md                     ← 常見問題（卡關自救、聯絡我們）
├── BRAND-SETUP.md             ← 品牌資料填寫指引
├── AGENTS.md                  ← 局部維護規範與通用化邊界
├── scripts/                   ← 安裝器與來源更新輔助程式
├── tests/                     ← 隔離專案回歸驗證
├── .maintenance/              ← 來源鎖定、完整清單、SHA-256 與精確差異理由
├── .agents/skills/            ← 來源更新技能（保留在工具內）
│
├── skills/                    ← 由安裝器複製到目標專案 .agents/skills/
│   ├── _brand/                ← 品牌資料 + 產業知識庫 + FAQ／漏斗表／戰情記錄（節日曆在 maya-social/）
│   │                             （多品牌：另存成 _brand-客戶A/、_brand-客戶B/…）
│   ├── hello-nora/            ← Nora 營運長（入口，/hello-nora）
│   ├── maya-social/           ← Maya 社群
│   ├── leon-design/           ← Leon 設計
│   ├── iris-seo/              ← Iris SEO
│   ├── jack-ads/              ← Jack 廣告
│   ├── brand-setup/           ← 品牌建置精靈
│   ├── brand-check/           ← 品牌驗收
│   ├── health-check/          ← 設定當下有效性檢查
│   ├── safety-setup/          ← 依環境支援設定安全防護
│   ├── setup/                 ← 防呆設定精靈（/setup）
│   ├── report/                ← 策略報告（/report）
│   ├── deck/                  ← 客戶簡報（/deck）
│   └── ad/ post/ sales/       ← 快速指令
│
├── course/                    ← 教學單元（Unit 0–7）
├── resources/                 ← 設定包 + 30 個實戰 Prompt 食譜（ai-workflow-pack.md、30-prompts.md）
└── examples/                  ← 產出格式範例（示範數字不當成實際成效）
```

---

## 驗證範圍

以本 README 為驗收入口，來源固定在 `.maintenance/source-lock.json` 的 commit；完整來源清單與雜湊亦記在該檔。
每項保留來源差異的精確 diff 與理由見 `.maintenance/local-delta.json`。不以產品方案決定能否使用，也不從已排除版本併入能力。

| README 宣稱 | 驗證方式與邊界 |
|---|---|
| 五位角色、10 個輔助技能、完整工作流與素材 | 實測安裝後的檔案、引用與雜湊；五位角色與輔助技能逐份檢查格式 |
| 品牌建置、稱呼、多品牌、協作、策略與產出格式 | 逐段對照技能、課程、範例與來源差異；品牌／憑證保存有隔離回歸測試，實際對話品質未做外部模型評測 |
| 預覽、安裝、更新、衝突與移除 | 在中文／空白路徑、有 Git／無 Git 的隔離專案實測；含本地修改、其他技能、私有資料與連結邊界 |
| 來源增刪改、衝突、失敗與重跑 | 本機 Git fixture 模擬三方合併，確認業務原文保留、通用化差異仍在、失敗不推進鎖定、未同意不改專案技能 |
| 搜尋、生圖、Meta／LINE／WordPress／Cloudinary／Google／Canva 串接及排程 | 保留流程與能力條件；需真實帳號、工具與權限，本次未執行外部連線、發文、寄送、廣告操作或排程 |
| HTML／PDF／PNG、ffmpeg 字幕等交付 | 文件、腳本與隨附字型完整性已檢查；本次未執行瀏覽器渲染、影片轉檔或字幕品質驗收，保留原有平台實測限制 |
| 安全防護 | 流程要求核對環境支援並驗證；本次未修改任何 AI 執行環境的權限設定，不能宣稱防護已啟用 |

回歸與來源稽核命令（從工作區根目錄執行）：

```text
python -m unittest discover -s tools/hello-nora-main/tests
python tools/hello-nora-main/scripts/source_update.py audit
git diff --check
```
