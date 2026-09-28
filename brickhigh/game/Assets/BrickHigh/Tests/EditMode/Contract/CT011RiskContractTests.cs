using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using BrickHigh.Application;
using BrickHigh.Domain;
using BrickHigh.Infrastructure;
using NUnit.Framework;

namespace BrickHigh.Tests
{
    public class CT011RiskContractTests
    {
        private static readonly ModelReference[] NoModels = Array.Empty<ModelReference>();
        private string root;
        private string savePath;

        [SetUp]
        public void SetUp()
        {
            root = Path.Combine(Path.GetTempPath(), "BrickHigh-CT011-" + Guid.NewGuid().ToString("N"));
            Directory.CreateDirectory(root);
            savePath = Path.Combine(root, "F-Save.db");
        }

        [TearDown]
        public void TearDown()
        {
            if (Directory.Exists(root)) Directory.Delete(root, true);
        }

        private static SaveHeader Header(int schema, IReadOnlyList<ModelReference> models,
            string worldScale = "real-metres-v1", string digest = null)
        {
            return new SaveHeader(schema, "0.1.0", Guid.NewGuid(), 1, worldScale,
                digest ?? ModelReferenceDigest.Compute(models));
        }

        private static SaveCompatibilityChecker Checker(Func<ModelReference, CatalogResult<bool>> exactLookup = null)
        {
            return new SaveCompatibilityChecker(2, new[] { 1 }, 1, "real-metres-v1",
                exactLookup ?? (_ => CatalogResult<bool>.Success(true)));
        }

        [Test, Property("TDD", "CT-011")]
        public void OpenWritable_CompatibleEmptySave_OpensExactlyOnce()
        {
            var calls = 0;
            var connection = new object();
            var coordinator = new SaveOpenCoordinator<object>(Checker(), () =>
            {
                calls++;
                return CatalogResult<object>.Success(connection);
            });

            var result = coordinator.OpenWritable(Header(2, NoModels), NoModels);

            Assert.That(result.IsSuccess, Is.True);
            Assert.That(result.Value.Status, Is.EqualTo(SaveOpenStatus.Opened));
            Assert.That(result.Value.Compatibility.Status, Is.EqualTo(CompatibilityStatus.Compatible));
            Assert.That(result.Value.Connection, Is.SameAs(connection));
            Assert.That(calls, Is.EqualTo(1));
        }

        [Test, Property("TDD", "CT-011")]
        public void OpenWritable_MigrationRequired_ReturnsReportWithoutOpeningWritableConnection()
        {
            var calls = 0;
            var coordinator = new SaveOpenCoordinator<object>(Checker(), () =>
            {
                calls++;
                return CatalogResult<object>.Success(new object());
            });

            var result = coordinator.OpenWritable(Header(1, NoModels), NoModels);

            Assert.That(result.IsSuccess, Is.True);
            Assert.That(result.Value.Status, Is.EqualTo(SaveOpenStatus.MigrationRequired));
            Assert.That(result.Value.Compatibility.Status, Is.EqualTo(CompatibilityStatus.MigrationRequired));
            Assert.That(result.Value.Connection, Is.Null);
            Assert.That(calls, Is.Zero);
        }

        [Test, Property("TDD", "CT-011")]
        public void OpenWritable_NewerSchema_ReturnsUnsupportedSchemaWithoutOpeningOrReplacingSave()
        {
            var calls = 0;
            var originalHeader = Header(3, NoModels);
            var coordinator = new SaveOpenCoordinator<object>(Checker(), () =>
            {
                calls++;
                return CatalogResult<object>.Success(new object());
            });

            var result = coordinator.OpenWritable(originalHeader, NoModels);

            Assert.That(result.IsSuccess, Is.False);
            Assert.That(result.Error.Code, Is.EqualTo(CatalogErrorCode.UnsupportedSchema));
            Assert.That(result.Error.Message, Is.EqualTo("此存檔版本較新，已保留目前進度。請使用相容版本開啟。"));
            Assert.That(calls, Is.Zero);
            Assert.That(originalHeader.SaveSchemaVersion, Is.EqualTo(3));
        }

        [Test, Property("TDD", "CT-011")]
        public void OpenWritable_BadContent_ReturnsIncompatibleWithoutOpeningWritableConnection()
        {
            var model = new ModelReference(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid());
            var requiredModels = new[] { model };
            var lookups = 0;
            var calls = 0;
            var coordinator = new SaveOpenCoordinator<object>(Checker(_ =>
            {
                lookups++;
                return CatalogResult<bool>.Success(false);
            }), () =>
            {
                calls++;
                return CatalogResult<object>.Success(new object());
            });

            var result = coordinator.OpenWritable(Header(2, requiredModels), requiredModels);

            Assert.That(result.IsSuccess, Is.False);
            Assert.That(result.Error.Code, Is.EqualTo(CatalogErrorCode.IncompatibleContent));
            Assert.That(lookups, Is.EqualTo(1));
            Assert.That(calls, Is.Zero);
        }

        [Test, Property("TDD", "CT-011")]
        public void OpenWritable_EmptyRequiredModelsStillValidatesHeader()
        {
            var calls = 0;
            var coordinator = new SaveOpenCoordinator<object>(Checker(), () =>
            {
                calls++;
                return CatalogResult<object>.Success(new object());
            });
            var invalidHeader = Header(2, NoModels, digest: new string('a', 64));

            var result = coordinator.OpenWritable(invalidHeader, NoModels);

            Assert.That(result.IsSuccess, Is.False);
            Assert.That(result.Error.Code, Is.EqualTo(CatalogErrorCode.IncompatibleContent));
            Assert.That(calls, Is.Zero);
        }

        [Test, Property("TDD", "CT-011")]
        public void OpenWritable_FactoryFailureOrException_ReturnsStorageUnavailable()
        {
            var failedFactory = new SaveOpenCoordinator<object>(Checker(),
                () => CatalogResult<object>.Failure(CatalogErrorCode.StorageUnavailable));
            var failedResult = failedFactory.OpenWritable(Header(2, NoModels), NoModels);
            var throwingFactory = new SaveOpenCoordinator<object>(Checker(),
                () => throw new InvalidOperationException("adapter failure"));
            var thrownResult = throwingFactory.OpenWritable(Header(2, NoModels), NoModels);

            Assert.That(failedResult.IsSuccess, Is.False);
            Assert.That(failedResult.Error.Code, Is.EqualTo(CatalogErrorCode.StorageUnavailable));
            Assert.That(thrownResult.IsSuccess, Is.False);
            Assert.That(thrownResult.Error.Code, Is.EqualTo(CatalogErrorCode.StorageUnavailable));
            Assert.That(thrownResult.Error.Retryable, Is.True);
        }

        [Test, Property("TDD", "CT-011")]
        public void OpenWritable_FSaveNewerSchema_LeavesRealSqliteBytesUnchanged()
        {
            CreateFSave(3);
            var before = File.ReadAllBytes(savePath);
            var header = ReadHeader();
            var calls = 0;
            var coordinator = new SaveOpenCoordinator<NativeSqlite>(Checker(), () =>
            {
                calls++;
                return CatalogResult<NativeSqlite>.Success(new NativeSqlite(savePath, readOnly: false));
            });

            var result = coordinator.OpenWritable(header, NoModels);

            Assert.That(result.IsSuccess, Is.False);
            Assert.That(result.Error.Code, Is.EqualTo(CatalogErrorCode.UnsupportedSchema));
            Assert.That(calls, Is.Zero);
            Assert.That(File.ReadAllBytes(savePath), Is.EqualTo(before));
            Assert.That(File.Exists(savePath + "-wal"), Is.False);
            Assert.That(File.Exists(savePath + "-shm"), Is.False);
        }

        [Test, Property("TDD", "CT-011")]
        public void OpenWritable_FSaveCompatible_OpensAndClosesRealSqliteWriteConnection()
        {
            CreateFSave(2);
            var header = ReadHeader();
            var calls = 0;
            var coordinator = new SaveOpenCoordinator<NativeSqlite>(Checker(), () =>
            {
                calls++;
                return CatalogResult<NativeSqlite>.Success(new NativeSqlite(savePath, readOnly: false));
            });

            var result = coordinator.OpenWritable(header, NoModels);

            Assert.That(result.IsSuccess, Is.True);
            Assert.That(result.Value.Status, Is.EqualTo(SaveOpenStatus.Opened));
            Assert.That(calls, Is.EqualTo(1));
            using (var writable = result.Value.Connection)
            {
                writable.Execute("UPDATE save_progress SET progress_value=? WHERE id=?", "updated", 1);
            }

            using (var readOnly = new NativeSqlite(savePath))
            {
                var rows = readOnly.Query("SELECT progress_value FROM save_progress WHERE id=?", 1);
                Assert.That(rows[0]["progress_value"], Is.EqualTo("updated"));
            }
        }

        private void CreateFSave(int schema)
        {
            using (var db = new NativeSqlite(savePath, readOnly: false))
            {
                db.Execute("CREATE TABLE save_header(schema_version INTEGER NOT NULL, app_version TEXT NOT NULL, profile_id TEXT NOT NULL, asset_contract INTEGER NOT NULL, world_scale TEXT NOT NULL, references_digest TEXT NOT NULL)");
                db.Execute("CREATE TABLE save_progress(id INTEGER PRIMARY KEY, progress_value TEXT NOT NULL)");
                db.Execute("INSERT INTO save_header VALUES(?,?,?,?,?,?)", schema, "0.1.0", Guid.NewGuid(), 1,
                    "real-metres-v1", ModelReferenceDigest.Compute(NoModels));
                db.Execute("INSERT INTO save_progress VALUES(?,?)", 1, "original");
            }
        }

        private SaveHeader ReadHeader()
        {
            using (var db = new NativeSqlite(savePath))
            {
                var row = db.Query("SELECT schema_version, app_version, profile_id, asset_contract, world_scale, references_digest FROM save_header")[0];
                return new SaveHeader(
                    int.Parse(row["schema_version"], CultureInfo.InvariantCulture),
                    row["app_version"],
                    Guid.Parse(row["profile_id"]),
                    int.Parse(row["asset_contract"], CultureInfo.InvariantCulture),
                    row["world_scale"],
                    row["references_digest"]);
            }
        }
    }
}
