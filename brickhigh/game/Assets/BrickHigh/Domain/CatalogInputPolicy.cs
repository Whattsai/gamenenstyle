using System;

namespace BrickHigh.Domain
{
    /// <summary>目錄查詢用途，不代表擁有權。</summary>
    public enum CatalogPurpose { Browse, CharacterCreation, InitialBucket }
    /// <summary>遊戲款式分類。</summary>
    public enum BrickTier { Basic, Advanced, Special }
    /// <summary>人物可掛載部位。</summary>
    public enum CharacterSlot { Head, Body, Hands, Legs, Headwear, HandEquipment, Accessory }

    /// <summary>單次查詢資料；送出後由 Application 建立穩定副本。</summary>
    public sealed class VariantQuery
    {
        /// <summary>貨號精確優先或名稱部分匹配。</summary>
        public string QueryText { get; set; }
        /// <summary>系列篩選。</summary>
        public string Family { get; set; }
        /// <summary>款式篩選。</summary>
        public BrickTier? Tier { get; set; }
        /// <summary>人物部位篩選。</summary>
        public CharacterSlot? Slot { get; set; }
        /// <summary>查詢用途。</summary>
        public CatalogPurpose Purpose { get; set; }
        /// <summary>相容建造系統。</summary>
        public string BuildSystem { get; set; }
        /// <summary>與 session／條件綁定的分頁位置。</summary>
        public string Cursor { get; set; }
        /// <summary>預設 50，範圍 1 至 100。</summary>
        public int Limit { get; set; } = 50;
        /// <summary>複製輸入以避免 caller 在背景查詢期間改動。</summary>
        public VariantQuery Copy() => (VariantQuery)MemberwiseClone();
    }

    /// <summary>IO 前的字串、enum 與分頁界線檢查。</summary>
    public static class CatalogInputPolicy
    {
        /// <summary>回傳指定錯誤或 null；cursor 結構與綁定由 Application 檢查。</summary>
        public static CatalogErrorCode? Validate(VariantQuery query)
        {
            if (query == null || query.Limit < 1 || query.Limit > 100 || !ValidText(query.QueryText)
                || !ValidText(query.Family) || !ValidText(query.BuildSystem)
                || !Enum.IsDefined(typeof(CatalogPurpose), query.Purpose)
                || (query.Tier.HasValue && !Enum.IsDefined(typeof(BrickTier), query.Tier.Value))
                || (query.Slot.HasValue && !Enum.IsDefined(typeof(CharacterSlot), query.Slot.Value))) return CatalogErrorCode.InvalidQuery;
            if (query.Purpose == CatalogPurpose.InitialBucket && string.IsNullOrWhiteSpace(query.BuildSystem)) return CatalogErrorCode.InvalidQuery;
            if (query.Cursor != null)
            {
                if (query.Cursor.Length > 4096) return CatalogErrorCode.InvalidCursor;
                foreach (char c in query.Cursor) if (c > 127) return CatalogErrorCode.InvalidCursor;
            }
            return null;
        }
        /// <summary>UTF-16 必須有效，至多 256 個 Unicode scalar。</summary>
        public static bool ValidText(string text)
        {
            if (text == null) return true;
            int scalars = 0;
            for (int i = 0; i < text.Length; i++)
            {
                if (char.IsHighSurrogate(text[i]))
                { if (i + 1 >= text.Length || !char.IsLowSurrogate(text[++i])) return false; }
                else if (char.IsLowSurrogate(text[i])) return false;
                if (++scalars > 256) return false;
            }
            return true;
        }
        /// <summary>LIKE 特殊字元一律作字面搜尋，SQL 仍須參數化。</summary>
        public static string EscapeLike(string text) => (text ?? "").Replace("\\", "\\\\").Replace("%", "\\%").Replace("_", "\\_");
    }
}
