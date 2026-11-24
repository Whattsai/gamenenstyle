# 平台設定與品牌憑證規約

五位角色、設定精靈、健康檢查與品牌建置都必須遵守本規約。先由 Nora 的 brief 確定本次品牌，以下 `_brand/` 一律代換成選定的 `_brand-品牌名/`；不得跨品牌尋找可用憑證。

本規約優先於角色或教材中的舊設定說明：非 Meta 平台不再寫回 `meta-config.md`；遇到要求貼 Token／密碼或拖入金鑰的舊步驟，改為由使用者填入本機私人設定或提供指定檔案路徑，不把實值送進對話。

## 各平台一份入口

| 平台 | 私人設定檔 | 空白範本 |
|---|---|---|
| FB、IG、Meta 廣告帳號／宿主連接器名稱 | `meta-config.md` | `meta-config.example.md` |
| Google 日曆、Google Ads | `google-config.md` | `google-config.example.md` |
| LINE | `line-config.md` | `line-config.example.md` |
| Cloudinary | `cloudinary-config.md` | `cloudinary-config.example.md` |
| WordPress | `wordpress-config.md` | `wordpress-config.example.md` |

全部位於選定品牌 `.agents/skills/_brand*/`。安裝只補空白 `.example.md`，實際連接該平台時才建立私人設定與原生憑證。

## 讀取與舊格式相容

1. 先讀對應平台的新檔。新檔存在時以新檔為準；新檔空白或缺欄位時停止並引導補齊，不回退舊檔。
2. 新檔不存在時，才相容讀取同品牌舊 `meta-config.md` 的對應區塊：Google／Google Calendar／Google 日曆／Google Ads、LINE／LINE OA、Cloudinary、WordPress。只取指定平台區塊，不取其他平台或其他品牌；沒有區塊代表尚未設定。FB／IG 繼續讀既有 `meta-config.md`。
3. 新設定只寫入各平台自己的檔案；不自動改寫或刪除舊檔，不在兩處重複保存金鑰。遷移時先確認用途、帳號與必要欄位，完成新檔後才採用新檔。
4. 健康檢查依上述順序逐平台盤點；範本不算已設定。只測已設定平台及實際可用的宿主連線，缺工具標示未實測，不把缺少 `meta-config.md` 當成所有平台都未設定。

## 建立、匯入與版控檢查

建立憑證前必須執行 `--check-secrets`，由專案 `.agents/hello-nora/manifest.json` 的 `tool_relative_path` 找回工具位置：

```text
python "<工具位置>/scripts/install.py" --project-root "<目標專案>" --check-secrets
```

私人路徑已追蹤、已暫存或未受忽略時停止；只列路徑與處理方式，保留本機資料與 Git 索引。由使用者處理版控後重查，不自動執行 Git 移除或歷史改寫。無 Git 專案只確認忽略規則，標示「尚無版控可檢查」；有 repository 卻無法檢查時停止。首次安裝由安裝器先建立整個 `_brand*` 與備份目錄的忽略規則，再寫入範本。沒有命令能力時，提供命令請使用者執行，不冒稱通過。

連接平台時，從使用者明確指定的外部檔案位置匯入同品牌的憑證目錄，保留原生 JSON 格式，不將 JSON 金鑰內容複製進 Markdown。既有目標檔案先確認差異，不覆蓋現有授權；原始外部檔案保留，由使用者自行決定後續處理。宿主管理的 OAuth 維持原機制，不強行匯出，只記錄連接器名稱、帳號、用途與授權方式。

## Google 路徑

- Google 日曆：`credentials/google-calendar/oauth.keys.json`、`credentials/google-calendar/tokens.json`，相對於選定品牌。MCP 與每次授權／重新授權都明確設定 `GOOGLE_OAUTH_CREDENTIALS` 與 `GOOGLE_CALENDAR_MCP_TOKEN_PATH` 的同品牌絕對路徑。
- Google Ads：`credentials/google-ads/` 保存連接器需要的原生 JSON；在 `google-config.md` 記錄帳號、用途、Customer ID、Developer Token 與憑證檔位置。自架連接器必須使用品牌專屬授權目錄，核對所用版本支援的環境變數／參數，同時套用至授權與執行階段，驗證實際落點，避免落回共用預設位置；不支援隔離時先停止設定。宿主 OAuth 不強行匯出。
- `google-config.md` 只記必要設定與檔案位置；JSON 內已有的金鑰、refresh token 不重複保存。切換品牌時使用品牌專屬連線與帳號，不沿用另一品牌的程序或預設帳號。

## 保留與輸出

新增品牌僅從工具來源 `skills/_brand/` 的白名單空白範本複製；不可複製已填寫的品牌、私人設定、`credentials/`、稱呼或 Token。透過安裝器補模板時會保留既有檔案。

安裝、更新與移除保留所有品牌設定、原生憑證、稱呼與未管理檔案；不把私人內容寫入安裝日誌、戰情記錄、管理 manifest 或管理備份。錯誤只回報路徑與狀態，不回顯 Token、密碼、JSON 內容或帶密鑰的命令。憑證保留為本機文字檔，本方案提供版控保護，未新增加密。

OAuth／API 權限、發布前確認、節流與真實數據要求仍須遵守；通過版控檢查不代表外部平台已連線或取得發布同意。
