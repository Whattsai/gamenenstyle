using System;
using System.Threading;
using BrickHigh.Domain;

namespace BrickHigh.Application
{
    /// <summary>同一 UI 執行緒上的最新選取狀態；晚到結果只釋放，不改模型、詳情或 loading。</summary>
    public sealed class SelectionRequestPolicy<T> : IDisposable where T : class, IDisposable
    {
        /// <summary>不可由呼叫端自行建立或跨 policy 混用的請求。</summary>
        public sealed class Request
        {
            internal readonly SelectionRequestPolicy<T> Owner;
            internal readonly CancellationTokenSource Source = new CancellationTokenSource();
            internal bool Completed;
            internal T Seen;
            /// <summary>新選取或離開畫面時取消；載入器即使忽略取消也不能覆蓋新結果。</summary>
            public CancellationToken CancellationToken { get; }
            internal Request(SelectionRequestPolicy<T> owner) { Owner = owner; CancellationToken = Source.Token; }
        }
        private readonly int ownerThread = Thread.CurrentThread.ManagedThreadId;
        private Request pending;
        private bool disposed;
        /// <summary>目前選取的穩定識別；只由 Begin 改動。</summary>
        public string SelectedKey { get; private set; }
        /// <summary>只有目前請求可結束載入狀態。</summary>
        public bool IsLoading { get; private set; }
        /// <summary>已接受結果；載入期間為 null，失敗保留具體錯誤。</summary>
        public CatalogResult<T> Current { get; private set; }

        /// <summary>開始新選取，取消舊請求並釋放不再呈現的資源。</summary>
        public Request Begin(string key)
        {
            RequireThread();
            if (disposed) throw new ObjectDisposedException(nameof(SelectionRequestPolicy<T>));
            if (string.IsNullOrWhiteSpace(key)) throw new ArgumentException("選取識別不可為空。", nameof(key));
            CancelPending();
            Current?.Value?.Dispose();
            Current = null;
            SelectedKey = key;
            IsLoading = true;
            return pending = new Request(this);
        }

        /// <summary>消耗成功結果的所有權；只有回傳 true 時，呼叫端才能更新當前畫面。</summary>
        public bool Complete(Request request, CatalogResult<T> result)
        {
            RequireThread();
            if (request == null || !ReferenceEquals(request.Owner, this) || result == null)
                throw new ArgumentException("請求不屬於此畫面。");
            if (request.Completed)
            {
                if (!ReferenceEquals(request.Seen, result.Value)) result.Value?.Dispose();
                return false;
            }
            request.Completed = true;
            request.Seen = result.Value;
            request.Source.Dispose();
            if (disposed || !ReferenceEquals(request, pending)) { result.Value?.Dispose(); return false; }
            IsLoading = false;
            Current = result;
            pending = null;
            return true;
        }

        /// <summary>離開畫面後仍可消耗晚到結果，但不允許重新使用這個已釋放狀態機。</summary>
        public void Dispose()
        {
            RequireThread();
            if (disposed) return;
            disposed = true;
            CancelPending();
            pending = null;
            Current?.Value?.Dispose();
            Current = null;
            IsLoading = false;
        }
        private void CancelPending()
        {
            if (pending == null || pending.Completed) return;
            try { pending.Source.Cancel(); }
            catch (AggregateException) { /* 外部取消回呼失敗，不改變最新選取與所有權規則。 */ }
        }
        private void RequireThread()
        {
            if (Thread.CurrentThread.ManagedThreadId != ownerThread) throw new InvalidOperationException("選取狀態須回到所屬 UI 執行緒更新。");
        }
    }
}
