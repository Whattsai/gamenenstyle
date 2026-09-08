# Overview 目錄指引

`overview/` 是 AI 讀取專案現況的主要入口。新子專案複製模板後，請在專案已有實際程式碼、設定與啟動方式後使用 `$initial-overview` 產生完整內容。

## 建議結構

| 目錄 | 用途 |
|---|---|
| `01-architecture/` | 系統概述、分層邊界、runtime flow、模組地圖、相依關係 |
| `02-development-guidelines/` | AI coding rules、檔案放置規則、AI workflow stages |
| `03-contracts/` | API contract、資料 contract、事件與設定 key |
| `04-deployment/` | 部署檢查表、環境變數模板與安全規則 |

## 建置規則

- 空白模板只保留目錄與指引，不填入未確認的架構、API、資料或部署內容。
- `AGENTS.md` 只作為 AI 入口與文件索引，細節應寫入 `overview/` 對應文件。
- 每次功能開發完成前，必須檢查是否需要同步更新 `overview/`。
- 若判斷不需更新 `overview/`，交付時需說明原因。
