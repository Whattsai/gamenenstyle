# Google 設定（空白範本）

> 連接時才建立同品牌 `google-config.md`；先依 `hello-nora/platform-settings.md` 執行 `--check-secrets`。JSON 保留原生格式，只記檔案位置，不在本檔重複金鑰與 refresh token。所有路徑相對於本品牌目錄，提供給 MCP 時轉成絕對路徑。

## Google 日曆

- **帳號**：[填入授權帳號]
- **用途**：[填入用途]
- **連接器名稱**：[填入本品牌專屬名稱]
- **Calendar ID**：[填入日曆 ID]
- **授權方式**：[本機 JSON 或宿主管理 OAuth]
- **OAuth JSON**：[credentials/google-calendar/oauth.keys.json]
- **Token JSON**：[credentials/google-calendar/tokens.json]

本機 MCP 明確指定 `GOOGLE_OAUTH_CREDENTIALS` 與 `GOOGLE_CALENDAR_MCP_TOKEN_PATH`；授權與執行使用相同的本品牌絕對路徑。宿主 OAuth 只記連線，不匯出。

## Google Ads

- **帳號**：[填入授權帳號]
- **用途**：[填入用途]
- **連接器名稱／版本**：[填入本品牌專屬名稱及版本]
- **Customer ID**：[填入廣告客戶 ID]
- **Login Customer ID**：[有管理帳號時填入]
- **Developer Token**：[本機私填或填入由宿主管理]
- **授權方式**：[本機 JSON 或宿主管理 OAuth]
- **授權目錄**：[credentials/google-ads/]
- **憑證 JSON**：[credentials/google-ads/application_default_credentials.json]
- **執行與授權參數**：[填入該版本支援的品牌目錄環境變數／參數及實際落點]

自架授權與執行階段均使用品牌專屬目錄，不得落回共用預設位置；不能隔離時停止。既有 JSON 由使用者指定位置匯入，不重複抄寫其金鑰。
