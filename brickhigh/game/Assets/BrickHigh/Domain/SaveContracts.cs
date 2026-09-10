using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;

namespace BrickHigh.Domain
{
    /// <summary>只讀存檔標頭；本 SPEC 不建立人物或庫存資料。</summary>
    public sealed class SaveHeader
    {
        /// <summary>存檔 schema 版本。</summary>
        public int SaveSchemaVersion { get; }
        /// <summary>寫入此標頭的應用版本。</summary>
        public string AppVersion { get; }
        /// <summary>玩家資料身分。</summary>
        public Guid ProfileId { get; }
        /// <summary>資產契約版本。</summary>
        public int AssetContractVersion { get; }
        /// <summary>世界尺度規則。</summary>
        public string WorldScaleProfileId { get; }
        /// <summary>完整模型引用集合的 SHA-256。</summary>
        public string ModelReferencesDigest { get; }
        /// <summary>保存原值；由相容檢查於任何 IO 前核對。</summary>
        public SaveHeader(int schema, string appVersion, Guid profileId, int assetContractVersion, string worldScaleProfileId, string modelReferencesDigest)
        { SaveSchemaVersion = schema; AppVersion = appVersion; ProfileId = profileId; AssetContractVersion = assetContractVersion;
          WorldScaleProfileId = worldScaleProfileId; ModelReferencesDigest = modelReferencesDigest; }
    }

    /// <summary>遷移尚未完成時不得直接開啟可寫資料。</summary>
    public enum CompatibilityStatus { Compatible, MigrationRequired }

    /// <summary>只讀核對結果，不執行 migration、降版或備份還原。</summary>
    public sealed class CompatibilityReport
    {
        /// <summary>已相容或需要明列遷移。</summary>
        public CompatibilityStatus Status { get; }
        /// <summary>目前已通過直接寫入資格；不代表資料庫已開啟。</summary>
        public bool CanOpenWritable => Status == CompatibilityStatus.Compatible;
        internal CompatibilityReport(CompatibilityStatus status) { Status = status; }
    }

    /// <summary>供後續人物／庫存 SPEC 使用的唯讀相容檢查。</summary>
    public interface ISaveCompatibilityChecker
    {
        /// <summary>完整核對標頭與精確引用；不更換模型版本或修改存檔。</summary>
        CatalogResult<CompatibilityReport> Check(SaveHeader save, IReadOnlyList<ModelReference> requiredModels);
    }

    /// <summary>版本化引用摘要格式：去重後依三個小寫 UUID 序列排序，以 LF 分隔。</summary>
    public static class ModelReferenceDigest
    {
        /// <summary>取得精確引用鍵，不將 revision 視為可獨立使用的 ID。</summary>
        public static string Key(ModelReference model) => model.SnapshotId.ToString("D") + "/" + model.VariantId.ToString("D") + "/" + model.RevisionId.ToString("D");
        /// <summary>計算 ref-digest-v1；無效輸入由呼叫端先拒絕。</summary>
        public static string Compute(IReadOnlyList<ModelReference> models)
        {
            if (models == null || models.Any(m => m == null || !m.IsValid)) throw new ArgumentException("模型引用無效。");
            var input = "ref-digest-v1\n" + string.Join("\n", models.Select(Key).Distinct().OrderBy(x => x, StringComparer.Ordinal));
            using (var sha = SHA256.Create())
                return BitConverter.ToString(sha.ComputeHash(Encoding.UTF8.GetBytes(input))).Replace("-", "").ToLowerInvariant();
        }
    }
}
