using BrickHigh.Domain;

namespace BrickHigh.Application
{
    /// <summary>由畫面所屬執行緒驅動的重試閘門；換件後舊請求不得解鎖新請求。</summary>
    public sealed class RetryRequestPolicy
    {
        /// <summary>單次重試的不可偽造識別。</summary>
        public sealed class Request { internal Request() { } }
        private Request pending;
        private CatalogErrorCode? failure;
        /// <summary>目前是否等待重試結果。</summary>
        public bool IsPending => pending != null;
        /// <summary>僅允許暫時儲存失敗重試；缺檔必須修復安裝包。</summary>
        public bool CanRetry => !IsPending && failure == CatalogErrorCode.StorageUnavailable;
        /// <summary>按鈕的固定繁體中文文案。</summary>
        public string ButtonText => IsPending ? "重試中…" : "重試";
        /// <summary>一般請求失敗後設定可重試性。</summary>
        public void SetFailure(CatalogErrorCode code) { Reset(); failure = code; }
        /// <summary>僅第一個有效點擊取得請求，其餘不啟動工作。</summary>
        public Request TryBegin() => CanRetry ? pending = new Request() : null;
        /// <summary>只接受當前重試的結果；null 代表成功。</summary>
        public bool Complete(Request request, CatalogErrorCode? error)
        {
            if (request == null || !ReferenceEquals(request, pending)) return false;
            pending = null;
            failure = error;
            return true;
        }
        /// <summary>換件或離開畫面時解除舊重試狀態，不阻擋新選取。</summary>
        public void Reset() { pending = null; failure = null; }
    }
}
