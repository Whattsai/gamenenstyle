# Unit 7｜串接 Meta，讓 Maya 直接幫你發文

> 這個單元完成後，Maya 排好的貼文行事曆可以一鍵發到你的 Facebook 粉絲專頁和 Instagram。

<p align="left">
  <img src="../images/metasteup.png" alt="Hello Nora AI 行銷團隊" width="600">
</p>

> 🔍 **這跟 Jack 那個「看廣告數據」不是同一件事**：Jack 用的是 Meta 官方免費 MCP（貼個網址、登入就好，只負責「讀數據」）；**這個單元是「發文」**——要自己建一個 App、拿 Token，步驟比較多。兩件事各走各的，別搞混。

---

## 📌 開始之前：先看懂這張圖

這個單元 90% 的卡關，都是因為不知道自己現在在哪一步。整個流程只在做一件事——**換三次鑰匙**：

```
① 短期 User Token      ← Graph API Explorer 按鈕產生
   有效期：1~2 小時       ⚠️ 會很快過期，拿到後要一鼓作氣做完
        ↓ 用 curl 換
② 長期 User Token      ← 有效期 60 天
        ↓ 用 curl 換
③ Page Token           ← 這個才是最後要存起來的
   沒有固定到期日
```

**三個 Token 長得幾乎一模一樣（都是 `EAA...` 開頭的一長串），但用途完全不同。**
存錯一個，當下看起來會成功，但過幾小時或幾十天就突然發不出去。

> ⏱️ **時間壓力提醒：Step 3-3 到 Step 3-5 請一次做完，中間不要隔太久。**
> ①號 Token 只有 1~2 小時效期。做到一半去吃飯、隔天再繼續，回來一定報錯，而且錯誤訊息不會告訴你是過期造成的。

---

## 你會解鎖的能力

| 功能 | 說明 |
|------|------|
| **FB 自動排程 ／ IG 即時發** | **FB** 可指定未來時間自動排程（設好就走，電腦關了 Meta 也會幫你發）；**IG 請當成「只能現在發」**——官方發布文件沒有記載排程參數，要定時發 IG 得靠你自己的排程工具在那個時間觸發。詳見 Step 6 |
| **留言回覆（半自動）** | 設定回覆規則，你在線時 Maya 幫你一次回完留言。⚠️ 這是半自動、不是 24 小時無人值守——電腦關了就不會跑，要全天自動回得用 ManyChat／Meta 內建工具 |
| **競品廣告分析** | 查任意品牌在 Meta 廣告庫的在投廣告，拿來做競品研究 |
| **過往貼文表現分析** | 拉出你自己的貼文數據，讓 Maya 分析哪種內容最有效。⚠️ Meta 在 2026 年 6 月起陸續汰換舊的「觸及（reach）」相關指標，改用新的 Media Views／Page Viewer 指標。如果 Maya 抓到的數據欄位是空的，多半是指標改名了，不是 Token 壞掉 |

---

## ⚠️ 前置需求

- 可讀寫專案檔案、執行 API 請求的 AI 環境
- **Facebook 粉絲專頁**（不支援個人帳號）
- **你必須是這個粉絲專頁的「管理員」**，也會是等一下自己建的那個 App 的管理員（兩個都是你本人，沒問題）
- Instagram **商業帳號**，並連結到上面的粉絲專頁（只發 FB 的話不需要）
- 一個能打指令的終端機（Windows 用 PowerShell，Mac 用「終端機」——後面會教怎麼開）

---

## 🚫 三個「千萬不要做」（做了會整個卡死）

**① 不要用「商業管理平台」建系統用戶（System User）**

有學員自己跑去 Meta 商業管理平台（Business Manager）建了一個系統用戶來管粉專，結果所有權限都設定對了，最後卡在「**需要商業驗證**」動彈不得——因為一旦走 Business Manager 的系統用戶架構，Meta 政策就要求先通過商業驗證才會放行寫入類權限。

**本單元請全程走「開發模式 + 你自己的個人帳號」這條路**，不需要商業驗證、不需要送審。

**② 不要請求「你還沒在 App 裡啟用」的權限**

Graph API Explorer 的權限欄位可以自己打字加，但**只有你已經在 App「使用案例」裡啟用的權限才有效**。請求沒啟用的權限，授權視窗會直接顯示「目前無法取得內容 / Invalid Scopes」，整個流程跑不下去。

所以順序不能顛倒：**先去 App 啟用（Step 3-2）→ 再回 Explorer 請求（Step 3-3）**。

**③ 不要把 App Secret 或 Token 貼給任何人，包含 AI**

包含不要貼進 AI 對話、不要貼進 LINE 群組、不要 push 上 GitHub。這串字等於你粉專的鑰匙。詳見 Step 4 的安全設定。

---

## ⚠️ 安全提醒：自動化要「像真人」，別像機器人

透過 API 自動發文、自動回覆很方便，但 Meta 會盯「異常行為」——短時間狂發、罐頭式秒回大量留言、頻率高到不像人，都可能被判定為濫用，輕則限流、重則**封鎖粉專或停用 App**。

- 發文**排程分散**，別一次灌爆、別幾秒一篇
- 自動回覆**設少數幾個情境**（例如問價格才回），不要每則留言都自動回
- 重要的、對外的內容，**發出前讓 Maya 先給你確認**，不要全自動放生
- 這是你的主要資產，寧可慢一點、穩一點

---

## Step 1：建立 Meta 開發者帳號

1. 前往 **[developers.facebook.com](https://developers.facebook.com)**
2. 右上角點「開始使用」→ 用你的 Facebook 帳號登入
3. 完成開發者身份驗證（手機號碼驗證即可）

> ⚠️ **如果你有多個 Facebook 帳號（主號、小號），請確認你登入的是「管理那個粉專的帳號」。** 這一步登入錯，後面每一步都會錯，而且錯誤訊息不會告訴你原因。

完成後你會進入 Meta for Developers 主控台。

<!-- TODO 截圖：開發者主控台首頁 -->

---

## Step 2：建立一個 App

1. 點「我的應用程式」→「建立應用程式」
2. 「使用案例」步驟：點左側「**內容管理**」，勾選這兩個：
   - ✅ **管理粉絲專頁的所有內容**（FB 發文、排程、互動數據）
   - ✅ **管理 Instagram 的訊息和內容**（IG 發文、回覆留言）
3. 填寫：
   - App 名稱：隨便取，例如「我的行銷助手」
   - App 聯絡 Email：填你的 email
4. 點「建立應用程式」

> 💡 **為什麼要選使用案例？** 選了之後，App 才會有「管理粉絲專頁所有內容」這個使用案例，後面 Step 3 才能啟用 `pages_manage_posts` 權限。

> 💡 **不用送 Meta 審核、不用上架 App**：你建的 App 一直留在「開發模式」就好。開發模式下，這個 App 只能操作「**你自己有管理員權限的粉專**」——剛好就是你要發文的那個，所以完全夠用。

<!-- TODO 截圖：使用案例勾選畫面 -->

---

## Step 3：取得 Facebook 粉絲專頁的 Access Token

這是整個單元最關鍵、也最容易卡的一步。**請照順序做，不要跳。**

### 3-1：開啟 Graph API Explorer

1. 左側選單 → 「工具」→「**Graph API Explorer**」
2. 右上角「Meta App」選你剛建立的 App

<!-- TODO 截圖：Graph API Explorer 全景，圈出「Meta App 選單」「用戶或粉絲專頁」「權限區」「Generate Access Token 按鈕」四個位置 -->

---

### 3-2：先去 App 設定裡啟用權限（必做！）

Graph API Explorer 的下拉選單**只會顯示你已經在 App 裡啟用的權限**。所以要先去開起來，不然等一下 3-3 會找不到。

1. 回到 App 主控板 → 左側點「**使用案例**」
2. 找到「**管理粉絲專頁所有內容**」→ 點「**自訂**」
3. 在權限清單裡把**這 7 個**全部啟用：

```
pages_show_list
pages_read_engagement
pages_read_user_content
pages_manage_posts
pages_manage_engagement
pages_manage_metadata
read_insights
```

4. **要發 IG 的話**，回到使用案例清單，找到「**管理 Instagram 的訊息和內容**」→ 點「自訂」→ 再啟用這兩個：

```
instagram_basic
instagram_content_publish
```

5. 完成後回到 Graph API Explorer，下拉選單就會出現這些權限了

---

#### 📋 為什麼是這幾個？（依 Meta 官方相依關係）

Meta 的權限有「**相依（Dependencies）**」關係——申請 A 權限，就必須連 B 一起帶上，少一個功能就不完整。以下依據 [Meta 官方權限參考文件](https://developers.facebook.com/docs/permissions/)：

| 你要的功能 | 主權限 | 官方規定的相依權限 |
|---|---|---|
| 發文 / 排程 | `pages_manage_posts` | `pages_read_engagement` + `pages_show_list` |
| 回覆、刪除留言 | `pages_manage_engagement` | **`pages_read_user_content`** + `pages_show_list` |
| 讀取粉絲留言／評分 | `pages_read_user_content` | `pages_show_list` |
| 讀粉專自己的貼文內容 | `pages_read_engagement` | `pages_show_list` |
| 看粉專數據 | `read_insights` | `pages_read_engagement` + `pages_show_list` |
| 讀 IG 帳號資訊 | `instagram_basic` | **`pages_read_user_content`** + `pages_show_list` |
| 發 IG | `instagram_content_publish` | `instagram_basic` + `pages_read_engagement` + `pages_show_list` |

> 🔴 **特別注意 `pages_read_user_content`：**
> 網路上（包含本課程舊版教材）曾流傳「這個權限已經被 Meta 移除、不要加」的說法，**這是錯的**。它目前仍是官方正式權限，而且是 **`pages_manage_engagement`（留言回覆）和 `instagram_basic`（IG）兩個功能的必要相依權限**。
>
> **少了它，你的留言回覆和 IG 發文都會壞掉。** 請務必啟用。

> 💡 `pages_show_list` 是幾乎所有權限的共同相依，一定要開。它就是讓 `me/accounts` 抓得到你粉專清單的那個權限。

---

#### 🚨 如果授權視窗跳出「目前無法取得內容 / Invalid Scopes」

錯誤訊息會長這樣：

```
Invalid Scopes: pages_read_user_content
```

**這不是「這個權限壞掉了」，也不是你操作錯誤。**

意思是：**你請求了一個「這個 App 沒有啟用」的權限。** 新版 Meta App 是用「使用案例」在管權限的——只有在使用案例裡啟用過的權限才能請求，請求沒啟用的就會被擋。

> 💡 這條規則適用**所有**權限，不只是訊息裡點名的那一個。同樣的錯誤也可能出現在 `read_insights`、`pages_manage_metadata` 等任何一個你沒先啟用的權限上。

**修法：回 Step 3-2，把這個權限在「使用案例」裡啟用起來，再重新產生 Token。**

> ⚠️ **不要用「把權限刪掉」來消除錯誤訊息。** 訊息裡點名的權限，很可能是某個功能的必要相依（例如 `pages_read_user_content` 就是留言回覆和 IG 的相依權限）。刪掉當下錯誤是消失了，但功能會壞——而且壞的時候不會有錯誤訊息告訴你原因。
>
> **只有在你確定完全不需要那個功能時**，才考慮從請求清單移除。

---

**如果你「明明沒勾」卻還是跳這個錯誤**，代表這個權限是從別的地方被自動帶進去的，去這三個地方找：

| 可能位置 | 怎麼處理 |
|---|---|
| **Facebook Login for Business 的 Configuration** | App 後台 → 左側「Facebook Login for Business」→「Configurations」→ 點進你在用的那組 → 檢查 Permissions 清單，把它刪掉存檔 |
| **你重複使用的舊網址** | 如果你是複製之前的授權連結重貼，網址裡本身就帶著舊的 `scope=` 參數。回 Graph API Explorer 重新按一次 Generate，不要重用舊連結 |
| **某個外部工具／腳本** | 如果彈窗是從別的工具點「連接 Facebook」跳出來的，scope 寫在那個工具的設定裡，要去那邊改 |

> 💡 **怎麼判斷是哪一種？** 看彈窗的網址。如果是 `facebook.com/v2X.0/dialog/oauth?...` 這種格式，就**不是**從 Graph API Explorer 來的，要去上表的後兩項找。

---

### 3-3：產生 Token（①號：短期 User Token）

1. 在 Graph API Explorer 的「用戶或粉絲專頁」選 **用戶權杖（User Token）**
2. 在「權限」區塊確認 3-2 那 7 個（要發 IG 就是 9 個）都有加進去
3. 點「**Generate Access Token**」
4. Facebook 跳出授權視窗 → 允許

> ⚠️ **授權視窗跳出來時，請再確認一次帳號。** 如果你有多個帳號，授權視窗有時會綁到**不是**管理粉專的那一個——那樣下一步 `me/accounts` 就抓不到你要的粉專（回傳會是空的 `{"data":[]}`）。授權視窗右上角可切換帳號。

5. 點 Token 欄位旁邊的**複製圖示**，把整串複製起來，先貼到記事本

**⏱️ 從這一刻開始計時，接下來的步驟請在 1 小時內做完。**

---

### 3-4：先確認你抓得到粉專（順便拿粉專 ID）

這一步**不是**在拿最終的 Token，只是先確認「權限有生效、抓得到你的粉專」，順便把粉專 ID 記下來。

在 Explorer 上方的輸入框改成：

```
me/accounts
```

點「提交」。正常會回傳類似這樣：

```json
{
  "data": [
    {
      "access_token": "EAAxxxxxxxxxxxxx...",
      "category": "Education",
      "name": "藍諾攝影學院",
      "id": "123456789012345"        ← 這個是「粉專 ID」，記下來
    }
  ]
}
```

✅ **這一步要拿的東西：`id` 欄位那串數字 = 你的粉絲專頁 ID。** 記到記事本。

❌ **這一步回傳的 `access_token` 不要用。** 它是從①號短期 Token 換來的，也是短期的，幾小時後就失效。要拿真正能長久用的，得繼續做 3-5。

> 🔴 **如果回傳是 `{"data": []}`（空的）**，代表：你登入的帳號不是這個粉專的管理員，或授權時綁錯帳號。回 3-3 重來，注意帳號。

---

### 3-5：換成長期 Token（要開終端機）

> 🔒 **安全提醒：App Secret 等於你 App 的密碼。不要給任何人，包括 AI、包括客服。以下指令請自己在終端機執行。**
>
> 這不只是我們的建議，也是 Meta 官方明文規定：換發長期 Token 的這個 API 呼叫**必須從伺服器端（或你自己的電腦）發出，不能放在瀏覽器或前端**，因為請求裡包含 App Secret。這也是為什麼這一步不能在 Graph API Explorer 網頁上做，要開終端機。

#### ▶ 先拿 App ID 和 App Secret

App 主控板 → **應用程式設定 → 基本資料**

- **App ID**：一串數字，直接看得到
- **App Secret**：預設隱藏，點「顯示」，會要你**再輸入一次 Facebook 密碼**確認身分

<!-- TODO 截圖：基本資料頁面，圈出 App ID 和 App Secret 的「顯示」按鈕（Secret 內容打碼） -->

---

#### ▶ 怎麼開終端機

**Windows：**
1. 按 `Win` 鍵，輸入「**PowerShell**」
2. 點「Windows PowerShell」開啟
3. 會看到一個藍底（或黑底）的視窗，游標在閃

**Mac：**
1. 按 `Command + 空白鍵`，輸入「**終端機**」
2. Enter 開啟

<!-- TODO 截圖：PowerShell 剛開啟的樣子（這張很重要，很多學員卡在「終端機是什麼」） -->

**開起來會像這樣**（藍底或黑底，最後一行有個閃爍的游標等你打字）：

```
Windows PowerShell
著作權 (C) Microsoft Corporation. 保留擁有權.

安裝最新的 PowerShell，取得新功能和改進功能！

PS C:\Users\你的使用者名稱> _
```

Mac 的話：

```
Last login: Thu Aug 14 16:20:31 on ttys000
你的電腦名稱:~ 你的使用者名稱$ _
```

> 💡 **看到 `>` 或 `$` 後面有游標在閃，就是準備好了。** 直接把指令貼上去按 Enter 就行。
>
> 🔴 **貼上的方式跟一般不一樣：** PowerShell 裡按 `Ctrl+V` 有時沒反應，可以改成**在視窗內按滑鼠右鍵**，就會自動貼上。Mac 終端機用 `Command+V` 正常。

---

#### ▶ 第一步：換成 60 天長期 User Token（②號）

> 🚨 **Windows 使用者請務必用 `curl.exe`，不是 `curl`。**
> PowerShell 內建的 `curl` 其實是另一個指令（`Invoke-WebRequest`），跑出來的畫面跟教學完全不一樣，很多人以為自己失敗了其實是成功的。加上 `.exe` 才是呼叫真正的 curl。

**Windows（PowerShell）：**
```powershell
curl.exe "https://graph.facebook.com/v26.0/oauth/access_token?grant_type=fb_exchange_token&client_id=你的AppID&client_secret=你的AppSecret&fb_exchange_token=你的短期UserToken"
```

**Mac（終端機）：**
```bash
curl "https://graph.facebook.com/v26.0/oauth/access_token?grant_type=fb_exchange_token&client_id=你的AppID&client_secret=你的AppSecret&fb_exchange_token=你的短期UserToken"
```

> 📌 **關於網址裡的 `v26.0`：** 這是撰寫本教材時 Meta 最新的 Graph API 版本（2026 年 7 月 29 日發布）。Meta 大約每 4~5 個月推出一個新版本，每個版本各自有約兩年的支援期。如果你未來看到 Graph API Explorer 上顯示的是更新的版本號，把指令裡的版本改成一致的即可，不影響流程。

**填好之後應該長這樣**（以下是假資料，示範格式用）：

```powershell
curl.exe "https://graph.facebook.com/v26.0/oauth/access_token?grant_type=fb_exchange_token&client_id=1234567890123456&client_secret=a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6&fb_exchange_token=EAAxZBk9ZC8ZDZD"
```

> 🔴 **最常見的三個填錯：**
> 1. **把中文字或全形括號留著沒刪**——`client_id=你的AppID` 要整個換成數字，`你的AppID` 這幾個字要刪掉
> 2. **等號前後多打空格**——`client_id = 123` ❌，要 `client_id=123` ✅
> 3. **把整串網址的雙引號刪掉**——**引號一定要留著**，否則網址裡的 `&` 會被終端機當成指令符號，指令直接壞掉

貼上後**按 Enter**。

**成功會回傳**（一長串，擠在同一行）：

```json
{"access_token":"EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx","token_type":"bearer","expires_in":5183944}
```

**在終端機裡實際看起來是這樣**（指令和回傳連在一起，中間沒有空行）：

```
PS C:\Users\你的使用者名稱> curl.exe "https://graph.facebook.com/v26.0/oauth/access_token?grant_type=fb_exchange_token&client_id=1234567890123456&client_secret=a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6&fb_exchange_token=EAAxZBk9ZC8ZDZD"
{"access_token":"EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx","token_type":"bearer","expires_in":5183944}
PS C:\Users\你的使用者名稱> _
```

> ✅ **只要看到 `{"access_token":...` 開頭的那行，就是成功了。** 游標會回到新的一行等你下一個指令，這是正常的，不是卡住。

👉 **`access_token` 冒號後面、雙引號裡面那一整串**，就是②號長期 User Token。複製到記事本。

> 💡 **看不清楚？** 整串擠在一起很難挑。把終端機的輸出全選複製，貼到記事本或 VS Code，再慢慢找 `"access_token":"` 後面到下一個 `"` 為止的內容。

> 🔴 **如果回傳的是錯誤訊息**，對照這張表：
>
> | 錯誤訊息關鍵字 | 原因 | 怎麼修 |
> |---|---|---|
> | `Error validating application` | App ID 或 Secret 填錯 | 回基本資料頁重新複製 |
> | `Session has expired` / `expired` | ①號 Token 已過期 | 回 3-3 重新產生，然後**馬上**回來做這步 |
> | `Invalid OAuth access token` | Token 複製時漏了頭尾 | 重新複製完整的 Token |
> | 畫面出現 `Invoke-WebRequest` 相關字樣 | 用了 `curl` 沒加 `.exe` | 改用 `curl.exe` |

**⚠️ 「用錯 curl」長什麼樣（Windows 專屬陷阱）**

如果你在 PowerShell 裡打 `curl` 而不是 `curl.exe`，畫面會變成一堆表格式的欄位，**看起來很像成功但找不到 token**：

```
PS C:\Users\你的使用者名稱> curl "https://graph.facebook.com/v26.0/oauth/access_token?..."

StatusCode        : 200
StatusDescription : OK
Content           : {"access_token":"EAAxxxxxxxx...","token_type":"bearer",...
RawContent        : HTTP/1.1 200 OK
                    Vary: Accept-Encoding
                    Content-Type: application/json
...
Headers           : {[Vary, Accept-Encoding], [Content-Type, application/json]...
```

看到 `StatusCode`、`RawContent`、`Headers` 這些欄位，就代表你用錯了。**加上 `.exe` 重跑一次**就會變成乾淨的 JSON。

> 💡 其實這種情況下 token 就藏在 `Content` 那一欄裡，硬挖也挖得到——但很容易複製到不完整的字串，還是重跑比較保險。

---

#### ▶ 第二步：用②號換 Page Token（③號，最終要的）

**Windows（PowerShell）：**
```powershell
curl.exe "https://graph.facebook.com/v26.0/me/accounts?access_token=第一步拿到的長期UserToken"
```

**Mac（終端機）：**
```bash
curl "https://graph.facebook.com/v26.0/me/accounts?access_token=第一步拿到的長期UserToken"
```

**成功會回傳**：

```json
{"data":[{"access_token":"EAAyyyyyyyyyyyyyyy...","category":"Education","name":"藍諾攝影學院","id":"123456789012345"}]}
```

👉 **這次的 `access_token`，就是你要的③號 Page Token。**

> ⚠️ **如果你管理多個粉專**，`data` 陣列裡會有好幾組，每組都有自己的 `access_token`。請用 `name` 或 `id` 對照，複製**你要發文的那一個粉專**底下的 token，不要隨便挑第一個。

---

### 3-6：✅ 驗證你拿對了（強烈建議做，30 秒）

拿到③號之後，先確認它真的對，不要等到發文失敗才回來查。

1. 前往 **[Access Token 偵錯工具](https://developers.facebook.com/tools/debug/accesstoken/)**
2. 把③號 Token 貼進去，點「偵錯」
3. **檢查這三欄：**

| 欄位 | 應該顯示 | 顯示別的代表 |
|---|---|---|
| **類型 (Type)** | `Page` | 顯示 `User` → 你複製到②號了，回第二步重來 |
| **到期時間 (Expires)** | `永不 / Never` | 顯示某個日期 → 你複製到短期的了，重做 3-5 |
| **範圍 (Scopes)** | 有 `pages_manage_posts` | 沒有 → 回 3-2 把權限開起來，再重做 3-3 |

三欄都對，才算真的完成 Step 3。

---

## Step 4：把 Token 存進專案私人設定

### 4-1：先做安全設定（做這步之前先做這個！）

你的 Token 會被存成一個純文字檔。**這個檔案外流 = 你的粉專被交出去。**

✏️ 在 AI 工作環境 輸入：

```
請依工具 manifest 找回 scripts/install.py，對此專案執行 --check-secrets。
檢查 .agents/skills/_brand*/ 與備份目錄；若已追蹤、已暫存或未受忽略，
停止並只列出路徑與處理方式，保留本機資料和 Git 索引，由我處理後再檢查。
```

> 🔴 **特別提醒有在用 GitHub 的同學：** 課程檔案是透過 GitHub 發送的，如果你習慣把整個資料夾 push 上去，**Token 會連著一起上傳**，而且公開 repo 是全世界都看得到。務必先確認 `.gitignore` 有擋掉。
>
> 🔴 **如果不小心已經傳上去了**：立刻去 App 後台 → 應用程式設定 → 基本資料 → **重設 App Secret**，然後回 Step 3 重新產一次所有 Token。舊的會立刻失效。只刪掉 GitHub 上的檔案沒有用，歷史紀錄裡還查得到。

---

### 4-2：建立設定檔

✏️ 在 AI 工作環境 輸入：

```
/maya-social 幫我建立 Meta 設定檔，先用空白的填空版本，我自己填 Token
```

Maya 會建立 `.agents/skills/_brand/meta-config.md`。

> 💡 **建議：讓 Maya 建「空白版」，你自己開檔案填 Token。**
> 如果直接把 Token 貼進對話叫 Maya 寫進去，Token 就會留在對話紀錄裡。自己填比較乾淨。

> 💡 打開 `_brand/` 只看到 `meta-config.example.md`？那是**範本**——Maya 會照它幫你生成正式的 `meta-config.md`，你不用自己手動建。

檔案內容格式：

```markdown
# Meta API 設定

## Facebook 粉絲專頁
- 粉絲專頁 ID：（3-4 步 me/accounts 回傳的 id）
- Page Access Token：（3-5 第二步拿到的 ③號 Token）

## Instagram（如果有的話）
- IG Business Account ID：（見 Step 6）
- 同上 Token 可用於 IG

## 設定日期
（填今天日期）
```

---

## Step 5：測試是否成功

✏️ 在 AI 工作環境 輸入：

```
/maya-social 幫我發一篇 Facebook 排程測試文，
內容是「測試發文，請忽略」，時間設定明天早上 9 點。
請確認用 published=false + scheduled_publish_time，不要直接發出去。
```

> 🚨 **為什麼要特別交代這句？**
> Meta 的排程貼文必須**同時**帶兩個參數：`published=false`（先不要發）和 `scheduled_publish_time`（什麼時候發）。
> **只給時間、沒給 `published=false`，貼文會立刻公開發出去**——你的「測試發文，請忽略」就這樣貼在粉專首頁上了。第一次測試務必講清楚。

Maya 會：
1. 讀取 `meta-config.md` 裡的 Token 和粉絲專頁 ID
2. 透過 Meta Graph API 建立**排程**貼文
3. 回報貼文 ID 和預定發文時間

**✅ 怎麼確認成功：** 去 Facebook 粉絲專頁後台 → **Meta Business Suite → 內容 → 已排程**，看到這篇就成功了。

<!-- TODO 截圖：後台「已排程」清單出現測試貼文的樣子 -->

> ⚠️ **排程時間有限制：必須是「至少 10 分鐘之後」。** 設「5 分鐘後」會被 Meta 拒絕。
>
> 上限方面**建議排程不要超過一個月**最保險（**實際限制請以 Meta 最新公告為主**）。真的要排更遠，先用一篇測試確認會不會被退。
>
> 💡 時間格式接受三種：UNIX 時間戳（秒）、ISO 8601 字串（`2026-09-01T10:15:30+08:00`），或 `tomorrow`、`+2 weeks` 這類相對字串。Maya 會自動處理，但如果你用相對字串，建議發完回頭確認一下實際排定時間對不對。

---

## Step 6（選用）：Instagram 連動

如果你有 Instagram 商業帳號：

**1. 確認 IG 帳號已連結到 Facebook 粉絲專頁**
   粉絲專頁設定 → 已連結的帳號 → 確認 IG 出現在這裡

**2. 先把自己加為 App 測試者（很多人卡在這步）**
   [Meta 開發者後台](https://developers.facebook.com/apps) → 你的 App → 左側「**應用程式角色 / Roles**」→「**測試人員 / Testers**」→ 新增你自己的帳號 → **到該帳號的通知中心接受邀請**

   > ⚠️ **「新增」之後一定要去「接受邀請」，兩個動作都要做。** 只新增沒接受，狀態會停在「待處理」，等於沒加。
   > ⚠️ 沒做這步，發自己的 IG 會直接報錯 `User must be on whitelist`（白名單錯誤）。這不是 Token 壞掉。

**3. 查詢你的 IG 帳號 ID**
   在 Graph API Explorer 輸入：
   ```
   你的粉絲專頁ID?fields=instagram_business_account
   ```
   回傳：
   ```json
   {"instagram_business_account":{"id":"17841400000000000"},"id":"123456789012345"}
   ```
   👉 `instagram_business_account` 裡面的 `id` 就是 IG 帳號 ID

   > 🔴 **如果回傳裡沒有 `instagram_business_account` 這個欄位**，代表：IG 還沒連到粉專、IG 不是商業帳號、或 Token 少了 `instagram_basic` 權限。三個都檢查一遍。

**4. 把 IG 帳號 ID 填進 `meta-config.md`**

---

### IG 的硬限制（不是設定壞掉，是 Meta 本來就這樣）

| 限制 | 說明 |
|---|---|
| **圖片必須是公開 HTTPS 網址的 JPEG** | 官方發布流程是把 `image_url` 交給 Instagram 去抓。**PNG 和 WebP 會被拒絕**——這點很重要，見下方紅字 |
| **一定要有圖** | IG 不支援純文字貼文。想發純文字，Meta 另有 Threads API（不同產品、不同授權流程） |
| **兩段式發布** | 先建「媒體容器」、再發布，Maya 會自動處理，但比 FB 慢幾秒是正常的。容器建立後 **24 小時內沒發布就會失效** |
| **每日發布上限** | 官方文件記載每 24 小時 **100 篇**（2026-08-14 查證，**實際請以 Meta 最新公告為主**）。以你們的使用量不會碰到，要大量發可先查 `content_publishing_limit` 看自己的實際額度 |
| **官方沒有記載排程參數** | 見下方說明 |

---

> 🔴 **最容易中的坑：圖像生成工具生的圖是 PNG，IG 不收。**
>
> 本課程的流程是「Leon 出 brief → 你用 圖像生成工具生圖 → 給 Maya 發 IG」。但 圖像生成工具輸出可能是 **PNG**，而 Instagram 的發布 API **只接受 JPEG**。
>
> **解法：** 生完圖之後先轉檔成 `.jpg` 再上傳圖床。用小畫家、預覽程式、Canva 匯出，或任何線上轉檔工具都可以。
>
> 症狀：圖片 URL 明明打得開，Maya 卻一直說抓不到圖／發布失敗——十之八九是格式問題，不是網址問題。

---

> ⚠️ **關於「IG 能不能排到未來自動發」**
>
> **Meta 官方的 Instagram 內容發布文件裡，只記載「建立容器 → 發布」兩個步驟，沒有像 Facebook 那樣的排程參數。** 官方文件甚至反過來寫「如果你的 App 讓使用者排程未來發文，請自行控管發布頻率上限」——語氣是把排程當成**你的程式要自己做的事**。
>
> 網路上有些文章聲稱 IG 容器也能帶 `published=false` + `scheduled_publish_time`，但這在官方文件裡查不到，各方說法也不一致。
>
> **本課程的建議：把 IG 當成「只能現在發」來設計。** 要定時發 IG，就是讓你的電腦／排程工具在那個時間點觸發 Maya 去發，而不是交給 Meta 幫你等。這樣不管 Meta 那邊怎麼變，你的流程都不會壞。

**IG 常見錯誤對照：**

| 錯誤訊息 | 原因 | 怎麼修 |
|---|---|---|
| `User must be on whitelist` | 沒把自己加進測試人員 | 回本步驟第 2 點 |
| `Application does not have permission (#10)` | Token 少了 `instagram_content_publish` | 回 3-2 開權限 → 3-3 重產 Token |
| 查不到 IG 帳號 | 少了 `instagram_basic` | 同上 |
| 圖片抓不到 / 發布失敗 | 圖片是 PNG／WebP，或網址不是公開 HTTPS | **先轉成 JPEG**，再確認網址無需登入就打得開 |
| 建好容器卻沒發出去 | 容器超過 24 小時失效 | 重新建立容器再發 |

---

## Step 7：🔴 最後一步——記得按「發布」

> **這是整個單元最容易被忽略、但後果最嚴重的一步。**
> 前面六步全部做對，Token 也拿到了，Maya 也回報「成功」了——但如果沒有真的發布，貼文就是躺在後台，**外面一個人都看不到**。做了等於沒做。

### ⚠️ 「Maya 說成功」不等於「已經發出去」

Maya 回報的「成功」只代表：**API 呼叫成功、貼文已經建立**。
貼文建立後可能是三種狀態，只有第三種才是真的有人看得到：

| 狀態 | 後台顯示 | 外面看得到嗎 |
|---|---|---|
| **草稿** | 內容 → 草稿 | ❌ 完全沒人看得到，而且**永遠不會自動發** |
| **已排程** | 內容 → 已排程 | ⏳ 還沒，但時間到了 Meta 會自動幫你發 |
| **已發布** | 內容 → 貼文 | ✅ 這個才算數 |

> 🔴 **最常見的悲劇：卡在「草稿」。**
> 如果建立貼文時帶了 `published=false` 卻**沒帶** `scheduled_publish_time`（或時間格式錯誤被忽略），貼文就會變成**草稿**躺在後台。它不會自己發、也不會提醒你，你以為排好了一整週的內容，實際上一篇都沒出去。
>
> **草稿必須你自己進後台手動按「發布」，Meta 不會幫你發。**

---

### ✅ 每次排完貼文，一定要做這個檢查

**1. 打開 Meta Business Suite → 內容**

**2. 三個分頁都點一遍：**
   - **草稿**：這裡**應該是空的**。如果你的貼文躺在這 → 就是沒發布，馬上處理
   - **已排程**：你排的貼文應該全部在這，時間也對
   - **貼文**：已經發出去的在這

**3. 如果貼文卡在「草稿」，兩個做法：**
   - **快的**：直接在後台點進去 → 按「**發布**」或「**排程**」，手動補上
   - **根治的**：回頭跟 Maya 說「這批變成草稿了，請重新用 `published=false` + `scheduled_publish_time` 建立」

<!-- TODO 截圖：Meta Business Suite「內容」頁面，圈出「草稿 / 已排程 / 貼文」三個分頁 -->

---

### ⚠️ 另一個會讓「全世界都看不到」的陷阱：粉專本身沒發布

如果你的粉絲專頁是新建的，很可能還停在「**未發布**」狀態——這種情況下，**只有你自己（管理員）看得到你的粉專和所有貼文**，其他人連粉專都搜尋不到。你會覺得「明明都發出去了怎麼沒人看」。

**檢查方式：**
粉絲專頁 → **設定** → **隱私 / 專頁瀏覽權限** → 確認是「**已發布**」

如果顯示「未發布」或「草稿」，把它切成已發布。

> 💡 這一項只要確認一次就好，不用每次發文都檢查。但新粉專**第一次**串接時務必看一下。

---

### 🎯 一句話總結

```
拿到 Token ≠ 發文成功
Maya 說成功 ≠ 已經發布
排進後台   ≠ 有人看得到

發完一定回後台看一眼「草稿」是不是空的。
```

---

## 完整自動化流程：Maya + Leon + Meta

```
你說一句話：「幫我排這週的 IG 貼文，主題是 [你的主題]，全部發到 Meta」
        ↓
Maya 寫出 7 天貼文行事曆（含文案 + 配圖 brief）
        ↓
Maya 呼叫 Leon：「幫我出這 7 張 IG 圖的 brief」
        ↓
Leon 產出 7 張配圖 brief → 你貼進 圖像生成工具生圖、存成圖片
        ↓
Maya 把 [文案 + 圖片 URL]（FB 再加上排程時間）推進 Meta
        ↓
Facebook 後台出現 7 篇排程貼文；IG 則是你要發的時候「現在發」
```

> 💡 **IG 圖片有兩個條件：公開可存取的 HTTPS 網址 + JPEG 格式。**
> 圖像生成工具生的圖通常是 PNG，**要先轉成 .jpg**，再傳到能產生公開連結的地方（你的網站、圖床、雲端公開連結）給 Maya。這一步漏掉，IG 會一直發不出去。

✏️ 在 AI 工作環境 輸入：

```
/hello-nora 幫我排這週的貼文，主題是 [你的品牌主題]，
每篇請 Leon 出配圖 brief，我生好圖後 FB 排程發布、IG 我要發的時候即時發
```

---

## ✅ 驗收任務

### 基本過關（只發 FB 的人做到這裡就算完成）

```
/maya-social 幫我排這週的貼文，主題是 [你的品牌主題]，
FB 排程發布，記得用 published=false
```

**通過標準（兩項都要）：**
- ✅ Meta Business Suite → 內容 → **已排程**，出現這週的排程貼文
- ✅ Meta Business Suite → 內容 → **草稿**，是**空的**（有東西卡在這裡就是沒發布，見 Step 7）

### 進階過關（有 IG 的人再做）

```
/maya-social 幫我用同一批內容，IG 即時發一篇測試
```

**通過標準：** IG 上成功出現一篇貼文 ✅
（IG 後台**不會**有「排程貼文」是正常的——它本來就只能現在發）

---

## 常見問題

**Q：Token 到底會不會過期？**

分三種，不要搞混：

| Token | 到期 |
|---|---|
| ①短期 User Token | 1~2 小時 |
| ②長期 User Token | 60 天 |
| ③**Page Token（你存起來的這個）** | **沒有固定到期日** |

但「沒有固定到期日」**不等於永不失效**。以下情況會讓它立刻作廢：

- 你更改了 Facebook 密碼
- 你移除了這個 App、或撤銷了它的權限
- 你不再是該粉專的管理員
- **超過 90 天完全沒有用這個 App 呼叫過 API** — 這條是 Meta 官方明文規定：App 若 90 天未使用某權限（通常是因為使用者長期未活動），使用者必須重新授權一次
- Meta 主動判定異常並停用

所以**不用定期換，但也不要放著幾個月不用**。建議偶爾用 `/health-check` 確認還活著。真的失效了，回 Step 3-3 重跑一次 3-3 → 3-5 就好，不用整個 App 重建。

---

**Q：為什麼不支援個人 Facebook 帳號？**

Meta API 政策限制，個人帳號無法透過 API 發文，只有「粉絲專頁」才能。

---

**Q：需要商業驗證嗎？**

**不需要**——只要你照本單元走「開發模式 + 個人帳號 + 自己的粉專」這條路。

Meta 官方的規定是：**商業驗證是「申請進階存取（Advanced Access）」時才強制要求的**。本單元全程使用標準存取（Standard Access），只操作你自己有管理權限的粉專，不需要驗證、也不需要送 App Review。

**會需要商業驗證的情況：**你去用了商業管理平台的「系統用戶」、或想申請進階存取讓 App 能操作別人的粉專。本單元用不到，也請不要去碰。

---

**Q：留言回覆是 24 小時自動回嗎？**

**不是。** 這是「半自動」——你在 AI 這邊請 Maya 跑的時候，她依規則一次把留言回完；**電腦關了、沒在跑的時候不會自動回**。要全天候自動回，得用 ManyChat 或 Meta 內建的自動回覆工具。

---

## 🆘 卡住了怎麼辦

**先自己跑一遍這個檢查清單：**

1. 我登入的 Facebook 帳號，是管理這個粉專的那一個嗎？
2. 3-2 的權限我全部都啟用了嗎（7 個，加 IG 就 9 個）？
3. 我在 Explorer 請求的每一個權限，都有先在 App 使用案例裡啟用嗎？（沒啟用就請求 → Invalid Scopes）
4. Windows 的話，我用的是 `curl.exe` 不是 `curl` 嗎？
5. 指令裡的中文字（`你的AppID` 之類）我全部換掉了嗎？
6. 網址前後的雙引號還在嗎？
7. 我從 3-3 拿 Token 到現在，超過 1 小時了嗎？
8. 3-6 的偵錯工具三欄都對嗎？
9. 貼文有沒有卡在後台的「草稿」？（見 Step 7）
10. 我的粉絲專頁本身是「已發布」狀態嗎？（新粉專特別容易中）

**還是不行的話**，把錯誤訊息**完整截圖**貼給 Maya，並附上：
- 你卡在哪一個步驟編號（例如「3-5 第二步」）
- 你用的是 Windows 還是 Mac
- 3-6 偵錯工具顯示的 Type 和 Expires（**不要貼 Token 本身**）

有這三個資訊，通常一次就能診斷出來。

---

## 📅 本單元的查證基準

本單元的技術細節於 **2026 年 8 月 14 日** 對照 Meta 官方文件查證，主要依據：

- [權限參考文件](https://developers.facebook.com/docs/permissions/)（權限清單與相依關係）
- [取得長期權杖](https://developers.facebook.com/docs/facebook-login/guides/access-tokens/get-long-lived/)（Token 換發規則）
- [Instagram 內容發布](https://developers.facebook.com/docs/instagram-platform/content-publishing/)（IG 發布流程與限制）
- 當時最新的 Graph API 版本為 **v26.0**（2026/7/29 發布）

> ⚠️ **Meta 改版很勤，大約每 4~5 個月一版。** 如果你是在很久之後才看到這份教材，遇到跟教學不符的狀況，請以 [Meta 官方文件](https://developers.facebook.com/docs/) 當下的說法為準，並回報給我們更新。
>
> **最需要定期複查的三項：** 權限名稱與相依關係、Graph API 版本號、IG 發布的格式與頻率限制。

---
