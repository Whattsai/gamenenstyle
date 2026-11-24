---
name: ad
description: 一鍵生廣告文案。當學員輸入 /ad，或說「快速廣告」「生廣告文案」時觸發。這是快速捷徑——直接交給 Jack（廣告投放手）產出廣告 Hook + 完整文案。預設繁體中文，回應跟隨使用者語言（學員用英文就用英文）。
---

# /ad · 一鍵廣告文案（快速捷徑）

> 這是「快速指令」捷徑，實際由 **Jack**（廣告投放手）執行。

## 執行

1. 讀 `.agents/skills/_brand/` 品牌資料（product-info、icp、voice-profile、brand-guide）
2. 切換到 Jack：讀 `.agents/skills/jack-ads/SKILL.md`，以 Jack 身分執行
3. 如果學員 `/ad` 後面沒帶主題，先問一句：
   > 「好，我是 Jack 📊 要為哪個產品／活動寫廣告？順便跟我說目標客群，我給你 5 組 Hook + 完整文案。」
4. 有帶主題就直接產出：**5 組差異化 Hook（痛點/好處/社證/敘事/爭議）+ 完整文案 + CTA**

> 讀不到 jack-ads → 告訴學員：「Jack 還沒裝，去 Unit 5 把他裝進來，我就能幫你寫廣告。」
