---
name: tdd-development
description: 執行 TDD (Test-Driven Development) Red-Green-Refactor 循環，嚴格遵循測試先行原則逐一實現測試清單中的測試案例
license: MIT
---

# TDD Red-Green-Refactor 開發技能

此技能協助 AI 嚴格遵循 TDD 方法論，執行 Red-Green-Refactor 循環來實現功能。

## 何時使用此技能

- 使用者確認 TDD 測試清單後
- 使用者要求「開始 TDD 開發」或「執行 Red-Green-Refactor」
- 進入 Agent Mode 自動化 coding 階段
- 快速修復 Bug（直接從失敗測試開始）
- 重構既有代碼（先加保護性測試）

## 共用範本資產

- BDD 輸出範本：`.agents/skills/tdd-development/assets/SPEC-XXX-Template.sdd流水號-BDD.md`
- TDD 測試清單範本：`.agents/skills/tdd-development/assets/SPEC-XXX-Template.bdd流水號-TDD.md`
- 以上範本由 `bdd-feature-generation` 生成 BDD/TDD 文件時讀取。

## 行為規範

1. 嚴格遵循 TDD 完整測試循環
2. 嚴格遵循 Red-Green-Refactor 循環
3. 嚴格遵循測試清單，務必解決問題，所有測試都應該要成功
4. 遇到環境問題請自動解決，達成測試目標
5. 單元測試、集成測試、API測試通過後，一定要進行E2E驗證，確認改動合理才算完成

## 執行步驟：Red-Green-Refactor 循環

### Phase1：🔴 Red Phase（紅燈階段）

#### 1. 選擇下一個測試

從測試清單中選擇一個測試，優先順序：
1. **High 優先級**的單元測試
2. **High 優先級**的集成測試
3. **High 優先級**的 API 測試
4. 依次處理 Medium 和 Low 優先級

#### 2. 撰寫失敗的測試

1. 寫測試代碼
2. 執行測試
3. **確認測試失敗**（紅燈）
4. 確認失敗原因符合預期

**測試命名規範**：
```
[方法名]_[測試條件]_[預期結果]

範例：
✅ AddHoldingAsync_WithValidData_ShouldSucceed
✅ AddHoldingAsync_WithDuplicateStock_ShouldThrowInvalidOperation
✅ AddHoldingAsync_WithEmptyStockId_ShouldThrowArgumentException
```

#### 允許做的事

- ✅ 寫測試代碼
- ✅ 定義測試數據
- ✅ 設定 Mock 行為
- ✅ 使用 Arrange-Act-Assert 模式

#### 禁止做的事

- ❌ 寫實現代碼
- ❌ 修改既有實現
- ❌ 跳過執行測試步驟

#### 範例

```csharp
// 🔴 Red: 先寫失敗測試
[Fact]
public async Task DeleteHoldingsBatchAsync_WithValidStockIds_ShouldSucceed()
{
    // Arrange
    var stockIds = new List<string> { "2330", "2317" };
    var mockRepo = new Mock<IStockRepository>();
    mockRepo.Setup(r => r.DeleteHoldingAsync(It.IsAny<string>()))
        .ReturnsAsync(true);
    var service = new StockApplicationService(mockRepo.Object, _mockLogger.Object);

    // Act
    var result = await service.DeleteHoldingsBatchAsync(stockIds);

    // Assert
    result.Success.Should().BeTrue();
    result.DeletedCount.Should().Be(2);
    mockRepo.Verify(r => r.DeleteHoldingAsync("2330"), Times.Once);
    mockRepo.Verify(r => r.DeleteHoldingAsync("2317"), Times.Once);
}

// 執行測試
// 輸出：❌ 'StockApplicationService' does not contain a definition for 'DeleteHoldingsBatchAsync'
```

### Phase2：🟢 Green Phase（綠燈階段）

#### 1. 撰寫最少代碼使測試通過

**遵循架構**：
- **Domain 層**：實體、值對象、驗證邏輯、Repository 介面
- **Application 層**：服務、DTO、業務邏輯協調
- **Infrastructure 層**：Repository 實現、外部數據源
- **Presentation 層**：控制器、API 端點

**代碼規範**：
- ✅ 使用 `async/await`
- ✅ 包含 `CancellationToken cancellationToken = default`
- ✅ 添加繁體中文 XML 文檔註釋
- ✅ 使用依賴注入
- ✅ API 返回 `ApiResponse<T>`


#### 2. 執行測試（應該通過）

// turbo
```powershell
dotnet test
```

**預期結果**：測試通過（綠燈 🟢）

#### 允許做的事

- ✅ 寫最少的實現代碼
- ✅ 使用硬編碼（如果能通過測試）
- ✅ 暫時忽略錯誤處理
- ✅ 只求通過，不求完美

#### 禁止做的事

- ❌ 過度設計
- ❌ 重構代碼
- ❌ 新增未測試的功能
- ❌ 優化性能

#### 範例

```csharp
// 🟢 Green: 寫最少代碼使測試通過
public async Task<BatchDeleteResult> DeleteHoldingsBatchAsync(List<string> stockIds)
{
    foreach (var stockId in stockIds)
    {
        await _repository.DeleteHoldingAsync(stockId);
    }

    return new BatchDeleteResult
    {
        Success = true,
        DeletedCount = stockIds.Count
    };
}

// 執行測試
// 輸出：✅ Test passed (0.2s)
```

### Phase3：♻️ Refactor Phase（重構階段）

#### 1. 檢查代碼品質

- 是否有重複代碼？
- 是否符合 SOLID 原則？
- 是否遵循 Clean Architecture？
- 是否符合 Domain Driven Design設計方法？
- 命名是否清晰？

#### 2. 重構代碼

保持測試通過的前提下優化代碼：
- 提取共用方法
- 簡化複雜邏輯
- 改善命名
- 添加註釋

#### 3. 再次執行測試

// turbo
```powershell
dotnet test
```

**預期結果**：測試依然通過（綠燈 🟢）

#### 允許做的事

- ✅ 消除重複代碼
- ✅ 改善命名
- ✅ 提取方法
- ✅ 優化演算法
- ✅ 加入驗證和錯誤處理
- ✅ 改善可讀性

#### 禁止做的事

- ❌ 新增功能
- ❌ 改變行為
- ❌ 修改測試（除非重構需要）
- ❌ 破壞現有測試

#### 範例

```csharp
// ♻️ Refactor: 加入驗證和錯誤處理
public async Task<BatchDeleteResult> DeleteHoldingsBatchAsync(List<string> stockIds)
{
    // 驗證
    if (stockIds == null || !stockIds.Any())
        throw new ArgumentException("股票代碼清單不能為空", nameof(stockIds));

    var result = new BatchDeleteResult();
    var failedStockIds = new List<string>();

    _logger.LogInformation("開始批次刪除 {Count} 筆持股", stockIds.Count);

    // 刪除每支股票
    foreach (var stockId in stockIds)
    {
        try
        {
            var deleted = await _repository.DeleteHoldingAsync(stockId);
            if (deleted)
            {
                result.DeletedCount++;
                _logger.LogInformation("成功刪除持股 {StockId}", stockId);
            }
            else
            {
                failedStockIds.Add(stockId);
                _logger.LogWarning("持股 {StockId} 不存在", stockId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "刪除股票 {StockId} 失敗", stockId);
            failedStockIds.Add(stockId);
        }
    }

    result.Success = !failedStockIds.Any();
    result.FailedStockIds = failedStockIds;

    return result;
}

// 執行所有測試
// 輸出： All tests passed (1.5s)

// 為新增的驗證邏輯寫測試（回到 Red Phase）
[Fact]
public async Task DeleteHoldingsBatchAsync_WithEmptyList_ShouldThrowArgumentException()
{
    // Arrange
    var emptyList = new List<string>();
    var service = new StockApplicationService(_mockRepo.Object, _mockLogger.Object);

    // Act
    Func<Task> act = async () => await service.DeleteHoldingsBatchAsync(emptyList);

    // Assert
    await act.Should().ThrowAsync<ArgumentException>()
        .WithMessage("*股票代碼清單不能為空*");
}
```

### Phase4：✅更新測試文件進度

- 將TDD文件測試案例完成進度更新
- 選擇測試清單中的下一個測試，回到Phase1，重複 Red-Green-Refactor 循環。

---

## 完整測試循環

### 1. 單元測試階段

依次完成測試清單中的所有單元測試：
- 🔴 寫測試 → 🟢 寫代碼 → ♻️ 重構 → ✅ 更新TDD進度文件
- 重複直到所有單元測試完成

### 2. 集成測試階段

完成所有集成測試：
- 測試多組件協作
- 使用 LocalDB Database
- 驗證數據持久化

### 3. API 測試階段

完成所有 API 端點測試：
- 測試 HTTP 請求/響應
- 使用 `WebApplicationFactory`
- 驗證狀態碼和響應格式

### 4. E2E 測試階段

完成所有 需求行為 驗證：
- 測試瀏覽器
- 測試CLI指令(ex. python src/main_tw.py --tickers 2330 --initial-cash 1000000 --analysts charlie_munger_tw)
- 驗證畫面呈現結果是否合理

### 循環終止條件

✅ 完成所有測試清單中的案例
✅ 所有測試通過
✅ 代碼覆蓋率達標（≥80%）
✅ 無重複代碼
✅ 命名清晰
✅ 所有註釋使用繁體中文

## 最終驗證

### 1. 執行所有測試

// turbo
```powershell
dotnet test --verbosity normal
```

### 2. 確認測試覆蓋率

目標覆蓋率：
- 單元測試：80%
- 集成測試：15%
- API 測試：5%

### 3. 代碼審查檢查清單

- [ ] 所有測試通過
- [ ] 代碼符合 Clean Architecture 原則
- [ ] 遵循 DDD 模式
- [ ] 所有公開成員有繁體中文 XML 註釋
- [ ] 使用 async/await 和 CancellationToken
- [ ] API 端點返回 `ApiResponse<T>`
- [ ] 沒有硬編碼配置
- [ ] 使用依賴注入

## 產出物

- 測試代碼（`tests/` 目錄）
- 實現代碼（`backend/` 目錄）

## 測試執行命令

### 後端測試

```powershell
# 執行單元測試
cd tests/Invegst.Unit.Tests
dotnet test

# 執行集成測試
cd tests/Invegst.Integration.Tests
dotnet test

# 執行所有測試
cd tests
dotnet test

# 測試覆蓋率
dotnet test --collect:"XPlat Code Coverage"

# 監視模式（自動重新執行）
dotnet watch test
```

### 前端測試

```powershell
# 執行測試
cd frontend
npm run test

# 監視模式
npm run test:watch

# 覆蓋率
npm run test:coverage

# 單一檔案
npm run test -- StockDashboard.spec.ts
```
