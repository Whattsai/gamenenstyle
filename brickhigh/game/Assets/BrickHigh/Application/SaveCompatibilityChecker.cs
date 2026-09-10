using System;
using System.Collections.Generic;
using System.Linq;
using BrickHigh.Domain;

namespace BrickHigh.Application
{
    /// <summary>在可寫連線之前檢查 header 與完整模型引用；不觸碰玩家資料。</summary>
    public sealed class SaveCompatibilityChecker : ISaveCompatibilityChecker
    {
        private readonly int schema;
        private readonly HashSet<int> migrations;
        private readonly int contract;
        private readonly string scale;
        private readonly Func<ModelReference, CatalogResult<bool>> exactLookup;

        /// <summary>migrationSchemas 僅列實際已註冊且支援遷移的來源版本。</summary>
        public SaveCompatibilityChecker(int currentSchema, IEnumerable<int> migrationSchemas, int assetContract,
            string worldScale, Func<ModelReference, CatalogResult<bool>> exactLookup)
        {
            if (currentSchema < 1 || assetContract < 1 || string.IsNullOrWhiteSpace(worldScale)) throw new ArgumentException("相容設定無效。");
            schema = currentSchema; contract = assetContract; scale = worldScale;
            migrations = new HashSet<int>(migrationSchemas ?? throw new ArgumentNullException(nameof(migrationSchemas)));
            if (migrations.Any(value => value < 1 || value >= schema)) throw new ArgumentException("遷移來源版本無效。");
            this.exactLookup = exactLookup ?? throw new ArgumentNullException(nameof(exactLookup));
        }

        /// <summary>先驗全部輸入，再讀取精確映射；缺內容不回退最新版本。</summary>
        public CatalogResult<CompatibilityReport> Check(SaveHeader save, IReadOnlyList<ModelReference> requiredModels)
        {
            if (save == null || requiredModels == null || requiredModels.Any(m => m == null || !m.IsValid)
                || save.ProfileId == Guid.Empty || save.SaveSchemaVersion < 1 || save.AssetContractVersion < 1
                || string.IsNullOrWhiteSpace(save.AppVersion) || string.IsNullOrWhiteSpace(save.WorldScaleProfileId)
                || save.ModelReferencesDigest == null || save.ModelReferencesDigest.Length != 64
                || save.ModelReferencesDigest.Any(c => !"0123456789abcdef".Contains(c)))
                return CatalogResult<CompatibilityReport>.Failure(CatalogErrorCode.InvalidQuery);
            if (save.SaveSchemaVersion != schema && !migrations.Contains(save.SaveSchemaVersion))
                return CatalogResult<CompatibilityReport>.Failure(CatalogErrorCode.UnsupportedSchema,
                    save.SaveSchemaVersion > schema ? "此存檔版本較新，已保留目前進度。請使用相容版本開啟。" : null);
            if (save.AssetContractVersion != contract || save.WorldScaleProfileId != scale
                || save.ModelReferencesDigest != ModelReferenceDigest.Compute(requiredModels))
                return CatalogResult<CompatibilityReport>.Failure(CatalogErrorCode.IncompatibleContent);
            foreach (var model in requiredModels.GroupBy(ModelReferenceDigest.Key).Select(group => group.First()))
            {
                var result = exactLookup(model);
                if (!result.IsSuccess) return CatalogResult<CompatibilityReport>.Failure(result.Error.Code);
                if (!result.Value) return CatalogResult<CompatibilityReport>.Failure(CatalogErrorCode.IncompatibleContent);
            }
            return CatalogResult<CompatibilityReport>.Success(new CompatibilityReport(
                save.SaveSchemaVersion == schema ? CompatibilityStatus.Compatible : CompatibilityStatus.MigrationRequired));
        }
    }
}
