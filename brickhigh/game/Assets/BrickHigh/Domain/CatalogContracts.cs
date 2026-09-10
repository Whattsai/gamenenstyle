using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using System.Runtime.CompilerServices;

[assembly: InternalsVisibleTo("BrickHigh.Infrastructure")]
[assembly: InternalsVisibleTo("BrickHigh.Application")]

namespace BrickHigh.Domain
{
    /// <summary>編譯／建置時選定的包身分。</summary>
    public enum PackageKind { Preview, Release }

    /// <summary>由目錄開啟操作建立，不接受外部自行拼造的 session。</summary>
    public sealed class CatalogSession : IDisposable
    {
        internal readonly object Owner;
        internal readonly object Sync = new object();
        internal readonly string CursorBinding = Guid.NewGuid().ToString("N");
        private IDisposable guard;
        /// <summary>固定發行包身分。</summary>
        public string PackId { get; }
        /// <summary>固定來源快照。</summary>
        public Guid SnapshotId { get; }
        /// <summary>固定資料格式版本。</summary>
        public int SchemaVersion { get; }
        /// <summary>此 session 的包種類。</summary>
        public PackageKind PackageKind { get; }
        /// <summary>是否已釋放。</summary>
        public bool IsDisposed { get; private set; }
        internal CatalogSession(object owner, string pack, Guid snapshot, int schema, PackageKind kind, IDisposable guard)
        { Owner = owner; PackId = pack; SnapshotId = snapshot; SchemaVersion = schema; PackageKind = kind; this.guard = guard; }
        /// <summary>等待正在進行的讀取完成後釋放；重複呼叫安全。</summary>
        public void Dispose() { lock (Sync) { IsDisposed = true; guard?.Dispose(); guard = null; } }
    }

    /// <summary>來源快照、變體與來源模型版本的完整引用。</summary>
    public sealed class ModelReference
    {
        /// <summary>來源快照。</summary>
        public Guid SnapshotId { get; }
        /// <summary>實際外觀變體。</summary>
        public Guid VariantId { get; }
        /// <summary>來源模型版本。</summary>
        public Guid RevisionId { get; }
        /// <summary>保留完整引用；有效性由公開介面於 IO 前核對。</summary>
        public ModelReference(Guid snapshot, Guid variant, Guid revision) { SnapshotId = snapshot; VariantId = variant; RevisionId = revision; }
        /// <summary>三個 UUID 均不可為空。</summary>
        public bool IsValid => SnapshotId != Guid.Empty && VariantId != Guid.Empty && RevisionId != Guid.Empty;
    }

    /// <summary>固定快照中可讀的變體資訊。</summary>
    public sealed class VariantDetails
    {
        /// <summary>變體身分。</summary>
        public Guid VariantId { get; }
        /// <summary>凍結名稱。</summary>
        public string Name { get; }
        /// <summary>凍結系列。</summary>
        public string Family { get; }
        /// <summary>生產狀態。</summary>
        public string ProductionStatus { get; }
        /// <summary>款式分類。</summary>
        public BrickTier Tier { get; }
        /// <summary>來源模型引用。</summary>
        public ModelReference Model { get; }
        /// <summary>原始用途及人物錨點資料。</summary>
        public string UsageJson { get; }
        /// <summary>公尺尺寸、接點、碰撞與輪組資料。</summary>
        public string MetadataJson { get; }
        /// <summary>目前平台的執行期建置身分。</summary>
        public string RuntimeBuildId { get; }
        internal VariantDetails(Guid variant, string name, string family, string status, BrickTier tier, ModelReference model,
            string usage, string metadata, string build)
        { VariantId = variant; Name = name; Family = family; ProductionStatus = status; Tier = tier; Model = model; UsageJson = usage; MetadataJson = metadata; RuntimeBuildId = build; }
    }

    /// <summary>有界查詢頁與下一頁位置。</summary>
    public sealed class VariantPage
    {
        /// <summary>最多指定 Limit 筆資料。</summary>
        public IReadOnlyList<VariantDetails> Items { get; }
        /// <summary>最後一頁或空結果時為 null。</summary>
        public string NextCursor { get; }
        internal VariantPage(IReadOnlyList<VariantDetails> items, string cursor) { Items = items; NextCursor = cursor; }
    }

    /// <summary>固定快照中的版本化相容規則。</summary>
    public sealed class CompatibilityProfiles
    {
        /// <summary>profile ID 對應不可變 JSON 定義。</summary>
        public IReadOnlyDictionary<string, string> Definitions { get; }
        internal CompatibilityProfiles(IReadOnlyDictionary<string, string> definitions) { Definitions = definitions; }
    }

    /// <summary>來源全量覆蓋數字；待查與缺口不因 Preview 交付歸零。</summary>
    public sealed class CatalogCoverage
    {
        /// <summary>候選、未停產、停產、待查、缺口、交付數量。</summary>
        public int C { get; internal set; }
        /// <summary>確認未停產數。</summary>
        public int A { get; internal set; }
        /// <summary>確認停產數。</summary>
        public int R { get; internal set; }
        /// <summary>生產狀態待查數。</summary>
        public int U { get; internal set; }
        /// <summary>來源涵蓋缺口數。</summary>
        public int G { get; internal set; }
        /// <summary>可交付的確認未停產變體數。</summary>
        public int V { get; internal set; }
        /// <summary>是否具有完整來源涵蓋審查。</summary>
        public bool ScopeReviewed { get; internal set; }
        /// <summary>空分母為 null，不顯示 100%。</summary>
        public double? Ratio => A == 0 ? (double?)null : (double)V / A;
    }

    /// <summary>同一 Player 內的唯讀模型目錄介面。</summary>
    public interface IBrickCatalog
    {
        /// <summary>驗證本機目錄並建立固定 session。</summary>
        Task<CatalogResult<CatalogSession>> OpenAsync(CancellationToken cancellationToken);
        /// <summary>在固定 session 查詢一頁變體。</summary>
        Task<CatalogResult<VariantPage>> QueryAsync(CatalogSession session, VariantQuery query, CancellationToken cancellationToken);
        /// <summary>讀取目前快照所選變體版本。</summary>
        Task<CatalogResult<VariantDetails>> GetVariantAsync(CatalogSession session, Guid variantId, CancellationToken cancellationToken);
        /// <summary>取得此快照的接點規則。</summary>
        Task<CatalogResult<CompatibilityProfiles>> GetProfilesAsync(CatalogSession session, CancellationToken cancellationToken);
        /// <summary>取得此快照的真實來源覆蓋資料。</summary>
        Task<CatalogResult<CatalogCoverage>> GetCoverageAsync(CatalogSession session, CancellationToken cancellationToken);
    }
}
