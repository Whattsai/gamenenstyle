# 安裝指引

安裝器只使用 Python 標準函式庫，需要 Python 3.10 以上與目標專案寫入權限。支援有 Git／無 Git 的專案，工具與專案路徑均可含中文、空白。
工具位置以相對路徑記錄；Windows 跨磁碟時，先將工具放到目標專案所在磁碟。

## 預覽與安裝

下載或取得這份已通用化工具，保留整個資料夾。指定既有的目標專案，先預覽再執行：

```text
python "<工具位置>/scripts/install.py" --project-root "<目標專案>"
python "<工具位置>/scripts/install.py" --project-root "<目標專案>" --install
```

目標固定為該專案 `.agents/skills/`。五位角色與 10 個輔助技能完整複製，包含工作流、參考資料、字幕腳本與字型。
課程、範例、資源及圖片另存於 `.agents/hello-nora/docs/`；安裝器會重寫並檢查本地文件引用。
所有技能與品牌路徑都以目標專案根目錄為基準，請讓 AI 在該專案開啟並讀取技能。斜線指令是否顯示依環境支援；也可指定技能名稱與 SKILL.md。

`.agents/hello-nora/manifest.json` 記錄工具相對位置、管理檔案及 SHA-256。同名非管理技能遇到衝突即停止，不會自動收編。
品牌沿用 `.agents/skills/_brand*/`：既有品牌、憑證與稱呼全部保留，只補入缺少的模板。
安裝器維護專案 `.gitignore` 的專屬區塊，忽略全部 `_brand*` 私有資料與 `.agents/hello-nora/backups/`；忽略規則不會移除 Git 已追蹤的內容。
若品牌或憑證已在 Git 中，先從版控移除並依需要撤銷外洩憑證；不要提交私人品牌內容。

## 平台設定與憑證保護

設定分為 `meta-config.md`（FB／IG）、`google-config.md`（日曆／Ads）、`line-config.md`、`cloudinary-config.md`、`wordpress-config.md`。安裝只補空白範本；連接時才建立私人設定與同品牌原生 JSON。舊格式相容、Google 路徑及多品牌隔離依 [共用規約](skills/hello-nora/platform-settings.md)。

建立憑證前執行唯讀檢查：

```text
python "<工具位置>/scripts/install.py" --project-root "<目標專案>" --check-secrets
```

安裝／更新先檢查私人路徑及 Git 索引；首次安裝先建立並驗證忽略規則，再寫範本／備份。已追蹤、已暫存或未受忽略時停止，保留資料及索引，由使用者處理後重查。無 Git 標示「尚無版控可檢查」，repository 檢查失敗不能回報通過。來源只接受白名單且符合已稽核雜湊的空白範本，拒絕混入私人設定／憑證。本方案未新增加密。

## 重複安裝與更新

相同工具、相同目標重跑 `--install` 不會改動管理檔案。管理檔案有本地修改就停止，請先備份並合併差異，再預覽。
已刪除的上游管理檔案會隨更新移除；其他技能與使用者額外建立的檔案會保留。
更新前的管理檔案備份於 `.agents/hello-nora/backups/<內容雜湊>/`，保留原有路徑。備份含私有資訊的可能性與原檔相同，不要分享。

「更新團隊」先依工具的來源更新技能完成三方比較與驗證；回報能力變更後，明確詢問是否同步至所在專案根目錄技能，收到同意才執行上述安裝器。
不要直接將來源 clone／ZIP 覆蓋到已安裝技能。來源更新需要 Git，安裝與移除不需要 Git。

## 驗收安裝

1. 重新載入環境的技能，或開一個新對話，讀取專案 `.agents/skills/hello-nora/SKILL.md` 並說「你好」。
2. 確認五位角色和 10 個輔助技能的 SKILL.md 都在，並檢查字型、腳本與參考文件。安裝器亦會驗證引用完整性。
3. 第一次見面時 Nora 詢問稱呼，偵測空白品牌後直接逐題引導建置；不要把這個行為測試當成外部平台連線已成功。

找不到技能時，先確認目前開啟的專案與環境的技能探索方式，再用同一入口預覽修復。安裝器拒絕符號連結與 junction，避免寫入指定專案以外。

## 填好你的品牌資料

打開 `_brand/` 底下這幾個檔填寫（**最簡單**：直接跟 AI 說「幫我打開品牌資料檔」，它會幫你開）：

**4 份核心：**
- `brand-guide.md` — 品牌規範
- `voice-profile.md` — 語氣檔案（決定「怎麼講」）
- `product-info.md` — 產品資訊
- `icp.md` — 理想客戶

**1 份加分（強烈建議）：**
- `industry-knowledge.md` — 產業知識（決定「講什麼」：術語、常見迷思、客戶真正的顧慮）

> 💡 產業知識**想不出來不用勉強**——跟 Nora 說「你幫我查」，她會自己上網查一輪整理成初稿給你確認。
> 少了這份，AI 只能寫出語氣對但內容空洞的文案。

> 從目標專案的 `.agents/skills/_brand/` 開啟檔案即可；多品牌請選對 `_brand-品牌名/`。

不知道怎麼填？看 [BRAND-SETUP.md](BRAND-SETUP.md) 的步驟引導。

---

## 外部工具（選用）

| 工具／能力 | 適用夥伴 | 用途 |
|---|---|---|
| 搜尋／網頁讀取 | Nora／Iris | 產業知識、關鍵字與競品研究 |
| 圖像生成工具 | Leon 提供 brief | 使用者選定工具生圖，Leon 維持 brief 分工 |
| Meta Graph API／LINE Messaging API | Maya | 發文、排程、留言與群發；先確認內容與節流 |
| Meta Ads MCP | Jack | 依帳戶實際開放與權限拉取真實數據；未連線時貼數據分析 |
| Google Ads MCP | Jack／Iris | 進階串接見 [說明](ADVANCED-google-ads.md) |
| Google Calendar MCP | Nora | OAuth、Node.js 與連線設定見 [說明](ADVANCED-google-calendar.md) |
| Canva MCP | Leon | 套品牌版、改尺寸等後製（選用） |
| Chrome／ffmpeg／Whisper | Leon | 輪播渲染、影片尺寸與字幕；各工作流標明其依賴與實測限制 |

平台 OAuth、API 權限及發布前確認仍依原有流程；工具允許設定不代表內容已獲發布同意。

## 移除

先預覽，再執行移除：

```text
python "<工具位置>/scripts/install.py" --project-root "<目標專案>" --remove
python "<工具位置>/scripts/install.py" --project-root "<目標專案>" --remove --install
```

只移除 manifest 管理且雜湊未變的檔案與 manifest，保留品牌、憑證、稱呼、備份、其他技能與額外檔案。
管理檔案已修改時停止；請先保留並處理本地修改。移除後保留敏感資料與備份的忽略規則，避免意外提交。
