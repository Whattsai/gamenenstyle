# Workflow：IG 輪播圖卡（自動輸出 PNG／PDF 圖檔）

> Leon 把輪播內容做成套品牌風格的圖卡，每張 1080×1350（IG 直式 4:5），並**直接幫你輸出成圖檔**（PNG，或一卡一頁的 PDF），不用再一張張手動截圖。

---

## 觸發條件

- 「做輪播圖卡」「IG 輪播」「九宮格做成圖卡」
- 「把這篇貼文／文章做成圖卡」
- Maya 規劃好輪播內容結構後，交給 Leon 出圖

---

## 執行步驟

### Step 1：確認內容與風格（一次只問一題，等回答後再問下一題）

1. **這組輪播要講什麼**？（主題／要傳達的重點）
2. **大概幾張**？（建議 5–8 張：1 張封面 + 數張內容 + 1 張 CTA）
3. **最後想叫人做什麼**？（CTA：追蹤、私訊、點連結、留言…）
4. **走哪種調性**？（沒概念就由我依主題建議）
   - **黑底**：高能量、限時促銷、製造 urgency
   - **白底**：教學知識型、清爽好讀
   - **深藍**（品牌主色）：高單價、質感、專業路線

> 如果是 Maya 交來的內容，這步直接用她給的結構，不用重問。

### Step 2：讀品牌資料

- `.agents/skills/_brand/brand-guide.md`（品牌色、字型）
- 抓不到品牌色時，用對應調性的預設色，並提醒學員「之後填好 brand-guide 我可以再套一次」。

### Step 3：規劃每張卡的內容

固定節奏：**封面 Hook 卡 →（數張）內容卡 → CTA 卡**

| 卡別 | 任務 | 原則 |
|------|------|------|
| 封面 | 一句話勾住人往右滑 | 主標大、粗、置中；製造好奇或痛點 |
| 內容卡 | 每張**只講一個重點** | 標題明顯 + 2–4 行說明，不要塞滿 |
| CTA 卡 | 告訴他下一步做什麼 | 動詞開頭，明確單一行動 |

**字級原則（手機上要看得清楚）：**
- 封面主標最大、最粗、置中。
- 內容卡：標題明顯，內文 2–4 行就好，留白比塞滿重要。
- 重點數字 / emoji 放大，當每張卡的視覺焦點。

### Step 4：產出 HTML

輸出**單一 HTML 檔**，每張卡是一個 1080×1350 的區塊、各佔一頁。把下面範本的品牌色、文案換成實際內容（主色預設用品牌深藍 `#4A6B9E`，依 Step 1 調性換 `--bg` / `--fg`）：

> 💡 這份合併檔方便「列印成 PDF」。等下 Step 5 要自動出 **PNG** 時，我會把每張卡各拆成一個檔（`card-1.html`、`card-2.html`…）再一張張截圖，尺寸才會精準。

```html
<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<style>
  :root{
    --bg:#0E1320;        /* 卡片底色：黑底用 #0E1320 / 白底用 #FAF7F0 / 深藍用 #4A6B9E */
    --fg:#FFFFFF;        /* 主文字色：深底用白、白底用 #1A1A1A */
    --accent:#CCFF00;    /* 重點色：數字、底線、CTA 用 */
    --font:"PingFang TC","Noto Sans TC","Microsoft JhengHei",sans-serif;
  }
  *{margin:0;box-sizing:border-box;}
  body{background:#555;}
  .card{
    width:1080px;height:1350px;background:var(--bg);color:var(--fg);
    font-family:var(--font);padding:110px 96px;
    display:flex;flex-direction:column;justify-content:center;
    page-break-after:always;position:relative;
  }
  .kicker{font-size:34px;opacity:.7;letter-spacing:2px;margin-bottom:28px;}
  .title{font-size:96px;font-weight:800;line-height:1.18;}
  .title .hl{color:var(--accent);}
  .body{font-size:46px;line-height:1.6;margin-top:40px;font-weight:400;}
  .big{font-size:200px;font-weight:900;color:var(--accent);line-height:1;}
  .pageno{position:absolute;bottom:64px;right:96px;font-size:32px;opacity:.5;}
  .cta{font-size:64px;font-weight:800;}
  .cta .accent{color:var(--accent);}
</style>
</head>
<body>

  <!-- 封面卡 -->
  <div class="card">
    <div class="kicker">給還在手動做圖的你</div>
    <div class="title">3 分鐘<br><span class="hl">做完一週</span><br>的 IG 圖卡</div>
    <div class="pageno">1</div>
  </div>

  <!-- 內容卡（複製這段，每張換一個重點）-->
  <div class="card">
    <div class="kicker">重點 01</div>
    <div class="title">先想<span class="hl">一個</span>主軸</div>
    <div class="body">一組輪播只講一件事。貪心想塞三個重點，讀者一個都記不住。</div>
    <div class="pageno">2</div>
  </div>

  <!-- 數字焦點卡（想強調數據時用）-->
  <div class="card">
    <div class="big">87%</div>
    <div class="body">的人看 IG 只看封面就滑走——所以封面那句話，決定一切。</div>
    <div class="pageno">3</div>
  </div>

  <!-- CTA 卡 -->
  <div class="card">
    <div class="cta">想看更多？<br><span class="accent">追蹤 + 私訊「圖卡」</span><br>我把範本送你</div>
    <div class="pageno">4</div>
  </div>

</body>
</html>
```

### Step 5：自動輸出成 PNG（借你電腦的 Chrome，免裝任何工具）

> IG 輪播上傳要的是「圖片」，所以預設幫你出 **PNG**。最省事的做法是借你電腦本來就有的 **Google Chrome** 的「無頭模式」直接渲染——**不用裝 Playwright、不用 Node、不用任何額外工具**。學員只要說「**幫我把這些卡輸出成 PNG**」，我在 AI 工作環境 裡幫你跑：

**我實際做的事（你不用自己打指令）：**

1. 把每張卡各存成一個 HTML 檔（`card-1.html`、`card-2.html`…，就是上面範本裡單張 `.card` 的內容）。
2. 用無頭 Chrome 一張張截成**正好 1080×1350** 的 PNG：

**Mac：**
```bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
for f in card-*.html; do
  "$CHROME" --headless --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --window-size=1080,1350 --screenshot="${f%.html}.png" "file://$PWD/$f"
done
```

**Windows（PowerShell）：**
```powershell
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
# 找不到就改成：C:\Program Files (x86)\Google\Chrome\Application\chrome.exe
Get-ChildItem card-*.html | ForEach-Object {
  & $chrome --headless --disable-gpu --hide-scrollbars --force-device-scale-factor=1 `
    --window-size=1080,1350 --screenshot="$($_.BaseName).png" "file:///$($_.FullName)"
}
```

3. 得到 `card-1.png`、`card-2.png`… 一組 PNG，尺寸精準、命名好，直接上傳 IG。

> ✅ 多數人電腦本來就有 Google Chrome，這條**開箱即用**。
> 💡 已經裝了 **Playwright 之類瀏覽器工具**的人，我也可以改用它渲染，效果一樣。

**沒有 Google Chrome？三條退路：**
- **去裝免費 Chrome**（[google.com/chrome](https://www.google.com/chrome/)）後回來走上面的自動 PNG，一勞永逸（最推薦）。
- **存成 PDF（給客戶／存檔用）**：用瀏覽器打開上面的合併版 HTML →「列印」→「另存為 PDF」，每張卡一頁。⚠️ 但 **IG 上傳要的是圖片，PDF 得再轉成圖片才能發**，所以這條比較適合拿給客戶看、存檔。
- **逐張截圖**（最後手段）：瀏覽器打開、縮放 100%、視窗拉大，一張張截。

### Step 6：問下一步

> 輪播圖卡都出好了！接下來：
>
> 1. **要我輸出成 PNG** → 跟我說一聲，我用你電腦的 Chrome 自動出整組（沒有 Chrome 我會帶你裝，或先給你 PDF）
> 2. **改某張卡** → 告訴我第幾張、要怎麼調
> 3. **配文案** → 交給 Maya 寫這組輪播的貼文內文與 hashtag

---

## 注意

- 中文字型優先 `PingFang TC`（Mac）／`Noto Sans TC`，Windows 退 `Microsoft JhengHei`，確保不同電腦都顯示正常。
- 一張卡文字別超過 4 行；超過就拆成兩張，留白比資訊量重要。
- 三種配色不要混用在同一組輪播裡，整組統一一個調性才有品牌感。
