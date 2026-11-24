# Playbook：推新課 / 跑活動

> 當用戶說「我要推新課」「launch 新產品」「跑活動」時，Nora 啟動這個 playbook。

---

## Step 0：收集 Campaign 資訊

先跟用戶確認以下 5 件事（先用既有資料，缺項一次只問一題，等回答後再問下一題）：

1. **活動目標**（推新課？促銷？品牌曝光？）
2. **產品／活動名稱**
3. **關鍵日期**（開賣日、結束日）
4. **預算規模**（有沒有要投廣告？多少？）
5. **既有素材**（有沒有現成的銷售頁、影片、圖片？）

如果用戶資訊不完整，根據 `_brand/product-info.md` 推測合理的預設值。

---

## Step 1：拆解時間軸

根據關鍵日期，倒推出 4 個階段：

| 階段 | 距開賣 | 主要任務 |
|------|--------|---------|
| **預熱期** | T-14 ~ T-7 | 鋪陳痛點、收集名單 |
| **預售期** | T-7 ~ T-0 | 開放預購、製造急迫感 |
| **開賣日** | T-0 | 全力轉換、推廣告 |
| **延伸期** | T+1 ~ T+7 | 提醒、追加銷售 |

---

## Step 2：分派任務給團隊

每個階段，找對的人做對的事：

### 預熱期任務分派

**Iris（SEO 專員）**
- 讀 `.agents/skills/iris-seo/workflows/keyword-research.md`
- 找出與這個產品相關的 20 個關鍵字
- 產出：關鍵字機會圖，標註哪些值得寫 SEO 文章

**Maya（社群小編）**
- 讀 `.agents/skills/maya-social/workflows/weekly-calendar.md`
- 拿 Iris 的關鍵字當主題，排接下來 14 天的貼文
- 產出：兩週貼文行事曆（FB / IG / Threads 三平台）

**Leon（設計總監）**
- 讀 `.agents/skills/leon-design/workflows/landing-page.md`
- 設計收名單的 Landing Page
- 產出：LP 完整結構 + 文案 + 視覺骨架

### 預售期 + 開賣日任務分派

**Leon**
- 讀 `.agents/skills/leon-design/workflows/sales-page.md`
- 設計正式銷售頁（SP）
- 產出：SP 完整結構 + 文案 + 視覺骨架

**Jack（廣告投放手）**
- 讀 `.agents/skills/jack-ads/workflows/hook-writing.md`
- 寫 5 組廣告 hook + 完整文案
- 讀 `.agents/skills/jack-ads/workflows/budget-allocation.md`
- 規劃預算分配（冷流量 / retargeting / lookalike）

**Maya**
- 開賣日當天的限動腳本、貼文、Threads 串

### 延伸期任務分派

**Jack**
- 看開賣後 3 天數據，決定哪組廣告加碼、哪組暫停
- 規劃結帳追加銷售（upsell）

**Maya**
- 「最後一天」的緊迫感貼文
- 「售後感謝 + 推下一個產品」的內容

---

## Step 3：產出 Campaign 計畫文件

把以上拆解整理成一份單頁計畫，包含：

```markdown
# Campaign：[產品／活動名稱]

## 關鍵時程
- 預熱期：[日期區間]
- 預售期：[日期區間]
- 開賣日：[日期]
- 延伸期：[日期區間]

## 每個夥伴的任務清單

### Iris（SEO）
- [ ] 任務 1（deadline: 日期）
- [ ] 任務 2

### Maya（社群）
- [ ] 任務 1
- [ ] 任務 2

### Leon（設計）
- [ ] 任務 1
- [ ] 任務 2

### Jack（廣告）
- [ ] 任務 1
- [ ] 任務 2

## 依賴關係（Dependencies）
- Maya 的貼文要等 Iris 的關鍵字（T-14 前）
- Jack 的廣告要等 Leon 的 SP（T-7 前）

## 成功指標
- 預熱期：[名單數]
- 開賣首日：[轉換目標]
- Campaign 結束：[總業績]
```

---

## Step 4：問用戶從哪裡開始

不要一次把所有東西做完。給用戶選擇：

> 計畫拆好了！要從哪裡開始？
>
> 1. 讓 Iris 先抓關鍵字（5 分鐘，後面 Maya / Leon 都要用）
> 2. 讓 Leon 先做 Landing Page（決定整個視覺基調）
> 3. 讓 Jack 先寫廣告 hook（看反應再調整）
>
> 我建議先 1，因為它是其他任務的基礎。

讓用戶決定下一步，Nora 順著做。
