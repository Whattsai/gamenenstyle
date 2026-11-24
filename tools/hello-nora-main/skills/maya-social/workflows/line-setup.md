# LINE OA + Messaging API 設定流程

> 帶學員把 LINE 官方帳號接起來，讓 Maya 能發 LINE 群發/推播。
> 用選單問、一步步帶，遇到卡關照「常見問題」排除。

---

## 開始前先確認

> 「你有 LINE 官方帳號（LINE OA）嗎？
> A. 有
> B. 沒有 / 不確定」

**B → 先申請（免費）：**
1. 打開 [LINE Official Account Manager](https://manager.line.biz)
2. 用 LINE 帳號登入 → 建立帳號 → 填品牌資料
3. 建好後回來繼續

---

## 設定步驟（拿 Token）

**Step 1：啟用 Messaging API**
1. 進 [LINE Official Account Manager](https://manager.line.biz) → 選你的帳號
2. 右上「設定」→ 左側「**Messaging API**」
3. 點「**啟用 Messaging API**」
4. 建立 / 選擇一個 **Provider（提供者）**（填公司或品牌名）

**Step 2：到 LINE Developers 拿憑證**
1. 啟用後會連到 [LINE Developers Console](https://developers.line.biz)
2. 進入剛建立的 channel → 「**Messaging API**」分頁
3. 找「**Channel access token (long-lived)**」→ 點 **Issue** 產生 → 複製
4. 切到「**Basic settings**」分頁 → 複製「**Channel secret**」

**Step 3：填進設定檔**

依 `.agents/skills/hello-nora/platform-settings.md` 的保護與相容規則，把憑證存到本品牌 `.agents/skills/_brand/line-config.md`（個人資料，不進版控）：

```
## LINE OA
- Channel access token: 【貼上 long-lived token】
- Channel secret: 【貼上】
- LINE 官方帳號 ID（@開頭）: 【填】
```

完成後跟 Maya 說「LINE 設定好了」，就能開始發。

---

## ⚠️ 重要限制（一開始就要讓學員知道）

| 能做 | 不能做 |
|------|--------|
| ✅ 群發給所有好友（broadcast） | ❌ 自動撈私訊清單（LINE 沒這個 API）|
| ✅ 推播給特定用戶（push，需 userId）| ❌ 24h 即時自動接收回覆（需常駐伺服器）|
| ✅ 關鍵字自動回（LINE 內建，見下方）| |

**費用：** LINE 群發超過免費額度會**按則收費**（台灣輕用量方案約每月 500 則免費，超過計價）。發大量群發前先確認方案額度。

---

## 常見問題

| 問題 | 解法 |
|------|------|
| 找不到 Messaging API 選項 | 確認在 LINE OA Manager「設定」裡，不是聊天介面 |
| Token 發出來但發訊息 401 | Token 複製不完整，重發一次 long-lived token |
| 已被其他工具（如 SUPER 8）接 webhook | 不影響「發送」，群發/推播照樣可用；只有「接收」會衝突 |
| 群發發不出去 | 檢查帳號是否已通過 LINE 審核、是否超過免費額度 |
