---
name: deck
description: 把行銷成效彙整成「給客戶／老闆看」的簡報檔（HTML 投影片，可一鍵存 PDF；要可編輯的 PPT 需另裝工具、版面需微調）。當學員輸入 /deck，或說「做成簡報」「客戶簡報」「報告轉簡報」「月報簡報」「成效簡報」「給客戶看的報告」時觸發。會抓廣告數據與戰情記錄，產出品牌風格的成效簡報。預設繁體中文，回應跟隨使用者語言（學員用英文就用英文）。
---

# /deck · 客戶成效簡報產生器

> 把 `/report` 的數據變成**可交付、好看、給客戶／老闆看**的簡報檔。
> 跟 `/report` 的差別：report 是「我該怎麼做」（內部策略）；deck 是「做得如何」（對外成果交付）。

> 🌐 語言：預設繁體中文，跟隨使用者語言（學員用英文就用英文）。

---

## 執行流程

### Step 1：確認期間與對象
> 「這份簡報是要給誰看、報哪段期間？
> A. 給老闆看的月報　B. 給代操客戶的成效報告　C. 其他
> 期間：例如 2026 年 6 月」

### Step 2：彙整數據（同 /report 的來源）

- `marketing-log.md`：這段期間做了什麼、成效
- **拉 Jack 的廣告數據**（Meta Ads MCP）：花費、ROAS、轉換、觸及、最佳活動
- `asset-inventory.md`：品牌、平台
- 缺的數據（社群互動、網站流量、銷售）→ 請學員補

> 沒數據別編。缺的欄位就標「本期未追蹤」或請學員補。

### Step 3：產出 HTML 簡報

讀 `_brand/brand-guide.md` 拿品牌色（沒有就用深藍 `#4A6B9E`）。
產出一份 16:9 投影片 HTML 檔，存到桌面（或專案資料夾）。**投影片結構：**

```
1. 封面：品牌名 + 「行銷成效報告」+ 期間
2. 本期重點摘要：3–4 個關鍵數字（大字呈現：花費 / 營收 / ROAS / 觸及）
3. 廣告成效：各活動表現表（花費、ROAS、轉換、CPC），標出最佳
4. 社群 / 內容成效：觸及、互動、粉絲成長（有數據才放）
5. 網站 / SEO：流量、排名變化（有數據才放）
6. 亮點與洞察：這期做對了什麼、哪個最有效
7. 下期計畫與建議：3–5 點具體方向
8. 結尾頁：總結一句 + 聯絡/簽名
```

每頁一個 `<section class="slide">`，16:9（1280×720），品牌色，數字大、留白多、好閱讀（給客戶看的，要專業簡潔）。

### Step 4：告訴學員怎麼匯出

```
簡報做好了！檔案在：[路徑]

匯出方式：
- 用瀏覽器打開 → 列印 → 另存為 PDF（最快、版面最準，給客戶用就選這個）
- 要可編輯的 PPT → 跟我說「轉成 PPT」，我用 pptx 工具幫你重建成 .pptx。
  ⚠️ 老實說：這是「照內容重做一份 PowerPoint」，不是把 HTML 原封不動搬過去，
  字體、間距、色塊可能跟網頁版有落差，需要你在 PowerPoint 裡再微調。
  只是要給客戶看、不用改字 → 直接用 PDF 最省事。
```

---

## HTML 投影片模板（參考骨架）

```html
<!DOCTYPE html><html lang="zh-Hant"><head><meta charset="UTF-8"><style>
@page{size:1280px 720px;margin:0;}
*{margin:0;padding:0;box-sizing:border-box;font-family:"PingFang TC","Noto Sans TC",sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
.slide{width:1280px;height:720px;padding:64px 72px;page-break-after:always;position:relative;display:flex;flex-direction:column;}
.cover{background:linear-gradient(135deg,#4A6B9E,#2c3e57);color:#fff;justify-content:center;}
.cover h1{font-size:56px;} .cover .sub{font-size:24px;opacity:.85;margin-top:16px;}
.slide h2{font-size:34px;color:#2c3e57;border-left:6px solid #4A6B9E;padding-left:16px;margin-bottom:32px;}
.kpis{display:flex;gap:24px;}
.kpi{flex:1;background:#f4f6fa;border-radius:16px;padding:28px;text-align:center;}
.kpi .num{font-size:48px;font-weight:700;color:#4A6B9E;} .kpi .label{font-size:16px;color:#6b7689;margin-top:8px;}
table{width:100%;border-collapse:collapse;font-size:18px;} th{background:#4A6B9E;color:#fff;padding:12px;text-align:left;} td{padding:12px;border-bottom:1px solid #e4e9f2;}
.foot{position:absolute;bottom:28px;right:72px;font-size:13px;color:#9aa7bd;}
ul{margin-left:24px;font-size:20px;line-height:2;color:#39455a;}
</style></head><body>
<section class="slide cover"><h1>【品牌】行銷成效報告</h1><div class="sub">【期間】</div></section>
<section class="slide"><h2>本期重點</h2><div class="kpis">
  <div class="kpi"><div class="num">【數字】</div><div class="label">廣告花費</div></div>
  <div class="kpi"><div class="num">【數字】</div><div class="label">ROAS</div></div>
  <div class="kpi"><div class="num">【數字】</div><div class="label">轉換次數</div></div>
</div><div class="foot">【品牌】· 【期間】</div></section>
<!-- 依結構續加各頁 -->
</body></html>
```

> 產出後可用無頭 Chrome 轉 PDF：
> `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --print-to-pdf="deck.pdf" "file:///路徑/deck.html"`

---

## 原則
- **給客戶看的，要乾淨專業**：數字大、少廢話、一頁一重點
- 只放真實數據，沒有的不要編
- 結尾一定有「下期計畫」——讓客戶看到你有在動腦，不只是報數字
