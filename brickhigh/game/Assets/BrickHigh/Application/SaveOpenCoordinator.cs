using System;
using System.Collections.Generic;
using BrickHigh.Domain;

namespace BrickHigh.Application
{
    /// <summary>相容檢查及可寫連線開啟的結果。</summary>
    public enum SaveOpenStatus
    {
        /// <summary>存檔可直接寫入且連線已開啟。</summary>
        Opened = 0,
        /// <summary>存檔需先完成 migration；尚未開啟可寫連線。</summary>
        MigrationRequired = 1
    }

    /// <summary>存檔可寫開啟流程的結果與相容性報告。</summary>
    public sealed class SaveOpenOutcome<TConnection>
    {
        /// <summary>流程狀態、相容性報告及已開啟的連線。</summary>
        internal SaveOpenOutcome(SaveOpenStatus status, CompatibilityReport compatibility, TConnection connection)
        {
            Status = status;
            Compatibility = compatibility;
            Connection = connection;
        }

        /// <summary>是否已開啟連線或需先遷移。</summary>
        public SaveOpenStatus Status { get; }

        /// <summary>完整的存檔相容性檢查結果。</summary>
        public CompatibilityReport Compatibility { get; }

        /// <summary>狀態為 Opened 時的可寫連線；其他狀態為預設值。</summary>
        public TConnection Connection { get; }
    }

    /// <summary>先完成存檔相容檢查，再按資格開啟可寫連線。</summary>
    public sealed class SaveOpenCoordinator<TConnection>
    {
        private readonly ISaveCompatibilityChecker compatibilityChecker;
        private readonly Func<CatalogResult<TConnection>> writableConnectionFactory;

        /// <summary>注入純相容性檢查器及延後呼叫的可寫連線工廠。</summary>
        public SaveOpenCoordinator(ISaveCompatibilityChecker checker,
            Func<CatalogResult<TConnection>> openWritableConnection)
        {
            compatibilityChecker = checker ?? throw new ArgumentNullException(nameof(checker));
            writableConnectionFactory = openWritableConnection
                ?? throw new ArgumentNullException(nameof(openWritableConnection));
        }

        /// <summary>不相容或需遷移時不呼叫可寫連線工廠；只有 Compatible 可直接開啟。</summary>
        public CatalogResult<SaveOpenOutcome<TConnection>> OpenWritable(SaveHeader save,
            IReadOnlyList<ModelReference> requiredModels)
        {
            var checkedSave = compatibilityChecker.Check(save, requiredModels);
            if (checkedSave == null)
                return CatalogResult<SaveOpenOutcome<TConnection>>.Failure(CatalogErrorCode.InvalidQuery);
            if (!checkedSave.IsSuccess)
                return CatalogResult<SaveOpenOutcome<TConnection>>.Failure(checkedSave.Error.Code);

            var report = checkedSave.Value;
            if (report == null)
                return CatalogResult<SaveOpenOutcome<TConnection>>.Failure(CatalogErrorCode.InvalidQuery);

            switch (report.Status)
            {
                case CompatibilityStatus.MigrationRequired:
                    return CatalogResult<SaveOpenOutcome<TConnection>>.Success(
                        new SaveOpenOutcome<TConnection>(SaveOpenStatus.MigrationRequired, report, default(TConnection)));
                case CompatibilityStatus.Compatible:
                    if (!report.CanOpenWritable)
                        return CatalogResult<SaveOpenOutcome<TConnection>>.Failure(CatalogErrorCode.InvalidQuery);
                    break;
                default:
                    return CatalogResult<SaveOpenOutcome<TConnection>>.Failure(CatalogErrorCode.InvalidQuery);
            }

            CatalogResult<TConnection> opened;
            try
            {
                opened = writableConnectionFactory();
            }
            catch (Exception)
            {
                return CatalogResult<SaveOpenOutcome<TConnection>>.Failure(CatalogErrorCode.StorageUnavailable);
            }

            if (opened == null)
                return CatalogResult<SaveOpenOutcome<TConnection>>.Failure(CatalogErrorCode.StorageUnavailable);
            if (!opened.IsSuccess)
                return CatalogResult<SaveOpenOutcome<TConnection>>.Failure(opened.Error.Code);
            if (ReferenceEquals(opened.Value, null))
                return CatalogResult<SaveOpenOutcome<TConnection>>.Failure(CatalogErrorCode.StorageUnavailable);

            return CatalogResult<SaveOpenOutcome<TConnection>>.Success(
                new SaveOpenOutcome<TConnection>(SaveOpenStatus.Opened, report, opened.Value));
        }
    }
}
