# Meta API 設定

> 連接時才建立同品牌 `meta-config.md`，先依 `hello-nora/platform-settings.md` 執行 `--check-secrets`。本入口管理 FB／IG；其他平台使用各自的空白範本，既有 meta-config.md 保留。

> 🔒 **這份檔案裡的 Page Token 等於你粉專的「鑰匙」，外洩 = 別人可以用你的名義發文、改設定，甚至接管粉專。請當成密碼一樣顧好：**
> - **別提交到版本控制**（`.gitignore` 已排除）。
> - **別放進會同步/分享的雲端資料夾**（iCloud 雲碟、Google Drive、Dropbox 的共用夾…）——同步到別台裝置或被別人看到都會外洩。這個檔留在自己電腦的 `.agents/skills/_brand/meta-config.md` 就好。
> - **別截圖外傳、別貼進群組、別貼給任何線上工具或對話**。要給團隊看設定，遮掉 Token 那一行。
> - **電腦的自動備份**（如 Time Machine、雲端備份）也會把它一起備走，留意備份去處。
> - **萬一外洩怎麼補救**：到 Facebook **改密碼**，所有舊 Token 會立刻失效；或到 Meta 開發者後台**移除/重建那個 App**，再照 Unit 7 重新產一次 Token。

---

## Facebook 粉絲專頁

- **粉絲專頁名稱**：[你的粉絲專頁名稱]
- **粉絲專頁 ID**：[你的粉專 ID，一串數字]
- **Page Access Token**：[貼入永久 Page Token]

## Instagram（選用，有 IG 商業帳號才填）

- **IG Business Account ID**：[從 Graph API 查詢：GET /{page-id}?fields=instagram_business_account]
- Token 同上（Page Token 可同時用於 IG）

## App 資訊

- **App 名稱**：[你的 Meta App 名稱]
- **App ID**：[例：2447498729057493]
- **API 版本**：v25.0

## Token 有效期

- **Token 類型**：永久 Page Token（不會過期，除非手動撤銷或更改 FB 密碼）
- **建立日期**：[填入日期]
- **下次檢查**：[建立日期 + 6 個月，確認 App 沒被停用]

---

## 如何取得 Page Token（簡要步驟）

詳細步驟請見課程 **Unit 7**（repo 裡的 `course/unit-7-meta.md`，或藍諾後台對應單元）

1. 建立 Meta App（Business 類型，勾選「內容管理」使用案例）
2. App → 使用案例 → 自訂「管理粉絲專頁所有內容」→ 加入 `pages_manage_posts`
3. Graph API Explorer → 加入權限 → Generate Access Token
4. 用 `/me/accounts` 取得 Page Token
5. 在你自己的 Terminal 換成長期 Token（60 天 User Token → 永久 Page Token）
