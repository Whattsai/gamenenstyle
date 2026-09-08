# SPEC-001 TDD 測試清單

> **從 BDD Markdown 場景文件自動生成**
> **來源**: [docs/bdd/SPEC-001-StockDashboard-BDD.md](../bdd/SPEC-001-StockDashboard-BDD.md)
> **生成日期**: 2026-01-19

---

## 🎯 開發進度總覽

### 整體進度

```
📦 SPEC-001 台股即時資訊儀表板 TDD 開發
├─ 🔴 Red-Green-Refactor 狀態: 未開始
├─ ⏰ 開始時間: -
├─ 📅 預計完成: -
└─ 👤 負責人: -

進度條: [░░░░░░░░░░░░░░░░░░░░] 0% (0/72)
```

### 分層進度追蹤

| 測試層級 | 進度 | 已完成 | 進行中 | 待開始 | 狀態 |
|---------|------|--------|--------|--------|------|
| **1️⃣ 單元測試** | `[░░░░░░░░░░░░░░░░░░░░] 0%` | 0/45 | 0 | 45 | ⏸️ 未開始 |
| ├─ HoldingsConfigService | `[░░░░░░░░░░] 0%` | 0/8 | 0 | 8 | - |
| ├─ StockApplicationService | `[░░░░░░░░░░] 0%` | 0/12 | 0 | 12 | - |
| ├─ PriceDataService | `[░░░░░░░░░░] 0%` | 0/7 | 0 | 7 | - |
| ├─ AutoUpdateScheduler | `[░░░░░░░░░░] 0%` | 0/6 | 0 | 6 | - |
| └─ ExportService | `[░░░░░░░░░░] 0%` | 0/3 | 0 | 3 | - |
| **2️⃣ 集成測試** | `[░░░░░░░░░░░░░░░░░░░░] 0%` | 0/12 | 0 | 12 | ⏸️ 未開始 |
| ├─ StockService | `[░░░░░░░░░░] 0%` | 0/6 | 0 | 6 | - |
| ├─ AutoUpdateService | `[░░░░░░░░░░] 0%` | 0/3 | 0 | 3 | - |
| └─ HoldingsManagement | `[░░░░░░░░░░] 0%` | 0/3 | 0 | 3 | - |
| **3️⃣ API 測試** | `[░░░░░░░░░░░░░░░░░░░░] 0%` | 0/15 | 0 | 15 | ⏸️ 未開始 |
| └─ StocksController | `[░░░░░░░░░░] 0%` | 0/15 | 0 | 15 | - |

### 當前 Sprint 狀態

| 項目 | 內容 |
|------|------|
| **當前階段** | 📋 Plan Mode - 準備開始 TDD |
| **當前測試** | - |
| **Red-Green-Refactor** | - |
| **最後更新** | 2026-01-19 |
| **備註** | 等待使用者確認測試清單 |

### 里程碑

- [ ] **M1**: 完成所有單元測試（45/45）
- [ ] **M2**: 完成所有集成測試（12/12）
- [ ] **M3**: 完成所有 API 測試（15/15）
- [ ] **M4**: 所有測試通過 + 代碼覆蓋率 ≥80%
- [ ] **M5**: Code Review 完成
- [ ] **M6**: 部署至測試環境

### 關鍵指標

| 指標 | 目標 | 當前 | 狀態 |
|------|------|------|------|
| **測試通過率** | 100% | - | ⏸️ |
| **代碼覆蓋率** | ≥80% | - | ⏸️ |
| **平均測試時間** | <5s | - | ⏸️ |
| **技術債** | 0 項 | - | ⏸️ |

### 每日進度記錄

#### 2026-01-19（今日）
- ✅ 完成 BDD Markdown 場景文件（23 個場景）
- ✅ 生成 TDD 測試清單（72 個測試）
- ⏸️ 等待使用者確認後進入 Agent Mode

---

## 1️⃣ 單元測試（Unit Tests）

### 1.1 HoldingsConfigService 單元測試
**位置**: `tests/Invegst.Unit.Tests/Infrastructure/HoldingsConfigServiceTests.cs`

**測試目標**: 持股設定檔的載入、解析、驗證

- [ ] `LoadHoldingsAsync_ValidJsonFile_ReturnsHoldingsList`
  - 測試讀取有效的 JSON 設定檔
  - 驗證返回正確的持股記錄列表
  - 驗證持股記錄數量正確（4 筆）

- [ ] `LoadHoldingsAsync_EmptyJsonFile_ReturnsEmptyList`
  - 測試讀取空的 JSON 檔案
  - 驗證返回空列表，不拋出異常

- [ ] `LoadHoldingsAsync_InvalidJsonFormat_ThrowsJsonException`
  - 測試讀取無效的 JSON 格式
  - 驗證拋出 `JsonException`
  - 驗證錯誤訊息包含格式說明

- [ ] `LoadHoldingsAsync_FileNotFound_ThrowsFileNotFoundException`
  - 測試讀取不存在的檔案
  - 驗證拋出 `FileNotFoundException`

- [ ] `LoadHoldingsAsync_InvalidStockId_LogsWarning`
  - 測試包含無效股票代號（如 9999）
  - 驗證記錄警告日誌
  - 驗證仍返回其他有效的持股記錄

- [ ] `LoadHoldingsAsync_ProvideJsonFormatExample_WhenError`
  - 測試錯誤處理時提供正確格式範例
  - 驗證錯誤訊息包含 JSON 範例

- [ ] `ReloadHoldingsAsync_AfterFileModification_ReturnsUpdatedData`
  - 測試重新載入設定檔
  - 驗證返回更新後的持股數據

- [ ] `ParseHoldings_WithMultipleRecordsForSameStock_AggregatesCorrectly`
  - 測試同一股票有多筆記錄（如 2330 有 2 筆）
  - 驗證正確聚合總持有張數
  - 驗證計算平均購入價格

### 1.2 StockApplicationService 單元測試
**位置**: `tests/Invegst.Unit.Tests/Application/StockApplicationServiceTests.cs`

**測試目標**: 股票業務邏輯、數據聚合、更新策略

- [ ] `GetAllHoldingsAsync_WhenConfigLoaded_ReturnsAggregatedHoldings`
  - 測試獲取所有持股
  - 驗證返回聚合後的持股列表
  - 驗證每檔股票的持股記錄數量正確

- [ ] `GetAllHoldingsAsync_SortByStockIdAsc_ReturnsInCorrectOrder`
  - 測試按股票代號升序排序
  - 驗證排序結果正確

- [ ] `GetAllHoldingsAsync_SortByStockIdDesc_ReturnsInCorrectOrder`
  - 測試按股票代號降序排序
  - 驗證排序結果正確

- [ ] `GetAllHoldingsAsync_SortByMarketValueDesc_ReturnsInCorrectOrder`
  - 測試按市值降序排序（最高在上）
  - 驗證排序結果正確

- [ ] `SearchHoldingsAsync_WithKeyword_ReturnsFilteredResults`
  - 測試搜尋功能（輸入"台積電"）
  - 驗證只返回符合條件的股票

- [ ] `UpdatePriceDataAsync_ValidStockId_UpdatesPriceData`
  - 測試更新單一股票價格
  - 驗證價格數據正確更新
  - 驗證更新時間被記錄

- [ ] `UpdatePriceDataAsync_ApiFailure_HandlesGracefullyWithRetry`
  - 測試 API 呼叫失敗
  - 驗證重試機制
  - 驗證保留上次成功數據

- [ ] `UpdatePriceDataAsync_NetworkError_LogsErrorAndRetainsOldData`
  - 測試網路錯誤
  - 驗證記錄錯誤日誌
  - 驗證保留舊數據

- [ ] `UpdateAllStockDataAsync_CallsAllDataProviders`
  - 測試刷新所有數據
  - 驗證呼叫所有數據提供者（價格、基本面、籌碼、技術、消息）

- [ ] `UpdateSpecificDataTypeAsync_OnlyUpdatesTargetType`
  - 測試只刷新特定類型數據（如只刷新價格）
  - 驗證其他數據不受影響

- [ ] `CalculateProfitLossAsync_WithValidHolding_ReturnsCorrectValues`
  - 測試計算損益
  - 輸入：2.5 張 @ 580 元，目前 620 元
  - 驗證未實現損益 = 100,000 元
  - 驗證報酬率 = 6.90%

- [ ] `GetTradingRecommendationAsync_AnalyzesAllData_ReturnsRecommendation`
  - 測試生成操作建議
  - 驗證建議包含 "買入"、"持有" 或 "賣出"
  - 驗證包含關鍵指標說明

### 1.3 PriceDataService 單元測試
**位置**: `tests/Invegst.Unit.Tests/Application/PriceDataServiceTests.cs`

**測試目標**: 即時價格、五檔報價、逐筆成交數據處理

- [ ] `GetRealTimePriceAsync_FromCache_ReturnsWithoutApiCall`
  - 測試從快取返回數據（30 秒內）
  - 驗證不呼叫外部 API
  - 驗證返回快取數據

- [ ] `GetRealTimePriceAsync_CacheExpired_RefetchesFromApi`
  - 測試快取過期（超過 1 分鐘）
  - 驗證重新呼叫 API
  - 驗證更新快取內容

- [ ] `GetLevelTwoQuotesAsync_FromCache_ReturnsWithin5Seconds`
  - 測試五檔報價快取（5 秒內）
  - 驗證不呼叫外部 API

- [ ] `GetLevelTwoQuotesAsync_CacheExpired_RefetchesFromApi`
  - 測試五檔報價快取過期（超過 5 秒）
  - 驗證重新呼叫 API

- [ ] `GetTickByTickDataAsync_ShowsDelayWarning_WhenDataIsDelayed`
  - 測試逐筆成交資料延遲
  - 驗證顯示延遲警示訊息
  - 驗證標示不適合當沖

- [ ] `GetVWAPAsync_CalculatesCorrectly_BasedOnVolumeAndPrice`
  - 測試 VWAP 計算
  - 驗證計算公式正確
  - 驗證顯示偏離率

- [ ] `GetPriceDistributionAsync_ReturnsDistributionChart`
  - 測試分價量表數據
  - 驗證各價位成交分布
  - 驗證標示當前股價位置

### 1.4 AutoUpdateScheduler 單元測試
**位置**: `tests/Invegst.Unit.Tests/Application/AutoUpdateSchedulerTests.cs`

**測試目標**: 自動更新排程、交易時間判斷

- [ ] `ShouldUpdatePrice_DuringTradingHours_ReturnsTrue`
  - 測試交易時間內（08:30-13:30）
  - 驗證應該執行價格更新

- [ ] `ShouldUpdatePrice_OutsideTradingHours_ReturnsFalse`
  - 測試非交易時間（14:00 後）
  - 驗證不執行價格更新

- [ ] `ShouldUpdateTechnicals_DuringTradingHours_ReturnsTrue`
  - 測試交易時間內
  - 驗證應該執行技術面更新（每 3 分鐘）

- [ ] `ShouldUpdateChips_BeforeMarketOpen_ReturnsTrue`
  - 測試開盤前（08:00）
  - 驗證應該執行籌碼面更新

- [ ] `ShouldUpdateLevelTwo_DuringTradingHours_ReturnsTrue`
  - 測試交易時間內
  - 驗證應該執行五檔/逐筆更新（每 5 秒）

- [ ] `GetUpdateInterval_ForDifferentDataTypes_ReturnsCorrectInterval`
  - 測試不同數據類型的更新間隔
  - 價格：1 分鐘
  - 技術面：3 分鐘
  - 五檔/逐筆：5 秒

### 1.5 ExportService 單元測試
**位置**: `tests/Invegst.Unit.Tests/Application/ExportServiceTests.cs`

**測試目標**: 持股配置匯出功能

- [ ] `ExportToJsonAsync_WithValidHoldings_GeneratesCorrectFormat`
  - 測試匯出為 JSON 格式
  - 驗證 JSON 格式正確
  - 驗證包含完整持股結構

- [ ] `ExportToJsonAsync_EmptyHoldings_GeneratesEmptyArray`
  - 測試匯出空持股列表
  - 驗證生成空陣列格式

- [ ] `ExportToJsonAsync_ReturnsDownloadableContent`
  - 測試返回可下載內容
  - 驗證內容類型為 application/json

---

## 2️⃣ 集成測試（Integration Tests）

### 2.1 StockService 集成測試
**位置**: `tests/Invegst.Integration.Tests/Services/StockServiceIntegrationTests.cs`

**測試目標**: 組件協作、完整業務流程

- [ ] `LoadAndUpdateAllStocks_MultipleStocks_AllDataUpdated`
  - 測試載入並更新多檔股票
  - 驗證所有數據類型都被更新
  - 使用 InMemory Database

- [ ] `LoadAndUpdateAllStocks_PartialApiFailure_SuccessfulStocksUpdated`
  - 測試部分 API 失敗情況
  - 驗證成功的股票數據被更新
  - 驗證失敗的股票記錄錯誤

- [ ] `ReloadConfig_InvalidJson_ShowsErrorMessageAndRetainsOldConfig`
  - 測試重新載入無效配置
  - 驗證顯示錯誤訊息
  - 驗證保留舊配置

- [ ] `ReloadConfig_AddNewStock_StartsDataCollection`
  - 測試新增股票（如 2303 聯電）
  - 驗證開始為新股票蒐集數據
  - 驗證更新持股列表

- [ ] `ReloadConfig_RemoveStock_StopsDataCollection`
  - 測試移除股票（如 2454）
  - 驗證停止為該股票蒐集數據
  - 驗證從列表中移除

- [ ] `CacheInvalidation_AfterManualUpdate_ForcesRefresh`
  - 測試手動更新後的快取失效
  - 驗證強制重新取得數據

### 2.2 AutoUpdateService 集成測試
**位置**: `tests/Invegst.Integration.Tests/Services/AutoUpdateServiceIntegrationTests.cs`

**測試目標**: 自動更新機制、排程執行

- [ ] `AutoUpdate_DuringTradingHours_UpdatesCorrectly`
  - 測試交易時間內的自動更新
  - 驗證價格每 1 分鐘更新
  - 驗證技術面每 3 分鐘更新

- [ ] `AutoUpdate_OutsideTradingHours_DoesNotUpdate`
  - 測試非交易時間
  - 驗證不執行自動更新

- [ ] `AutoUpdate_LevelTwoData_UpdatesEvery5Seconds`
  - 測試五檔/逐筆數據
  - 驗證每 5 秒更新

### 2.3 持股配置管理集成測試
**位置**: `tests/Invegst.Integration.Tests/Services/HoldingsManagementIntegrationTests.cs`

**測試目標**: 持股配置的完整生命週期

- [ ] `AddHolding_ToExistingStock_UpdatesAggregation`
  - 測試為現有股票新增持股記錄
  - 驗證聚合計算更新
  - 驗證平均成本重新計算

- [ ] `RemoveHolding_FromStock_UpdatesAggregation`
  - 測試移除持股記錄
  - 驗證聚合計算更新

- [ ] `ModifyHolding_UpdatesCalculations`
  - 測試修改持股張數
  - 驗證持有股數重新計算
  - 驗證市值重新計算
  - 驗證損益重新計算

---

## 3️⃣ API 端點測試（API Tests）

### 3.1 StocksController API 測試
**位置**: `tests/Invegst.Integration.Tests/Controllers/StocksControllerTests.cs`

**測試框架**: WebApplicationFactory + xUnit

- [ ] `GET_api_stocks_holdings_ReturnsOkWithHoldingsList`
  - 測試 `GET /api/stocks/holdings`
  - 驗證返回 200 OK
  - 驗證返回持股列表（3 檔股票）
  - 驗證 ApiResponse 格式正確

- [ ] `GET_api_stocks_holdings_WithSort_ReturnsOrderedList`
  - 測試 `GET /api/stocks/holdings?sort=stockId&order=asc`
  - 驗證返回按股票代號排序的列表

- [ ] `GET_api_stocks_holdings_WithSearch_ReturnsFilteredList`
  - 測試 `GET /api/stocks/holdings?search=台積電`
  - 驗證只返回符合搜尋條件的股票

- [ ] `GET_api_stocks_holdings_WhenEmpty_ReturnsOkWithEmptyArray`
  - 測試空持股列表
  - 驗證返回 200 OK
  - 驗證返回空陣列

- [ ] `GET_api_stocks_stockId_ReturnsOkWithDetailedInfo`
  - 測試 `GET /api/stocks/2330`
  - 驗證返回 200 OK
  - 驗證返回完整股票資訊（價格、基本面、籌碼、技術、消息）

- [ ] `GET_api_stocks_stockId_InvalidId_ReturnsNotFound`
  - 測試 `GET /api/stocks/9999`
  - 驗證返回 404 Not Found

- [ ] `GET_api_stocks_stockId_price_ValidId_ReturnsOkWithPriceData`
  - 測試 `GET /api/stocks/2330/price`
  - 驗證返回即時價格數據

- [ ] `GET_api_stocks_stockId_price_ReturnsWithUpdateTime`
  - 測試價格數據包含更新時間
  - 驗證時間戳格式正確

- [ ] `PUT_api_stocks_stockId_price_ManualUpdate_ReturnsOk`
  - 測試 `PUT /api/stocks/2330/price`（手動更新）
  - 驗證返回 200 OK
  - 驗證價格數據被更新

- [ ] `GET_api_stocks_stockId_levelTwo_ReturnsOkWithQuotes`
  - 測試 `GET /api/stocks/2330/levelTwo`
  - 驗證返回五檔報價
  - 驗證包含委買五檔和委賣五檔

- [ ] `GET_api_stocks_stockId_tickByTick_ReturnsOkWithTrades`
  - 測試 `GET /api/stocks/2330/tickByTick`
  - 驗證返回最近 100 筆成交記錄

- [ ] `GET_api_stocks_stockId_vwap_ReturnsOkWithVWAPData`
  - 測試 `GET /api/stocks/2330/vwap`
  - 驗證返回 VWAP 數據
  - 驗證包含偏離率

- [ ] `POST_api_stocks_reload_config_ValidJson_ReturnsOk`
  - 測試 `POST /api/stocks/reload-config`
  - 驗證返回 200 OK
  - 驗證配置被重新載入

- [ ] `POST_api_stocks_reload_config_InvalidJson_ReturnsBadRequestWithErrorMessage`
  - 測試重新載入無效 JSON
  - 驗證返回 400 Bad Request
  - 驗證錯誤訊息包含格式範例

- [ ] `POST_api_stocks_export_config_ReturnsOkWithJsonFile`
  - 測試 `POST /api/stocks/export-config`
  - 驗證返回可下載的 JSON 檔案
  - 驗證內容類型為 application/json

---

## 📝 測試清單使用說明

### Step 1: 確認測試清單

請檢查此測試清單是否：
- ✅ 涵蓋所有 BDD 場景
- ✅ 測試命名清晰（遵循 `MethodName_Scenario_ExpectedBehavior` 格式）
- ✅ 測試分層合理（Unit → Integration → API）

### Step 2: Plan Mode 討論

建議實作順序：
1. **先實作 Unit Tests**（由內而外）
   - HoldingsConfigService
   - StockApplicationService
   - PriceDataService
   - AutoUpdateScheduler
   - ExportService

2. **再實作 Integration Tests**
   - StockService 集成測試
   - AutoUpdateService 集成測試
   - HoldingsManagement 集成測試

3. **最後實作 API Tests**
   - StocksController API 測試

### Step 3: Agent Mode 執行 TDD

進入 Agent Mode，按照 Red-Green-Refactor 循環執行：
```
🔴 Red Phase   → 寫一個失敗的測試
🟢 Green Phase → 寫最少代碼使測試通過
♻️ Refactor    → 重構代碼，保持測試通過
重複循環...
```

---

## 🔗 相關文檔

- [BDD Markdown 場景文件](../bdd/SPEC-001-StockDashboard-BDD.md) - 完整業務場景
- [SDD 規格文檔](../specs/SPEC-001-StockDashboard.md) - 功能需求

---

**生成者**: AI (GitHub Copilot)
**最後更新**: 2026-01-19
**狀態**: ✅ 已生成，等待使用者確認
