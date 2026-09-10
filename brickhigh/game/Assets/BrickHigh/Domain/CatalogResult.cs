using System;

namespace BrickHigh.Domain
{
    /// <summary>可由呼叫端明確處理的本機目錄錯誤。</summary>
    public enum CatalogErrorCode
    {
        CatalogNotInstalled, CatalogNotPublished, InvalidQuery, InvalidCursor, VariantNotFound,
        AssetMissing, AssetCorrupt, UnsupportedSchema, IncompatibleContent, StorageUnavailable, Cancelled
    }

    /// <summary>不含例外堆疊或檔案內容的玩家錯誤。</summary>
    public sealed class CatalogError
    {
        /// <summary>穩定錯誤碼。</summary>
        public CatalogErrorCode Code { get; }
        /// <summary>繁體中文修復提示。</summary>
        public string Message { get; }
        /// <summary>是否適合重新嘗試目前操作。</summary>
        public bool Retryable { get; }
        /// <summary>供本機診斷對照的識別。</summary>
        public string DiagnosticId { get; }
        internal CatalogError(CatalogErrorCode code, string message = null)
        {
            Code = code;
            Message = message ?? Describe(code);
            Retryable = code == CatalogErrorCode.StorageUnavailable;
            DiagnosticId = Guid.NewGuid().ToString("N");
        }
        /// <summary>將錯誤碼轉為固定玩家文案。</summary>
        public static string Describe(CatalogErrorCode code)
        {
            switch (code)
            {
                case CatalogErrorCode.CatalogNotInstalled: return "本機模型庫尚未安裝，請使用完整安裝包修復。";
                case CatalogErrorCode.CatalogNotPublished: return "此模型庫尚未發布，無法使用。";
                case CatalogErrorCode.InvalidQuery: return "查詢條件無效，請調整後重試。";
                case CatalogErrorCode.InvalidCursor: return "清單位置已失效，請重新搜尋。";
                case CatalogErrorCode.VariantNotFound: return "找不到指定的模型。";
                case CatalogErrorCode.AssetMissing:
                case CatalogErrorCode.AssetCorrupt: return "此模型檔案不完整，請使用完整安裝包修復。";
                case CatalogErrorCode.UnsupportedSchema: return "此存檔版本較新，已保留目前進度。請使用相容版本開啟。";
                case CatalogErrorCode.IncompatibleContent: return "此存檔與目前版本不相容，原存檔已保留。";
                case CatalogErrorCode.StorageUnavailable: return "無法寫入本機資料，請檢查權限與可用空間。";
                case CatalogErrorCode.Cancelled: return "";
                default: throw new ArgumentOutOfRangeException(nameof(code));
            }
        }
    }

    /// <summary>成功值與失敗錯誤互斥。</summary>
    public sealed class CatalogResult<T>
    {
        /// <summary>是否具有成功值。</summary>
        public bool IsSuccess => Error == null;
        /// <summary>成功值；失敗時為型別預設值。</summary>
        public T Value { get; }
        /// <summary>失敗原因；成功時為 null。</summary>
        public CatalogError Error { get; }
        private CatalogResult(T value, CatalogError error) { Value = value; Error = error; }
        /// <summary>建立成功結果。</summary>
        public static CatalogResult<T> Success(T value) => new CatalogResult<T>(value, null);
        /// <summary>建立固定文案的錯誤結果。</summary>
        public static CatalogResult<T> Failure(CatalogErrorCode code, string message = null) => new CatalogResult<T>(default, new CatalogError(code, message));
    }
}
