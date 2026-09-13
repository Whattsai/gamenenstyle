using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BrickHigh.Application;
using BrickHigh.Domain;
using BrickHigh.Infrastructure;
using UnityEngine;

namespace BrickHigh.UnityRuntime
{
    /// <summary>預覽畫面的本機協調器，擁有固定 session、provider、模型 instance 與 presenter。</summary>
    public sealed class CatalogPreviewController : IDisposable
    {
        private readonly IBrickCatalog catalog;
        private readonly CatalogSession session;
        private readonly BrickAssetProvider provider;
        private bool disposed;
        /// <summary>僅供主執行緒讀取及畫面綁定；操作請使用此 controller 的方法。</summary>
        public CatalogPreviewPresenter<ModelLease> State { get; }
        /// <summary>目前實際模型 instance，非共用的 Prefab。</summary>
        public GameObject Instance { get; private set; }
        /// <summary>主執行緒狀態通知；離開後不再呼叫 UI。</summary>
        public event Action Changed;
        internal int RemainingLeases => provider.ActiveLeaseCount;
        internal int RemainingBundles => provider.LoadedBundleCount;

        private CatalogPreviewController(IBrickCatalog catalog, CatalogSession session, BrickAssetProvider provider)
        {
            UnityThread.RequireMain();
            this.catalog = catalog; this.session = session; this.provider = provider;
            State = new CatalogPreviewPresenter<ModelLease>(session.SnapshotId, session.PackageKind);
            State.ReleasingModel += RemoveInstance;
        }
        /// <summary>驗證本機包後才建立預覽；不登入、不搜尋全域 address、不寫玩家資料。</summary>
        public static async Task<CatalogResult<CatalogPreviewController>> OpenAsync(BrickCatalog catalog, CancellationToken cancellationToken = default)
        {
            if (cancellationToken.IsCancellationRequested) return CatalogResult<CatalogPreviewController>.Failure(CatalogErrorCode.Cancelled);
            if (catalog == null) return CatalogResult<CatalogPreviewController>.Failure(CatalogErrorCode.InvalidQuery);
            var opened = await catalog.OpenAsync(cancellationToken).ConfigureAwait(false);
            if (!opened.IsSuccess) return CatalogResult<CatalogPreviewController>.Failure(opened.Error.Code);
            bool transferred = false;
            try
            {
                return await UnityThread.InvokeAsync(() =>
                {
                    if (cancellationToken.IsCancellationRequested) return Task.FromResult(CatalogResult<CatalogPreviewController>.Failure(CatalogErrorCode.Cancelled));
                    var controller = new CatalogPreviewController(catalog, opened.Value, new BrickAssetProvider(catalog, opened.Value));
                    transferred = true;
                    return Task.FromResult(CatalogResult<CatalogPreviewController>.Success(controller));
                });
            }
            finally { if (!transferred) opened.Value.Dispose(); }
        }
        /// <summary>新的搜尋取代舊請求，輸入在進入背景工作前建立副本。</summary>
        public Task<bool> SearchAsync(VariantQuery query, CancellationToken cancellationToken = default)
        {
            var copy = query?.Copy();
            return QueryAsync(() => State.BeginSearch(copy), cancellationToken);
        }
        /// <summary>清除所有篩選後重查同一固定 session。</summary>
        public Task<bool> ClearFiltersAsync(CancellationToken cancellationToken = default) => QueryAsync(State.ClearFilters, cancellationToken);
        /// <summary>下一頁仍沿用同一 session 與條件；等待中不重複啟動。</summary>
        public Task<bool> NextPageAsync(CancellationToken cancellationToken = default) => QueryAsync(State.BeginNextPage, cancellationToken);
        private Task<bool> QueryAsync(Func<CatalogPreviewPresenter<ModelLease>.SearchRequest> begin, CancellationToken cancellationToken)
            => UnityThread.InvokeAsync(async () =>
            {
                if (disposed || cancellationToken.IsCancellationRequested) return false;
                var request = begin();
                if (request == null) return false;
                RemoveInstance(); Changed?.Invoke();
                using (var linked = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken, request.CancellationToken))
                {
                    var result = await catalog.QueryAsync(session, request.Query, linked.Token);
                    if (!State.CompleteSearch(request, result)) return false;
                    Changed?.Invoke(); return true;
                }
            });
        /// <summary>僅載入當頁所選完整變體；所有建立／釋放都在 Unity 主執行緒。</summary>
        public Task<bool> SelectAsync(Guid variantId, CancellationToken cancellationToken = default)
            => LoadAsync(() => State.Rows.Any(x => x.VariantId == variantId) ? State.BeginSelect(variantId) : null, cancellationToken);
        /// <summary>暫時模型錯誤允許重試，重複點擊不再配置 handle。</summary>
        public Task<bool> RetryAsync(CancellationToken cancellationToken = default) => LoadAsync(State.BeginRetry, cancellationToken);
        private Task<bool> LoadAsync(Func<CatalogPreviewPresenter<ModelLease>.ModelRequest> begin, CancellationToken cancellationToken)
            => UnityThread.InvokeAsync(async () =>
            {
                if (disposed || cancellationToken.IsCancellationRequested) return false;
                var request = begin();
                if (request == null) return false;
                RemoveInstance(); Changed?.Invoke();
                using (var linked = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken, request.CancellationToken))
                {
                    var result = await provider.AcquireAsync(request.Model, linked.Token);
                    if (!State.CompleteModel(request, result)) return false;
                    if (State.Model != null) Instance = UnityEngine.Object.Instantiate(State.Model.Prefab);
                    Changed?.Invoke(); return true;
                }
            });
        private void RemoveInstance()
        {
            if (Instance == null) return;
            Instance.SetActive(false);
            UnityEngine.Object.Destroy(Instance);
            Instance = null;
        }
        /// <summary>先停用 instance，再釋放租約、provider 與 session；背景呼叫派回主執行緒。</summary>
        public void Dispose() => UnityThread.Post(() =>
        {
            if (disposed) return;
            disposed = true; Changed = null;
            RemoveInstance(); State.Dispose(); provider.Dispose(); session.Dispose();
        });
    }
}
