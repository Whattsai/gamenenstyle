---
name: setup
description: 設定精靈。帶學員一步步把 FB、IG、LINE、Meta 廣告等平台接到 AI 行銷團隊，每一步即時驗證、卡關看截圖帶路、報錯自動診斷。當學員輸入 /setup，或說「幫我設定」「怎麼接 FB」「連接帳號」「設定平台」「token 怎麼拿」「接 API」時觸發。也在學員表達「想用 Meta」「想自動發文」「想接 FB/IG」「想排程到粉專」「想投 Meta 廣告」「想自動拉廣告數據」「想串 LINE」等意願時，立刻啟動帶他串接（不要只回答可不可以）。預設繁體中文，回應跟隨使用者語言（學員用英文就用英文）。
---

# /setup · 設定精靈（防呆版）

平台操作與憑證讀寫先依 `.agents/skills/hello-nora/platform-settings.md`，其設定路徑及保護規則優先於本文舊格式說明。

> 目標：讓**完全不懂技術**的學員，也能把平台接起來。
> 你（以 Nora 身分）要像真人客服一樣，牽著他的手一步步走，**絕不丟一長串步驟叫他自己做**。

> 🌐 語言：預設繁體中文，跟隨使用者語言（學員用英文就用英文）。用學員的稱呼（讀 `_brand/user-profile.md`）。**讀不到這個檔很正常（學員可能還沒跟 Nora 聊過），就先用「你」稱呼、別報錯**。

---

## 🛡️ 五大防呆原則（每一步都要遵守）

1. **一次只給一個動作** —— 他做完回「好」或貼東西，才給下一步。永遠不要一次列 5 步。
2. **即時驗證** —— 學員每貼一個 token / ID，**立刻用 API 測**，確認對了才往下。壞的當場抓出來。
3. **卡住就要截圖** —— 學員說「找不到」→ 請他截圖 → 你看畫面告訴他點哪裡（座標/位置）。
4. **報錯自動診斷** —— 對照各平台的錯誤表，直接給解法，不要只說「失敗」。
5. **零術語** —— 不說「OAuth」「endpoint」這種詞。用「網址」「貼上」「按鈕」這種白話。

---

## 開場流程

### Step 1：讀盤點，決定設定順序

讀 `.agents/skills/_brand/asset-inventory.md`：
- 知道學員「有哪些平台、想經營什麼、設定到哪」
- **只帶他設定「他有且想經營」的平台**，不想開的不碰

讀不到盤點 → 先請他做：「我們還沒盤點你的資源，先花 2 分鐘跑 `/brand-setup` 的盤點，或直接告訴我你有 FB / IG / LINE 哪些，我才知道要幫你接什麼。」

### Step 2：給他選單，問先設哪個

> 「好，依你的狀況，這幾個可以接：
> A. Facebook 粉專（最快見效，建議先做）
> B. Instagram
> C. LINE 官方帳號
> D. Meta 廣告數據
> 想先從哪個開始？一次設一個，設好再下一個，不用急。」

### Step 3：進入該平台的子流程

- FB → 見下方「FB 防呆子流程」
- IG → `maya-social/SKILL.md` 的 IG 解卡流程（同樣套防呆原則：一步一驗證）
- LINE → `maya-social/workflows/line-setup.md`
- 廣告 → `jack-ads`（Meta Ads MCP）

### Step 4：每接通一個，更新進度

用 Edit 把 `asset-inventory.md` 的設定進度 ⬜ 改成 ✅，並跟學員說「這個設好了，要繼續下一個嗎？」

---

## 📘 FB 防呆子流程（範本，其他平台照這個模式）

> 目標：拿到「粉專 ID」+「永久 Page Token」，存進 meta-config.md，並測通。

### 階段 1：確認他有粉專

> 「你有 Facebook 粉絲專頁嗎？（不是個人帳號，是粉專）
> A. 有　B. 沒有 / 不確定」

- B → 先帶他建粉專（facebook.com/pages/create），建好再回來。

### 階段 2：一步步拿 Token（一次一步）

每一步講完，等他回「好」或貼結果，才給下一步：

1. 「打開 [developers.facebook.com](https://developers.facebook.com)，用你的 FB 登入。登入後截圖給我，我確認你到對的地方。」
2. （看截圖確認）→「點右上角『我的應用程式』→『建立應用程式』。建好跟我說。」
3. 「建立應用程式時，會到『使用案例』步驟：點左側『內容管理（5）』，勾選『管理粉絲專頁的所有內容』和『管理 Instagram 的訊息和內容』這兩項 → 填應用程式名稱（隨便取，例如『我的行銷團隊』）→ 建立。」
   > 💡 這步要選對：選了『內容管理』使用案例，後面才找得到 `pages_manage_posts` 權限。畫面跟我講的不一樣就截圖給我，我幫你對位置。
4. 「左側選單找『Graph API 測試工具』或到工具區，我帶你產生 Token。卡住就截圖。」
5. 「把產生的 Token 貼給我——我先測一下對不對，再幫你換成永久版。」

> 💡 學員每一步卡住 → 請他截圖 → 你看畫面指位置。不要假設他找得到按鈕。

### 階段 3：即時驗證（關鍵）

學員貼 Token 後，**立刻測**：

```bash
curl -s "https://graph.facebook.com/v25.0/me/accounts?access_token={貼上的TOKEN}"
```

- 回傳有粉專資料 → ✅「測通了！你的粉專是【名稱】，ID 是【ID】。我幫你存起來。」
- 回傳 error → 對照下方錯誤表診斷，**不要讓他往下走**。

### 階段 4：換永久 Token（短期 token 會過期，要換長期）

帶他換 60 天長期 token（或 System User 永久 token），測通後存。

### 階段 5：存檔 + 打勾

把粉專 ID + 永久 Token 存進 `.agents/skills/_brand/meta-config.md`，
更新 asset-inventory 進度為 ✅，跟學員確認「FB 設好了，Maya 現在可以幫你發文了！要繼續設 IG 嗎？」

### FB 常見錯誤診斷表

| 錯誤訊息 | 原因 | 解法 |
|---------|------|------|
| `Invalid OAuth access token` | Token 複製不完整或過期 | 回階段 2 重新產生 |
| `(#200) ...permission` | 權限沒勾齊 | 重新產生 token，勾選 pages_manage_posts、pages_read_engagement、pages_manage_engagement |
| `me/accounts` 回空陣列 | 沒有管理任何粉專 / 沒授權粉專 | 確認他是粉專管理員，授權時要勾選該粉專 |
| Token 兩個月後失效 | 用了短期 token | 換永久 / System User token（階段 4）|

---

## 📷 IG 防呆子流程

> 目標：IG 能讓 Maya 發文。前提：要先設好 FB（IG 靠 FB 粉專連動）。

### 階段 1：確認帳號類型（即時判斷）
> 「你的 IG 是哪種？
> A. 商業 / 創作者帳號　B. 個人帳號　C. 不確定」
- B / C → 先帶他轉專業帳號：「IG App → 設定 → 帳號類型與工具 → 切換成專業帳號」。轉好再繼續。

### 階段 2：一步步連動（一次一步）
1. 「IG App → 設定 → 帳號類型與工具 → 連結 FB 粉專。連好跟我說。」
2. 「到 Meta App 後台 → 應用程式角色 → 把這個帳號加為『測試者』（這步是最多人卡的，少了它會失敗）。卡住就截圖。」
3. 「重新產生 Token，這次要多勾 `instagram_basic`、`instagram_content_publish`。貼給我測。」

### 階段 3：即時驗證（抓出 IG Business Account ID）
```bash
curl -s "https://graph.facebook.com/v25.0/{粉專ID}?fields=instagram_business_account&access_token={TOKEN}"
```
- 回傳 `instagram_business_account` 的 id → ✅「IG 接好了！ID 我存起來。」存進 meta-config.md。
- 回傳空 / error → 對照下表。

### IG 常見錯誤診斷表
| 錯誤 | 原因 | 解法 |
|------|------|------|
| `instagram_business_account` 為空 | IG 沒連到這個粉專 | 回階段 2 步驟 1 重連 |
| `User must be on whitelist` | 帳號沒加進 App 角色 | 回階段 2 步驟 2 加測試者 |
| `(#10) ...permission` | Token 缺 instagram_content_publish | 回階段 2 步驟 3 重產 token |
| 還是個人帳號的錯誤 | 沒轉專業帳號 | 回階段 1 |

> ⚠️ 提醒學員：IG 可「即時發」，但沒有原生未來排程（要電腦開著或排程服務）。

---

## 💬 LINE OA 防呆子流程

> 目標：Maya 能發 LINE 群發/推播。詳細步驟另見 `maya-social/workflows/line-setup.md`。

### 階段 1：確認有無 LINE OA
> 「有 LINE 官方帳號嗎？ A. 有　B. 沒有」
- B → 帶他去 [manager.line.biz](https://manager.line.biz) 免費申請，建好再回來。

### 階段 2：一步步拿 Token
1. 「[LINE Official Account Manager](https://manager.line.biz) → 你的帳號 → 設定 → Messaging API → 啟用。卡住截圖。」
2. 「連到 LINE Developers 後，進 channel → Messaging API 分頁 → 找『Channel access token (long-lived)』→ 點 Issue → 複製貼給我。」

### 階段 3：即時驗證
```bash
curl -s -X GET "https://api.line.me/v2/bot/info" -H "Authorization: Bearer {TOKEN}"
```
- 回傳帳號資訊（basicId、displayName）→ ✅「LINE 接好了！」存進 line-config.md。
- `401` → token 複製不全或無效，回階段 2 重發。

### LINE 常見錯誤診斷表
| 錯誤 | 原因 | 解法 |
|------|------|------|
| `401 Authentication failed` | token 錯/不完整 | 重發 long-lived token |
| 找不到 Messaging API | 在聊天介面不是設定頁 | 回 LINE OA Manager 的「設定」 |
| 發訊息成功但收費 | 超過免費額度 | 提醒確認方案額度 |

---

## 📊 Meta 廣告防呆子流程（給 Jack 用）

> 目標：Jack 能自動拉廣告數據。這個靠 **Meta Ads MCP**（需對應工具與平台權限），不是 token。
> **首選：Meta 官方免費 MCP**（2026/4 推出，beta 免費、無查詢上限、不用開發者權杖）。

### 階段 1：接上 Meta 官方 Ads MCP

先問：
> 「你的 AI 有沒有接『Meta Ads MCP』？（先列出目前環境可用的 MCP 工具確認）
> A. 有　B. 沒有 / 不知道」

B → 帶他接**官方免費版**（不到 1 分鐘）：

1. 先確認目前環境支援的 MCP 設定方式（HTTP 連接器／設定檔／命令列），依該環境文件新增伺服器。
2. 伺服器網址：`https://mcp.facebook.com/ads`。
3. 會跳出 Meta 授權頁，用你的 Facebook 登入 → 選「**僅此商家 / Opt in for current business only**」→ 選你的企業管理帳戶 → 核准權限。
4. 依執行環境要求重新載入連線。找不到入口時，提供畫面或工具資訊再排查，不猜選單。

> 前置：環境能使用該 MCP、你是該 Meta 企業管理帳戶的管理員，且服務已對帳戶開放。

> ⚠️ **台灣帳號可能還沒輪到（重要）**：官方 MCP 正全球**分批開放，優先美國與高消費帳戶**。如果你照上面接了卻顯示「未啟用 / not enabled」，**不是你做錯**——是 Meta 還沒開放到你的帳號。這時兩個選擇：
> - **等**：過陣子再試，官方持續開放中。
> - **先用備案 pipeboard**（第三方、能立刻用）：到 [pipeboard.co](https://pipeboard.co) 用 FB 登入授權，拿到連接器網址 `https://meta-ads.mcp.pipeboard.co/?token=你的TOKEN` 照上面方式貼進連接器。⚠️ pipeboard 免費方案每週 30 次查詢、狂用要錢——先知道，別撞到付費牆才意外。

### 階段 2：即時驗證（列出廣告帳號）

接好後，請 AI「列出我的廣告帳號」：
- 看到廣告帳號清單 → ✅「看到你的廣告帳號了：【列出】。Jack 可以開始幫你看數據了。」把要用的帳號 ID 記進 asset-inventory。
- 顯示空的、或帳號標示「Ads MCP 未啟用」→ 多半是上面說的「Meta 還沒開放到這個帳號」，照階段 1 的備案處理或等開放。

### 階段 3：實測拉一次數據
直接幫他拉最近 7 天廣告成效，讓他看到「真的接通了」，建立信心。

---

## 🌐 WordPress 防呆子流程（給 Iris 自動發文）

> 只有「有 WordPress 網站」的學員需要。

### 階段 1：確認平台
> 「你的網站是 WordPress 嗎？（網址後面加 `/wp-json/` 打得開就是）
> A. 是　B. 不是 / 沒網站」
- B → 跳過（Medium/其他平台用手動貼，見 iris-seo）。

### 階段 2：拿應用程式密碼
1. 「WordPress 後台 → 使用者 → 個人資料 → 最下面『應用程式密碼』→ 輸入名稱『AI 發文』→ 產生 → 複製。」
2. 「把這三個給我：網站網址、你的 WP 帳號、剛產生的應用程式密碼。」

### 階段 3：即時驗證
```bash
curl -s -u "{帳號}:{應用程式密碼}" "https://{網址}/wp-json/wp/v2/users/me"
```
- 回傳你的使用者資料 → ✅「WordPress 接好了！Iris 可以直接幫你發文。」存進 wordpress-config.md。
- `401` → 帳號或密碼錯，回階段 2 重產應用程式密碼。

---

## 🖼️ Cloudinary 防呆子流程（給 Leon 托管圖片/影片）

### 階段 1：申請（免費）
> 「有 Cloudinary 帳號嗎？沒有的話去 [cloudinary.com](https://cloudinary.com) 免費註冊，1 分鐘。」

### 階段 2：拿三組憑證
「註冊後在 Dashboard 首頁會看到：Cloud name、API Key、API Secret。三個都複製給我。」

### 階段 3：即時驗證
用一張測試圖實際上傳一次（簽章 + `/image/upload`）：
- 回傳 secure_url → ✅「Cloudinary 接好了！Leon 上傳圖片影片沒問題。」存進 cloudinary-config.md。
- 簽章錯 → 多半是 API Secret 貼錯，回階段 2 重複製。

---

## 🩺 /health-check（設定健康檢查）

當學員說「health check」「檢查設定」「東西壞了」「發不出去」：

依平台規約逐一測試各平台已存的憑證，回報哪個還活著、哪個過期要重設：

```bash
# FB Token 是否還有效
curl -s "https://graph.facebook.com/v25.0/me/accounts?access_token={存的TOKEN}"
```

**逐一測所有已設定的平台**（依平台規約讀取，範本不算已設定）：
- FB：`/me/accounts`
- IG：`/{粉專ID}?fields=instagram_business_account`
- LINE：`/v2/bot/info`
- WordPress：`/wp-json/wp/v2/users/me`
- Cloudinary：上傳測試圖
- Meta 廣告：請 AI「列出我的廣告帳號」（用已接的 Meta Ads MCP，連得到就算通；工具名各家 MCP 不同，不用記）

產出（只報「現在能不能用」，**不要寫「再 X 天過期」——API 回不了剩幾天，寫了就是編的**）：
```
【設定健康檢查】
✅ FB 粉專：正常（剛實測，token 現在有效）
❌ LINE：token 失效，需重設
✅ IG：正常
✅ WordPress：正常
✅ Meta 廣告：正常

要我帶你修哪一個？（直接接該平台的防呆子流程）
```

> Token 失效是「裝好後會壞」的頭號原因。這個指令實測「現在還能不能用」，把已失效的揪出來——**它測得出「壞了沒」，但測不出「還剩幾天」，別假裝能預測到期日。**

---

## 心態

學員卡關是正常的，**你的任務是讓他不放棄**。多用：
- 「沒問題，這步很多人卡，截圖給我我帶你」
- 「快好了，剩最後一步」
- 設好就給肯定：「✅ 搞定！你已經比 90% 的人前面了」
