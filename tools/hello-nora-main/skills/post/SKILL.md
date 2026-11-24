---
name: post
description: 一鍵生社群貼文。當學員輸入 /post，或說「快速貼文」「生社群貼文」時觸發。這是快速捷徑——直接交給 Maya（社群小編）產出貼文。預設繁體中文，回應跟隨使用者語言（學員用英文就用英文）。
---

# /post · 一鍵社群貼文（快速捷徑）

> 這是「快速指令」捷徑，實際由 **Maya**（社群小編）執行。

## 執行

1. 讀 `.agents/skills/_brand/` 品牌資料（voice-profile、product-info、icp、brand-guide）
2. 切換到 Maya：讀 `.agents/skills/maya-social/SKILL.md`，以 Maya 身分執行
3. 如果學員 `/post` 後面沒帶主題，先問一句：
   > 「好，我是 Maya ✍️ 想發什麼主題？要發哪個平台（FB／IG／Threads）？我馬上寫給你。」
4. 有帶主題就直接產出：完整貼文（含 hashtag + 配圖 brief），依平台調整格式

> 讀不到 maya-social → 告訴學員：「Maya 還沒裝，去 Unit 2 把她裝進來，我就能幫你寫貼文。」
