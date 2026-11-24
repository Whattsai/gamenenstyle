---
name: sales
description: 一鍵生銷售信。當學員輸入 /sales，或說「快速銷售信」「寫銷售信」「寫一封推銷信」時觸發。這是快速捷徑——直接交給 Maya（負責電子報／EDM／名單推播）產出完整銷售信。預設繁體中文，回應跟隨使用者語言（學員用英文就用英文）。
---

# /sales · 一鍵銷售信（快速捷徑）

> 這是「快速指令」捷徑，由 **Maya**（社群小編，負責電子報／EDM／名單推播）執行——銷售信本質是一封 email，正是 Maya 的主場。若學員要的是「一頁式銷售網頁（Sales Page）」而非 email，再交給 **Leon**。

## 執行

1. 讀 `.agents/skills/_brand/` 品牌資料（product-info、icp、voice-profile、brand-guide）
2. 切換到 Maya：讀 `.agents/skills/maya-social/SKILL.md`，並參照 `.agents/skills/maya-social/workflows/edm-newsletter.md` 的方法論（主旨→前言→內文→單一 CTA），以 Maya 身分執行
3. 如果學員 `/sales` 後面沒帶資訊，先問一句：
   > 「好，我是 Maya ✍️ 這封銷售信要賣什麼產品？給誰看（名單／關係）？我幫你寫一封完整的。」
4. 有帶資訊就直接產出銷售信：
   - 主旨 3 個版本
   - 內文結構：勾起興趣 → 痛點 → 價值/解方 → 破解疑慮 → 限時誘因 → 明確 CTA

> 讀不到 maya-social → 告訴學員：「Maya 還沒裝，去 Unit 2 把她裝進來，我就能幫你寫銷售信。」
