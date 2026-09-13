using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using BrickHigh.Domain;

namespace BrickHigh.Application
{
    /// <summary>純畫面狀態與資源所有權；由 Unity adapter 呼叫唯讀目錄及 provider，再於同一 UI 執行緒提交結果。</summary>
    public sealed class CatalogPreviewPresenter<T> : IDisposable where T : class, IDisposable
    {
        /// <summary>固定條件的單次查詢，不能被外部修改或跨畫面使用。</summary>
        public sealed class SearchRequest
        {
            internal readonly CatalogPreviewPresenter<T> Owner;
            internal readonly CancellationTokenSource Source = new CancellationTokenSource();
            internal readonly VariantQuery Input;
            internal bool Completed;
            /// <summary>查詢條件副本；用途固定 Browse。</summary>
            public VariantQuery Query => Input.Copy();
            /// <summary>換條件或離開畫面時取消。</summary>
            public CancellationToken CancellationToken { get; }
            internal SearchRequest(CatalogPreviewPresenter<T> owner, VariantQuery input)
            { Owner = owner; Input = input; CancellationToken = Source.Token; }
        }
        /// <summary>從當頁選取的完整模型引用；持有產生此請求的狀態機。</summary>
        public sealed class ModelRequest
        {
            internal readonly CatalogPreviewPresenter<T> Owner;
            internal readonly SelectionRequestPolicy<T> Policy;
            internal readonly SelectionRequestPolicy<T>.Request Request;
            internal readonly RetryRequestPolicy.Request Retry;
            /// <summary>必須交給受控 provider 的完整引用，不是自由路徑。</summary>
            public ModelReference Model { get; }
            /// <summary>新選取或離開時取消；完成結果仍須交回以釋放。</summary>
            public CancellationToken CancellationToken => Request.CancellationToken;
            internal ModelRequest(CatalogPreviewPresenter<T> owner, SelectionRequestPolicy<T> policy,
                SelectionRequestPolicy<T>.Request request, ModelReference model, RetryRequestPolicy.Request retry)
            { Owner = owner; Policy = policy; Request = request; Model = model; Retry = retry; }
        }
        private readonly int ownerThread = Thread.CurrentThread.ManagedThreadId;
        private readonly Guid snapshot;
        private readonly PackageKind kind;
        private readonly RetryRequestPolicy retry = new RetryRequestPolicy();
        private SelectionRequestPolicy<T> selection = new SelectionRequestPolicy<T>();
        private SearchRequest search;
        private VariantQuery filters = new VariantQuery();
        private string nextCursor;
        private CatalogError error;
        private bool disposed;
        /// <summary>固定 session 的快照與編譯包種類，不開啟網路或玩家資料。</summary>
        public CatalogPreviewPresenter(Guid snapshotId, PackageKind packageKind)
        {
            if (snapshotId == Guid.Empty || !Enum.IsDefined(typeof(PackageKind), packageKind)) throw new ArgumentException("預覽身分無效。");
            snapshot = snapshotId; kind = packageKind;
        }
        /// <summary>畫面標題。</summary>
        public string Title => "模型預覽";
        /// <summary>技術預覽不宣稱完整模型庫。</summary>
        public string Banner => kind == PackageKind.Preview ? "技術預覽・非完整模型庫" : "";
        /// <summary>目前有界分頁，非玩家庫存。</summary>
        public IReadOnlyList<VariantDetails> Rows { get; private set; } = Array.Empty<VariantDetails>();
        /// <summary>同一快照所選版本與 metadata。</summary>
        public VariantDetails SelectedDetails { get; private set; }
        /// <summary>已接受的實際模型資源；載入或失敗期間沒有占位成功值。</summary>
        public T Model => selection.Current?.Value;
        /// <summary>在租約失效前同步停用並移除畫面 instance；訂閱者不得拋出例外。</summary>
        public event Action ReleasingModel;
        /// <summary>只有當前查詢或模型請求影響此狀態。</summary>
        public bool IsLoading => !disposed && (search != null || selection.IsLoading);
        /// <summary>新搜尋可取代尚未完成的舊搜尋。</summary>
        public bool CanSearch => !disposed;
        /// <summary>即使無結果仍提供清除。</summary>
        public bool CanClear => !disposed;
        /// <summary>清除操作文案。</summary>
        public string ClearText => "清除條件";
        /// <summary>暫時模型失敗才提供重試。</summary>
        public bool CanRetry => !disposed && SelectedDetails != null && retry.CanRetry;
        /// <summary>重試按鈕狀態文案。</summary>
        public string RetryText => retry.ButtonText;
        /// <summary>只有完成的當頁有下一頁時可操作。</summary>
        public bool CanNextPage => !disposed && search == null && nextCursor != null;
        /// <summary>不暴露例外內容的穩定錯誤碼。</summary>
        public CatalogErrorCode? ErrorCode => error?.Code;
        /// <summary>玩家可提供給診斷工具的識別。</summary>
        public string DiagnosticId => error?.Code == CatalogErrorCode.Cancelled ? null : error?.DiagnosticId;
        /// <summary>未知生產狀態不假稱未停產。</summary>
        public string ProductionStatusText => SelectedDetails == null ? "" : SelectedDetails.ProductionStatus == "Unknown"
            ? "生產狀態待查" : SelectedDetails.ProductionStatus == "Active" ? "已確認未停產" : "已停產";
        /// <summary>僅使用固定玩家文案，不轉送來源的任意錯誤字串。</summary>
        public string Message => disposed ? "" : IsLoading ? "正在載入本機模型…"
            : error != null ? (error.Code == CatalogErrorCode.StorageUnavailable ? "載入失敗，請重試。" : CatalogError.Describe(error.Code))
            : Rows.Count == 0 ? "找不到符合條件的模型。" : "";

        /// <summary>建立新條件查詢；清除外部 cursor 並強制唯讀 Browse 用途。</summary>
        public SearchRequest BeginSearch(VariantQuery query)
        {
            RequireActive();
            if (query == null) throw new ArgumentNullException(nameof(query));
            var input = query.Copy(); input.Purpose = CatalogPurpose.Browse; input.Cursor = null;
            filters = input.Copy();
            return BeginQuery(input);
        }
        /// <summary>清除所有條件但不變更固定快照。</summary>
        public SearchRequest ClearFilters() => BeginSearch(new VariantQuery());
        /// <summary>載入下一個有界分頁，重複點擊不重複配置請求。</summary>
        public SearchRequest BeginNextPage()
        {
            RequireActive();
            if (!CanNextPage) return null;
            var input = filters.Copy(); input.Cursor = nextCursor;
            return BeginQuery(input);
        }
        private SearchRequest BeginQuery(VariantQuery input)
        {
            CancelSearch();
            ReleasingModel?.Invoke();
            selection.Dispose(); selection = new SelectionRequestPolicy<T>();
            retry.Reset(); SelectedDetails = null; Rows = Array.Empty<VariantDetails>(); nextCursor = null; error = null;
            return search = new SearchRequest(this, input);
        }
        /// <summary>只有最新查詢可更新清單；所有項目都必須屬於固定快照。</summary>
        public bool CompleteSearch(SearchRequest request, CatalogResult<VariantPage> result)
        {
            RequireThread();
            if (request == null || request.Owner != this || result == null) throw new ArgumentException("查詢不屬於此畫面。");
            if (request.Completed) return false;
            request.Completed = true; request.Source.Dispose();
            if (disposed || request != search) return false;
            search = null;
            if (!result.IsSuccess) { error = result.Error; return true; }
            var page = result.Value;
            if (page?.Items == null || page.Items.Count > request.Input.Limit || page.Items.Any(x => x == null
                || x.Model == null || !x.Model.IsValid || x.Model.SnapshotId != snapshot || x.VariantId != x.Model.VariantId
                || (kind == PackageKind.Preview && x.ProductionStatus == "Retired"))
                || page.Items.Select(x => x.VariantId).Distinct().Count() != page.Items.Count)
            { error = CatalogResult<T>.Failure(CatalogErrorCode.IncompatibleContent).Error; return true; }
            Rows = Array.AsReadOnly(page.Items.ToArray()); nextCursor = page.NextCursor; error = null;
            return true;
        }
        /// <summary>僅能選目前可見頁的完整變體，先釋放不再呈現的舊資源。</summary>
        public ModelRequest BeginSelect(Guid variantId)
        {
            RequireActive();
            var details = Rows.FirstOrDefault(x => x.VariantId == variantId);
            if (details == null) throw new ArgumentException("模型不在目前清單。", nameof(variantId));
            retry.Reset(); SelectedDetails = details;
            return BeginModel(null);
        }
        /// <summary>只啟動一次有效模型重試，不影響換件功能。</summary>
        public ModelRequest BeginRetry()
        {
            RequireActive();
            if (!CanRetry) return null;
            return BeginModel(retry.TryBegin());
        }
        private ModelRequest BeginModel(RetryRequestPolicy.Request retryRequest)
        {
            error = null;
            ReleasingModel?.Invoke();
            return new ModelRequest(this, selection, selection.Begin(SelectedDetails.VariantId.ToString("N")), SelectedDetails.Model, retryRequest);
        }
        /// <summary>消耗模型結果的所有權；晚到或離開後的成功值會被釋放。</summary>
        public bool CompleteModel(ModelRequest request, CatalogResult<T> result)
        {
            RequireThread();
            if (request == null || request.Owner != this || result == null) throw new ArgumentException("模型請求不屬於此畫面。");
            if (result.IsSuccess && result.Value == null) result = CatalogResult<T>.Failure(CatalogErrorCode.AssetCorrupt);
            if (!request.Policy.Complete(request.Request, result)) return false;
            error = result.Error;
            if (request.Retry != null) retry.Complete(request.Retry, error?.Code);
            else if (error != null) retry.SetFailure(error.Code);
            else retry.Reset();
            return true;
        }
        /// <summary>釋放已持有資源並取消待完成操作；晚到結果仍必須交回。</summary>
        public void Dispose()
        {
            RequireThread();
            if (disposed) return;
            disposed = true; CancelSearch(); ReleasingModel?.Invoke(); selection.Dispose(); retry.Reset(); ReleasingModel = null;
            SelectedDetails = null; Rows = Array.Empty<VariantDetails>(); nextCursor = null; error = null;
        }
        private void CancelSearch()
        {
            if (search == null) return;
            try { search.Source.Cancel(); }
            catch (AggregateException) { /* 外部取消回呼不可阻止畫面切換及資源回收。 */ }
            search.Source.Dispose(); search = null;
        }
        private void RequireActive() { RequireThread(); if (disposed) throw new ObjectDisposedException(nameof(CatalogPreviewPresenter<T>)); }
        private void RequireThread()
        {
            if (Thread.CurrentThread.ManagedThreadId != ownerThread) throw new InvalidOperationException("預覽狀態須於所屬 UI 執行緒更新。");
        }
    }
}
