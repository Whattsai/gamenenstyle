using System;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using BrickHigh.Domain;
using BrickHigh.Infrastructure;
using BrickHigh.Application;

namespace BrickHigh.Tests
{
    public class ReadContractTests
    {
        private string root;
        private string snapshot;
        private string variant;
        private string revision;
        private JObject manifest;
        private sealed class PresenterLease : IDisposable { public void Dispose() { } }

        [TestCase("System", BrickTier.Basic, CharacterSlot.Head, true)]
        [TestCase("DUPLO", BrickTier.Basic, CharacterSlot.Head, false)]
        [TestCase("System", BrickTier.Special, CharacterSlot.Head, false)]
        [TestCase("System", BrickTier.Basic, CharacterSlot.Legs, false)]
        [Property("TDD", "UT-100"), Property("TDD", "IT-016")]
        public void CatalogPreviewPresenter_CombinedFilters_SelectsMatchingRows(string family, BrickTier tier, CharacterSlot slot, bool expected)
        {
            var catalog = new BrickCatalog(root, PackageKind.Preview);
            using (var session = catalog.OpenAsync(CancellationToken.None).GetAwaiter().GetResult().Value)
            using (var presenter = new CatalogPreviewPresenter<PresenterLease>(session.SnapshotId, session.PackageKind))
            {
                var request = presenter.BeginSearch(new VariantQuery { QueryText = "3001", Family = family, Tier = tier, Slot = slot });
                var result = catalog.QueryAsync(session, request.Query, request.CancellationToken).GetAwaiter().GetResult();
                Assert.That(presenter.CompleteSearch(request, result), Is.True);
                Assert.That(presenter.Rows.Count, Is.EqualTo(expected ? 1 : 0));
                if (expected) Assert.That(presenter.Rows[0].VariantId, Is.EqualTo(Guid.Parse(variant)));
            }
        }

        [Test, Property("TDD", "UT-100"), Property("TDD", "IT-016")]
        public void CatalogPreviewPresenter_PartNumber_RanksBeforePartialNames()
        {
            using (var db = new NativeSqlite(Path.Combine(root, "catalog.db"), false))
                db.Execute("UPDATE runtime_variants SET display_json=json_set(display_json,'$.name','3001 候選') WHERE variant_id<>?", variant);
            WriteManifest();
            var catalog = new BrickCatalog(root, PackageKind.Preview);
            using (var session = catalog.OpenAsync(CancellationToken.None).GetAwaiter().GetResult().Value)
            using (var presenter = new CatalogPreviewPresenter<PresenterLease>(session.SnapshotId, session.PackageKind))
            {
                var request = presenter.BeginSearch(new VariantQuery { QueryText = "3001", Family = "System", Tier = BrickTier.Basic, Slot = CharacterSlot.Head });
                presenter.CompleteSearch(request, catalog.QueryAsync(session, request.Query, request.CancellationToken).GetAwaiter().GetResult());
                Assert.That(presenter.Rows.Count, Is.EqualTo(50));
                Assert.That(presenter.Rows[0].VariantId, Is.EqualTo(Guid.Parse(variant)));
                Assert.That(presenter.Rows.Skip(1).All(x => x.Name == "3001 候選"), Is.True);
                Assert.That(presenter.CanNextPage, Is.True);
            }
        }

        [SetUp] public void SetUp()
        {
            root = Path.Combine(Path.GetTempPath(), "BrickHigh-catalog-" + Guid.NewGuid().ToString("N"));
            Directory.CreateDirectory(root);
            snapshot = Guid.NewGuid().ToString();
            variant = Guid.NewGuid().ToString();
            revision = Guid.NewGuid().ToString();
            manifest = new JObject {
                ["packId"] = "test-pack", ["currentSnapshotId"] = snapshot, ["catalogSchemaVersion"] = 1,
                ["assetContractVersion"] = 1, ["readerVersion"] = 1, ["applicationId"] = "com.gamenenstyle.brickhigh.preview",
                ["packageKind"] = "Preview", ["buildTarget"] = "windows-x64", ["coordinateProfile"] = "canonical-rh-to-unity-lh-v1",
                ["sourceSnapshotStatus"] = "Frozen",
                ["sourceSelectionDigest"] = new string('a', 64), ["previewCompleteness"] = new JObject { ["incomplete"] = true },
                ["appVersion"] = "0.1.0", ["editorVersion"] = "6000.3.18f1",
                ["packageLockDigest"] = new string('b', 64), ["compatibleSaveVersions"] = new JArray(1),
                ["files"] = new JArray()
            };
            // 這些 bytes 只供讀取契約測試，不是假稱可由 Unity 載入的 bundle。
            AddFile("models.bundle", "AssetBundle", new byte[] { 1, 2, 3, 4 });
            AddFile("catalog.json", "LocalCatalog", System.Text.Encoding.UTF8.GetBytes("{}"));
            using (var db = new NativeSqlite(Path.Combine(root, "catalog.db"), false))
            {
                var schemaPath = Path.Combine(TestContext.CurrentContext.TestDirectory, "runtime_schema.sql");
                if (!File.Exists(schemaPath)) schemaPath = Path.GetFullPath(Path.Combine("..", "tools", "catalog", "runtime_schema.sql"));
                foreach (var command in File.ReadAllText(schemaPath).Split(';'))
                    if (!string.IsNullOrWhiteSpace(command)) db.Execute(command);
                foreach (var field in new[] { "packId", "currentSnapshotId", "applicationId", "packageKind", "buildTarget", "sourceSnapshotStatus" })
                    db.Execute("INSERT INTO runtime_meta VALUES(?,?)", field, (string)manifest[field]);
                db.Execute("INSERT INTO runtime_meta VALUES('schemaVersion','1')");
                db.Execute("INSERT INTO runtime_meta VALUES('minReaderVersion','1')");
                db.Execute("INSERT INTO runtime_meta VALUES('assetContractVersion','1')");
                db.Execute("INSERT INTO runtime_snapshots VALUES(?,?,?,?)", snapshot, "2026-09-08T15:59:59Z", "{\"C\":101,\"G\":1,\"V\":0,\"scope_reviewed\":false}", 1);
                db.Execute("INSERT INTO runtime_profiles VALUES(?,?,?)", snapshot, "system-stud-v1", "{\"compatibleWith\":[\"system-tube-v1\"],\"degreesOfFreedom\":[\"explicit-fixture-freedom\"]}");
                db.Execute("INSERT INTO runtime_profiles VALUES(?,?,?)", snapshot, "system-tube-v1", "{\"compatibleWith\":[\"system-stud-v1\"],\"degreesOfFreedom\":[\"explicit-fixture-freedom\"]}");
                foreach (var file in manifest["files"])
                    db.Execute("INSERT INTO runtime_files VALUES(?,?,?,?)", (string)file["storageKey"], (string)file["sha256"],
                        (long)file["byteLength"], (string)file["kind"]);
                string bundleDigest = (string)((JArray)manifest["files"])[0]["sha256"];
                for (int i = 0; i < 101; i++)
                {
                    var v = i == 0 ? variant : Guid.NewGuid().ToString();
                    var r = i == 0 ? revision : Guid.NewGuid().ToString();
                    var b = RuntimeBuildPolicy.ComputeIdentity(r, "windows-x64", (string)manifest["editorVersion"],
                        (string)manifest["packageLockDigest"], (string)manifest["coordinateProfile"],
                        bundleDigest, new string('d', 64));
                    db.Execute("INSERT INTO runtime_revisions VALUES(?,?)", v, r);
                    db.Execute("INSERT INTO runtime_variants VALUES(?,?,?,?,?,?,?)", snapshot, v, Guid.NewGuid().ToString(),
                        i == 2 ? "Special" : "Basic", JsonConvert.SerializeObject(new { name = i == 0 ? "中文'100%_積木" : "磚 " + i,
                            family = "System", partNumber = i == 0 ? "3001" : "part" + i }),
                        "{\"creationEligible\":true,\"bucketEligible\":true,\"buildSystems\":[\"System\"],\"characterSlots\":[\"Head\"]}", r);
                    db.Execute("INSERT INTO runtime_builds VALUES(?,?,?,?,?,?,?,?,?,?)", b, v, r, "windows-x64", (string)manifest["editorVersion"],
                        (string)manifest["packageLockDigest"], (string)manifest["coordinateProfile"], bundleDigest, new string('d', 64), "models.bundle");
                    db.Execute("INSERT INTO runtime_models VALUES(?,?,?,?,?,?,?)", snapshot, v, r, "windows-x64", b,
                        "{\"bounds\":[0.032,0.0096,0.016],\"vehicleMetadata\":null}", "model/" + v);
                }
            }
            WriteManifest();
        }

        [TestCase("manifest-coordinate-profile", CatalogErrorCode.IncompatibleContent)]
        [TestCase("editor-version", CatalogErrorCode.AssetCorrupt)]
        [TestCase("package-lock", CatalogErrorCode.AssetCorrupt)]
        [TestCase("coordinate-profile", CatalogErrorCode.AssetCorrupt)]
        [TestCase("content-digest", CatalogErrorCode.AssetCorrupt)]
        [TestCase("validation-digest", CatalogErrorCode.AssetCorrupt)]
        [Property("TDD", "UT-030")]
        public async Task RuntimeManifestBuildIdentity_MismatchRejectsPack(string fault, CatalogErrorCode expected)
        {
            using (var db = new NativeSqlite(Path.Combine(root, "catalog.db"), false))
            {
                switch (fault)
                {
                    case "manifest-coordinate-profile":
                        manifest["coordinateProfile"] = "unsupported-coordinate-profile";
                        break;
                    case "editor-version":
                        db.Execute("UPDATE runtime_builds SET editor_version='other-editor' WHERE variant_id=?", variant);
                        break;
                    case "package-lock":
                        db.Execute("UPDATE runtime_builds SET package_lock_digest=? WHERE variant_id=?", new string('e', 64), variant);
                        break;
                    case "coordinate-profile":
                        db.Execute("UPDATE runtime_builds SET coordinate_profile='other-profile' WHERE variant_id=?", variant);
                        break;
                    case "content-digest":
                        db.Execute("UPDATE runtime_builds SET content_digest=? WHERE variant_id=?", new string('e', 64), variant);
                        break;
                    case "validation-digest":
                        db.Execute("UPDATE runtime_builds SET validation_digest='not-a-digest' WHERE variant_id=?", variant);
                        break;
                }
            }
            WriteManifest();

            var result = await new BrickCatalog(root, PackageKind.Preview).OpenAsync(CancellationToken.None);

            Assert.That(result.IsSuccess, Is.False, fault);
            Assert.That(result.Error.Code, Is.EqualTo(expected), fault);
        }

        [Test, Property("TDD", "UT-030")]
        public void RuntimeManifestBuildIdentity_SourceRevisionForeignKeyRejectsDrift()
        {
            using (var db = new NativeSqlite(Path.Combine(root, "catalog.db"), false))
            {
                string replacement = Guid.NewGuid().ToString();
                db.Execute("INSERT INTO runtime_revisions VALUES(?,?)", variant, replacement);
                Assert.Throws<SqliteFailure>(() =>
                    db.Execute("UPDATE runtime_builds SET source_revision_id=? WHERE variant_id=?", replacement, variant));
            }
        }

        private void AddFile(string key, string kind, byte[] bytes)
        {
            File.WriteAllBytes(Path.Combine(root, key), bytes);
            ((JArray)manifest["files"]).Add(new JObject { ["storageKey"] = key, ["kind"] = kind,
                ["sha256"] = SafeContent.Hash(bytes), ["byteLength"] = bytes.LongLength });
        }

        private string RuntimeBuildIdFor(string sourceRevision, string editorVersion = null, string packageLockDigest = null)
        {
            return RuntimeBuildPolicy.ComputeIdentity(sourceRevision, "windows-x64",
                editorVersion ?? (string)manifest["editorVersion"],
                packageLockDigest ?? (string)manifest["packageLockDigest"],
                (string)manifest["coordinateProfile"],
                (string)manifest["files"][0]["sha256"],
                new string('d', 64));
        }

        private void RebuildRuntimeBuilds(string editorVersion, string packageLockDigest)
        {
            using (var db = new NativeSqlite(Path.Combine(root, "catalog.db"), false))
            {
                var rows = db.Query(@"SELECT runtime_build_id,variant_id,source_revision_id,build_target,
                    coordinate_profile,content_digest,validation_digest,bundle_key FROM runtime_builds");
                foreach (var row in rows)
                {
                    string next = RuntimeBuildPolicy.ComputeIdentity(row["source_revision_id"], row["build_target"],
                        editorVersion, packageLockDigest, row["coordinate_profile"], row["content_digest"], row["validation_digest"]);
                    db.Execute("INSERT INTO runtime_builds VALUES(?,?,?,?,?,?,?,?,?,?)",
                        next, row["variant_id"], row["source_revision_id"], row["build_target"],
                        editorVersion, packageLockDigest, row["coordinate_profile"],
                        row["content_digest"], row["validation_digest"], row["bundle_key"]);
                    db.Execute(@"UPDATE runtime_models SET runtime_build_id=?
                        WHERE runtime_build_id=? AND variant_id=? AND revision_id=? AND build_target=?",
                        next, row["runtime_build_id"], row["variant_id"], row["source_revision_id"], row["build_target"]);
                    db.Execute("DELETE FROM runtime_builds WHERE runtime_build_id=?", row["runtime_build_id"]);
                }
            }
            manifest["editorVersion"] = editorVersion;
            manifest["packageLockDigest"] = packageLockDigest;
        }

        private void ConfigureReleaseFixture()
        {
            manifest["packageKind"] = "Release";
            manifest["applicationId"] = "com.gamenenstyle.brickhigh";
            manifest["sourceSnapshotStatus"] = "Published";
            manifest["previewCompleteness"] = JValue.CreateNull();
            using (var db = new NativeSqlite(Path.Combine(root, "catalog.db"), false))
            {
                db.Execute("UPDATE runtime_meta SET value='Release' WHERE key='packageKind'");
                db.Execute("UPDATE runtime_meta SET value='com.gamenenstyle.brickhigh' WHERE key='applicationId'");
                db.Execute("UPDATE runtime_meta SET value='Published' WHERE key='sourceSnapshotStatus'");
            }
        }

        private void AddHistoricalVariant(string historicalSnapshot, string historicalVariant, string historicalRevision,
            string historicalBuild, string name, string tier, string partNumber, string addressKey)
        {
            using (var db = new NativeSqlite(Path.Combine(root, "catalog.db"), false))
            {
                if (db.Query("SELECT snapshot_id FROM runtime_snapshots WHERE snapshot_id=?", historicalSnapshot).Count == 0)
                    db.Execute("INSERT INTO runtime_snapshots SELECT ?,baseline_at,coverage_json,schema_version FROM runtime_snapshots WHERE snapshot_id=?",
                        historicalSnapshot, snapshot);
                db.Execute("INSERT INTO runtime_revisions VALUES(?,?)", historicalVariant, historicalRevision);
                db.Execute("INSERT INTO runtime_variants VALUES(?,?,?,?,?,?,?)",
                    historicalSnapshot, historicalVariant, Guid.NewGuid().ToString(), tier,
                    JsonConvert.SerializeObject(new { name, family = "System", partNumber }),
                    JsonConvert.SerializeObject(new { creationEligible = true, bucketEligible = true,
                        buildSystems = new[] { "System" }, characterSlots = new[] { "Head" } }),
                    historicalRevision);
                db.Execute(@"INSERT INTO runtime_builds
                    SELECT ?,?,?,build_target,editor_version,package_lock_digest,coordinate_profile,
                        content_digest,validation_digest,bundle_key
                    FROM runtime_builds WHERE source_revision_id=? LIMIT 1",
                    historicalBuild, historicalVariant, historicalRevision, revision);
                db.Execute("INSERT INTO runtime_models VALUES(?,?,?,?,?,?,?)",
                    historicalSnapshot, historicalVariant, historicalRevision, "windows-x64", historicalBuild,
                    JsonConvert.SerializeObject(new { historical = true }), addressKey);
            }
        }

        [Test, Property("TDD", "UT-034")]
        public async Task ModelReferenceResolver_ExactReference_PreservesRevision()
        {
            string oldSnapshot = Guid.NewGuid().ToString(), oldRevision = Guid.NewGuid().ToString();
            string oldBuild = RuntimeBuildIdFor(oldRevision);
            AddHistoricalVariant(oldSnapshot, variant, oldRevision, oldBuild, "舊版積木", "Basic", "old-3001", "historical/exact");
            WriteManifest();

            var catalog = new BrickCatalog(root, PackageKind.Preview);
            using (var session = (await catalog.OpenAsync(CancellationToken.None)).Value)
            {
                var reference = new ModelReference(Guid.Parse(oldSnapshot), Guid.Parse(variant), Guid.Parse(oldRevision));
                var details = await catalog.ResolveVariantAsync(session, reference, CancellationToken.None);
                var model = await catalog.ResolveModelAsync(session, reference, CancellationToken.None);

                Assert.That(details.IsSuccess, Is.True);
                Assert.That(details.Value.Model.SnapshotId, Is.EqualTo(Guid.Parse(oldSnapshot)));
                Assert.That(details.Value.Model.RevisionId, Is.EqualTo(Guid.Parse(oldRevision)));
                Assert.That(details.Value.RuntimeBuildId, Is.EqualTo(oldBuild));
                Assert.That(model.IsSuccess, Is.True);
                Assert.That(model.Value.RuntimeBuildId, Is.EqualTo(oldBuild));
                Assert.That(model.Value.AddressKey, Is.EqualTo("historical/exact"));
            }
        }

        [Test, Property("TDD", "UT-035")]
        public async Task ModelReferenceResolver_HistoricalProjection_RemainsFrozen()
        {
            string oldSnapshot = Guid.NewGuid().ToString(), oldRevision = Guid.NewGuid().ToString();
            string oldBuild = RuntimeBuildIdFor(oldRevision);
            AddHistoricalVariant(oldSnapshot, variant, oldRevision, oldBuild, "凍結舊名稱", "Advanced", "legacy-3001", "historical/frozen");
            WriteManifest();

            var catalog = new BrickCatalog(root, PackageKind.Preview);
            using (var session = (await catalog.OpenAsync(CancellationToken.None)).Value)
            {
                var current = await catalog.GetVariantAsync(session, Guid.Parse(variant), CancellationToken.None);
                var historical = await catalog.ResolveVariantAsync(session,
                    new ModelReference(Guid.Parse(oldSnapshot), Guid.Parse(variant), Guid.Parse(oldRevision)),
                    CancellationToken.None);

                Assert.That(current.Value.Name, Is.EqualTo("中文'100%_積木"));
                Assert.That(current.Value.Tier, Is.EqualTo(BrickTier.Basic));
                Assert.That(historical.IsSuccess, Is.True);
                Assert.That(historical.Value.Name, Is.EqualTo("凍結舊名稱"));
                Assert.That(historical.Value.Tier, Is.EqualTo(BrickTier.Advanced));
                Assert.That(historical.Value.Model.SnapshotId, Is.EqualTo(Guid.Parse(oldSnapshot)));
                Assert.That(historical.Value.Model.RevisionId, Is.EqualTo(Guid.Parse(oldRevision)));
            }
        }

        [Test, Property("TDD", "UT-036")]
        public async Task ModelReferenceResolver_OutOfScopeVariant_ExcludesNewAcquisition()
        {
            string oldSnapshot = Guid.NewGuid().ToString(), retiredVariant = Guid.NewGuid().ToString(),
                oldRevision = Guid.NewGuid().ToString();
            string oldBuild = RuntimeBuildIdFor(oldRevision);
            AddHistoricalVariant(oldSnapshot, retiredVariant, oldRevision, oldBuild,
                "退出版範圍積木", "Basic", "retired-3001", "historical/retired");
            WriteManifest();

            var catalog = new BrickCatalog(root, PackageKind.Preview);
            using (var session = (await catalog.OpenAsync(CancellationToken.None)).Value)
            {
                var current = await catalog.QueryAsync(session, new VariantQuery { QueryText = "retired-3001" }, CancellationToken.None);
                Assert.That(current.IsSuccess, Is.True);
                Assert.That(current.Value.Items, Is.Empty);

                var reference = new ModelReference(Guid.Parse(oldSnapshot), Guid.Parse(retiredVariant), Guid.Parse(oldRevision));
                var historical = await catalog.ResolveVariantAsync(session, reference, CancellationToken.None);
                var model = await catalog.ResolveModelAsync(session, reference, CancellationToken.None);
                Assert.That(historical.IsSuccess, Is.True);
                Assert.That(historical.Value.Name, Is.EqualTo("退出版範圍積木"));
                Assert.That(model.IsSuccess, Is.True);
                Assert.That(model.Value.AddressKey, Is.EqualTo("historical/retired"));
            }
        }

        [Test, Property("TDD", "UT-051")]
        public async Task InstallUpdatePolicy_Restart_OpensNewSessionOffline()
        {
            string oldSnapshot = Guid.NewGuid().ToString(), oldRevision = Guid.NewGuid().ToString();
            string oldBuild = RuntimeBuildIdFor(oldRevision);
            AddHistoricalVariant(oldSnapshot, variant, oldRevision, oldBuild,
                "升級前積木", "Basic", "legacy-upgrade-3001", "historical/restart-offline");
            WriteManifest();
            var reference = new ModelReference(Guid.Parse(oldSnapshot), Guid.Parse(variant), Guid.Parse(oldRevision));
            Func<System.Collections.Generic.Dictionary<string, string>> snapshotFiles = () =>
                Directory.GetFiles(root, "*", SearchOption.AllDirectories)
                    .ToDictionary(path => Path.GetRelativePath(root, path).Replace('\\', '/'),
                        path => SafeContent.Hash(File.ReadAllBytes(path)), StringComparer.OrdinalIgnoreCase);
            var before = snapshotFiles();

            // Version A/session A：profile 中保存的是完整舊模型引用，不允許退回 current revision。
            var catalogA = new BrickCatalog(root, PackageKind.Preview);
            var openedA = await catalogA.OpenAsync(CancellationToken.None);
            Assert.That(openedA.IsSuccess, Is.True, openedA.Error?.Message);
            using (var sessionA = openedA.Value)
            {
                Assert.That(sessionA.SnapshotId, Is.EqualTo(Guid.Parse(snapshot)));
                var legacy = await catalogA.ResolveModelAsync(sessionA, reference, CancellationToken.None);
                Assert.That(legacy.IsSuccess, Is.True);
                Assert.That(legacy.Value.RuntimeBuildId, Is.EqualTo(oldBuild));
            }

            // 模擬完全退出後由版本 B 重新建立 catalog/session；只使用安裝包內本機資料。
            var catalogB = new BrickCatalog(root, PackageKind.Preview);
            var openedB = await catalogB.OpenAsync(CancellationToken.None);
            Assert.That(openedB.IsSuccess, Is.True, openedB.Error?.Message);
            using (var sessionB = openedB.Value)
            {
                Assert.That(sessionB.SnapshotId, Is.EqualTo(Guid.Parse(snapshot)));
                var details = await catalogB.ResolveVariantAsync(sessionB, reference, CancellationToken.None);
                var model = await catalogB.ResolveModelAsync(sessionB, reference, CancellationToken.None);
                Assert.That(details.IsSuccess, Is.True);
                Assert.That(details.Value.Model.SnapshotId, Is.EqualTo(Guid.Parse(oldSnapshot)));
                Assert.That(details.Value.Model.RevisionId, Is.EqualTo(Guid.Parse(oldRevision)));
                Assert.That(details.Value.RuntimeBuildId, Is.EqualTo(oldBuild));
                Assert.That(model.IsSuccess, Is.True);
                Assert.That(model.Value.RuntimeBuildId, Is.EqualTo(oldBuild));
                Assert.That(model.Value.AddressKey, Is.EqualTo("historical/restart-offline"));
            }

            var after = snapshotFiles();
            Assert.That(after.Keys, Is.EquivalentTo(before.Keys));
            foreach (var entry in before)
                Assert.That(after[entry.Key], Is.EqualTo(entry.Value), entry.Key);
            Assert.That(File.Exists(Path.Combine(root, "catalog.db-wal")), Is.False);
            Assert.That(File.Exists(Path.Combine(root, "catalog.db-shm")), Is.False);
        }

        [Test, Property("TDD", "IT-024")]
        public async Task Resolve_MixedReferenceTuple_RejectsModelAndPreservesHistoricalRevision()
        {
            string oldSnapshot = Guid.NewGuid().ToString(), oldRevision = Guid.NewGuid().ToString();
            string oldBuild = RuntimeBuildIdFor(oldRevision);
            using (var db = new NativeSqlite(Path.Combine(root, "catalog.db"), false))
            {
                db.Execute("INSERT INTO runtime_snapshots SELECT ?,baseline_at,coverage_json,schema_version FROM runtime_snapshots WHERE snapshot_id=?", oldSnapshot, snapshot);
                db.Execute("INSERT INTO runtime_revisions VALUES(?,?)", variant, oldRevision);
                db.Execute("INSERT INTO runtime_variants SELECT ?,variant_id,part_id,tier,display_json,usage_json,? FROM runtime_variants WHERE variant_id=?", oldSnapshot, oldRevision, variant);
                db.Execute("INSERT INTO runtime_builds SELECT ?,variant_id,?,build_target,editor_version,package_lock_digest,coordinate_profile,content_digest,validation_digest,bundle_key FROM runtime_builds WHERE source_revision_id=?", oldBuild, oldRevision, revision);
                db.Execute("INSERT INTO runtime_models VALUES(?,?,?,?,?,?,?)", oldSnapshot, variant, oldRevision, "windows-x64", oldBuild, "{}", "historical/model");
            }
            WriteManifest();
            var catalog = new BrickCatalog(root, PackageKind.Preview);
            using (var session = (await catalog.OpenAsync(CancellationToken.None)).Value)
            {
                var old = await catalog.ResolveModelAsync(session, new ModelReference(Guid.Parse(oldSnapshot), Guid.Parse(variant), Guid.Parse(oldRevision)), CancellationToken.None);
                Assert.That(old.IsSuccess, Is.True);
                Assert.That(old.Value.AddressKey, Is.EqualTo("historical/model"));
                Assert.That(old.Value.RuntimeBuildId, Is.EqualTo(oldBuild));
                Assert.That(old.Value.BundleSha256, Is.EqualTo((string)manifest["files"][0]["sha256"]));
                var mixed = await catalog.ResolveModelAsync(session, new ModelReference(Guid.Parse(snapshot), Guid.Parse(variant), Guid.Parse(oldRevision)), CancellationToken.None);
                Assert.That(mixed.Error?.Code, Is.EqualTo(CatalogErrorCode.IncompatibleContent));
                Assert.That((await catalog.ResolveModelAsync(null, null, new CancellationToken(true))).Error?.Code, Is.EqualTo(CatalogErrorCode.Cancelled));
                Assert.That((await catalog.ResolveModelAsync(session, null, CancellationToken.None)).Error?.Code, Is.EqualTo(CatalogErrorCode.InvalidQuery));
                session.Dispose();
                Assert.That((await catalog.ResolveModelAsync(session, new ModelReference(Guid.Parse(snapshot), Guid.Parse(variant), Guid.Parse(revision)), CancellationToken.None)).Error?.Code, Is.EqualTo(CatalogErrorCode.InvalidQuery));
            }
        }

        [Test, Property("TDD", "UT-040")]
        public async Task RuntimeBuildPolicy_EngineChange_PreservesSourceRevision()
        {
            string before = RuntimeBuildIdFor(revision);
            string nextEditor = "6000.3.19f1";
            string nextLock = new string('e', 64);
            string after = RuntimeBuildIdFor(revision, nextEditor, nextLock);
            Assert.That(after, Is.Not.EqualTo(before));

            RebuildRuntimeBuilds(nextEditor, nextLock);
            WriteManifest();

            var catalog = new BrickCatalog(root, PackageKind.Preview);
            using (var session = (await catalog.OpenAsync(CancellationToken.None)).Value)
            {
                var details = await catalog.GetVariantAsync(session, Guid.Parse(variant), CancellationToken.None);
                Assert.That(details.IsSuccess, Is.True);
                Assert.That(details.Value.Model.RevisionId, Is.EqualTo(Guid.Parse(revision)));
                Assert.That(details.Value.RuntimeBuildId, Is.EqualTo(after));
                Assert.That(details.Value.RuntimeBuildId, Is.Not.EqualTo(before));
            }
        }

        [Test, Property("TDD", "UT-041")]
        public async Task RuntimeBuildPolicy_LegacyReference_RequiresCurrentBuild()
        {
            string oldSnapshot = Guid.NewGuid().ToString();
            string oldRevision = Guid.NewGuid().ToString();
            string oldBuild = RuntimeBuildIdFor(oldRevision);
            AddHistoricalVariant(oldSnapshot, variant, oldRevision, oldBuild,
                "舊版仍支援", "Basic", "legacy-current-build", "historical/current-build");

            string nextEditor = "6000.3.19f1";
            string nextLock = new string('e', 64);
            string expectedCurrentBuild = RuntimeBuildIdFor(oldRevision, nextEditor, nextLock);
            RebuildRuntimeBuilds(nextEditor, nextLock);
            WriteManifest();

            var catalog = new BrickCatalog(root, PackageKind.Preview);
            using (var session = (await catalog.OpenAsync(CancellationToken.None)).Value)
            {
                var reference = new ModelReference(Guid.Parse(oldSnapshot), Guid.Parse(variant), Guid.Parse(oldRevision));
                var details = await catalog.ResolveVariantAsync(session, reference, CancellationToken.None);
                var model = await catalog.ResolveModelAsync(session, reference, CancellationToken.None);
                Assert.That(details.IsSuccess, Is.True);
                Assert.That(model.IsSuccess, Is.True);
                Assert.That(details.Value.Model.RevisionId, Is.EqualTo(Guid.Parse(oldRevision)));
                Assert.That(details.Value.RuntimeBuildId, Is.EqualTo(expectedCurrentBuild));
                Assert.That(model.Value.RuntimeBuildId, Is.EqualTo(expectedCurrentBuild));
                Assert.That(expectedCurrentBuild, Is.Not.EqualTo(oldBuild));
            }
        }

        [Test, Property("TDD", "UT-042")]
        public async Task RuntimeBuildPolicy_OldBundleOnly_RejectsCompatibility()
        {
            string oldBundleDigest = (string)manifest["files"][0]["sha256"];
            manifest["editorVersion"] = "6000.3.19f1";
            manifest["packageLockDigest"] = new string('e', 64);
            WriteManifest();

            Assert.That(SafeContent.Hash(File.ReadAllBytes(Path.Combine(root, "models.bundle"))), Is.EqualTo(oldBundleDigest));
            var result = await new BrickCatalog(root, PackageKind.Preview).OpenAsync(CancellationToken.None);
            Assert.That(result.IsSuccess, Is.False);
            Assert.That(result.Error.Code, Is.EqualTo(CatalogErrorCode.AssetCorrupt));
        }

        [TestCase("missing-field"), TestCase("overflow"), TestCase("unlisted-bundle"), TestCase("duplicate-key")]
        [TestCase("db-file-mismatch"), TestCase("unsafe-key"), TestCase("missing-file"), TestCase("missing-local-catalog")]
        [Property("TDD", "CT-012")]
        public async Task OpenAsync_IncompleteFileIndex_RejectsPackWithoutThrowing(string fault)
        {
            var files = (JArray)manifest["files"];
            switch (fault)
            {
                case "missing-field": manifest.Remove("packageLockDigest"); break;
                case "overflow": manifest["readerVersion"] = long.MaxValue; break;
                case "unlisted-bundle":
                    using (var db = new NativeSqlite(Path.Combine(root, "catalog.db"), false))
                        db.Execute("UPDATE runtime_builds SET bundle_key='absent.bundle'");
                    break;
                case "duplicate-key": files.Add(files[0].DeepClone()); break;
                case "db-file-mismatch": files[0]["sha256"] = new string('c', 64); break;
                case "unsafe-key": files[0]["storageKey"] = "../escape.bundle"; break;
                case "missing-file": File.Delete(Path.Combine(root, "models.bundle")); break;
                case "missing-local-catalog":
                    files.RemoveAt(1);
                    using (var db = new NativeSqlite(Path.Combine(root, "catalog.db"), false))
                        db.Execute("DELETE FROM runtime_files WHERE kind='LocalCatalog'");
                    break;
            }
            WriteManifest();
            var result = await new BrickCatalog(root, PackageKind.Preview).OpenAsync(CancellationToken.None);
            Assert.That(result.IsSuccess, Is.False, fault);
            Assert.That(result.Error.Code, Is.EqualTo(fault == "missing-file" ? CatalogErrorCode.AssetMissing : CatalogErrorCode.AssetCorrupt));
        }

        private void WriteManifest()
        {
            using (var hash = SHA256.Create())
                manifest["catalogDbSha256"] = BitConverter.ToString(hash.ComputeHash(File.ReadAllBytes(Path.Combine(root, "catalog.db")))).Replace("-", "").ToLowerInvariant();
            File.WriteAllText(Path.Combine(root, "release-manifest.json"), manifest.ToString());
        }

        [Test, Property("TDD", "CT-001")]
        public async Task OpenAsync_ContractMatrix_ReturnsSpecifiedOutcome()
        {
            var cancelled = new CancellationTokenSource();
            cancelled.Cancel();
            var cancelledResult = await new BrickCatalog(root, PackageKind.Preview).OpenAsync(cancelled.Token);
            Assert.That(cancelledResult.IsSuccess, Is.False);
            Assert.That(cancelledResult.Error.Code, Is.EqualTo(CatalogErrorCode.Cancelled));
            Assert.That(File.Exists(Path.Combine(root, "catalog.db-wal")), Is.False);
            Assert.That(File.Exists(Path.Combine(root, "catalog.db-shm")), Is.False);

            var absent = await new BrickCatalog(Path.Combine(root, "missing-pack"), PackageKind.Release)
                .OpenAsync(CancellationToken.None);
            Assert.That(absent.Error.Code, Is.EqualTo(CatalogErrorCode.CatalogNotInstalled));

            ConfigureReleaseFixture();
            WriteManifest();
            var catalog = new BrickCatalog(root, PackageKind.Release);
            var opened = await catalog.OpenAsync(CancellationToken.None);
            Assert.That(opened.IsSuccess, Is.True, opened.Error?.Message);
            using (var session = opened.Value)
            {
                Assert.That(session.PackId, Is.EqualTo("test-pack"));
                Assert.That(session.SnapshotId, Is.EqualTo(Guid.Parse(snapshot)));
                Assert.That(session.SchemaVersion, Is.EqualTo(1));
                Assert.That(session.PackageKind, Is.EqualTo(PackageKind.Release));
            }

            File.Delete(Path.Combine(root, "catalog.json"));
            var missingDependency = await catalog.OpenAsync(CancellationToken.None);
            Assert.That(missingDependency.Error.Code, Is.EqualTo(CatalogErrorCode.AssetMissing));
            File.WriteAllBytes(Path.Combine(root, "catalog.json"), System.Text.Encoding.UTF8.GetBytes("{}"));

            manifest["catalogSchemaVersion"] = 99;
            WriteManifest();
            var unsupported = await catalog.OpenAsync(CancellationToken.None);
            Assert.That(unsupported.Error.Code, Is.EqualTo(CatalogErrorCode.UnsupportedSchema));
        }

        [Test, Property("TDD", "CT-002")]
        public async Task QueryAsync_ContractMatrix_ReturnsSpecifiedOutcome()
        {
            ConfigureReleaseFixture();
            WriteManifest();
            var catalog = new BrickCatalog(root, PackageKind.Release);
            using (var session = (await catalog.OpenAsync(CancellationToken.None)).Value)
            {
                var ids = new System.Collections.Generic.List<Guid>();
                string cursor = null;
                do
                {
                    var page = await catalog.QueryAsync(session, new VariantQuery { Limit = 17, Cursor = cursor }, CancellationToken.None);
                    Assert.That(page.IsSuccess, Is.True);
                    ids.AddRange(page.Value.Items.Select(x => x.VariantId));
                    cursor = page.Value.NextCursor;
                } while (cursor != null);
                Assert.That(ids.Count, Is.EqualTo(101));
                Assert.That(ids.Distinct().Count(), Is.EqualTo(101));
                Assert.That(ids.Select(x => x.ToString()), Is.Ordered.Using<string>(StringComparer.Ordinal));

                var exact = await catalog.QueryAsync(session, new VariantQuery { QueryText = "3001" }, CancellationToken.None);
                var family = await catalog.QueryAsync(session, new VariantQuery { Family = "System", Limit = 100 }, CancellationToken.None);
                var special = await catalog.QueryAsync(session, new VariantQuery { Tier = BrickTier.Special }, CancellationToken.None);
                var slot = await catalog.QueryAsync(session, new VariantQuery { Slot = CharacterSlot.Head, Limit = 100 }, CancellationToken.None);
                var character = await catalog.QueryAsync(session,
                    new VariantQuery { Purpose = CatalogPurpose.CharacterCreation, Limit = 100 }, CancellationToken.None);
                var bucket = await catalog.QueryAsync(session,
                    new VariantQuery { Purpose = CatalogPurpose.InitialBucket, BuildSystem = "System", Limit = 100 }, CancellationToken.None);

                Assert.That(exact.Value.Items.Count, Is.EqualTo(1));
                Assert.That(exact.Value.Items[0].VariantId, Is.EqualTo(Guid.Parse(variant)));
                Assert.That(family.Value.Items.Count, Is.EqualTo(100));
                Assert.That(family.Value.NextCursor, Is.Not.Null);
                Assert.That(special.Value.Items.Count, Is.EqualTo(1));
                Assert.That(special.Value.Items[0].Tier, Is.EqualTo(BrickTier.Special));
                Assert.That(slot.Value.Items.Count, Is.EqualTo(100));
                Assert.That(character.Value.Items.Count, Is.EqualTo(100));
                Assert.That(bucket.Value.Items.Count, Is.EqualTo(100));
                Assert.That(character.Value.Items.All(x => x.Tier != BrickTier.Special), Is.True);
                Assert.That(bucket.Value.Items.All(x => x.Tier != BrickTier.Special), Is.True);

                foreach (var invalid in new[]
                {
                    (VariantQuery)null,
                    new VariantQuery { Limit = 0 },
                    new VariantQuery { Limit = 101 },
                    new VariantQuery { Purpose = (CatalogPurpose)999 },
                    new VariantQuery { Tier = (BrickTier)999 },
                    new VariantQuery { Slot = (CharacterSlot)999 },
                    new VariantQuery { Purpose = CatalogPurpose.InitialBucket }
                })
                {
                    var result = await catalog.QueryAsync(session, invalid, CancellationToken.None);
                    Assert.That(result.Error?.Code, Is.EqualTo(CatalogErrorCode.InvalidQuery));
                }

                var first = await catalog.QueryAsync(session, new VariantQuery { Limit = 10 }, CancellationToken.None);
                var cursorJson = JObject.Parse(System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(first.Value.NextCursor)));
                cursorJson["snapshot"] = Guid.NewGuid().ToString();
                var wrongSnapshotCursor = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(cursorJson.ToString(Formatting.None)));
                var rejectedCursor = await catalog.QueryAsync(session,
                    new VariantQuery { Limit = 10, Cursor = wrongSnapshotCursor }, CancellationToken.None);
                Assert.That(rejectedCursor.Error?.Code, Is.EqualTo(CatalogErrorCode.InvalidCursor));

                var cancelled = new CancellationTokenSource();
                cancelled.Cancel();
                Assert.That((await catalog.QueryAsync(session, new VariantQuery(), cancelled.Token)).Error?.Code,
                    Is.EqualTo(CatalogErrorCode.Cancelled));
            }
        }

        [Test, Property("TDD", "CT-003")]
        public async Task GetVariantAsync_ContractMatrix_ReturnsSpecifiedOutcome()
        {
            string otherSnapshot = Guid.NewGuid().ToString();
            string otherVariant = Guid.NewGuid().ToString();
            string otherRevision = Guid.NewGuid().ToString();
            string otherBuild = RuntimeBuildIdFor(otherRevision);
            AddHistoricalVariant(otherSnapshot, otherVariant, otherRevision, otherBuild,
                "只在其他快照", "Advanced", "other-snapshot-part", "historical/other-snapshot");
            ConfigureReleaseFixture();
            WriteManifest();

            var catalog = new BrickCatalog(root, PackageKind.Release);
            var opened = await catalog.OpenAsync(CancellationToken.None);
            Assert.That(opened.IsSuccess, Is.True);
            var session = opened.Value;

            var current = await catalog.GetVariantAsync(session, Guid.Parse(variant), CancellationToken.None);
            Assert.That(current.IsSuccess, Is.True);
            Assert.That(current.Value.Name, Is.EqualTo("中文'100%_積木"));
            Assert.That(current.Value.Model.SnapshotId, Is.EqualTo(Guid.Parse(snapshot)));
            Assert.That(current.Value.Model.RevisionId, Is.EqualTo(Guid.Parse(revision)));

            var wrongSnapshot = await catalog.GetVariantAsync(session, Guid.Parse(otherVariant), CancellationToken.None);
            Assert.That(wrongSnapshot.Error?.Code, Is.EqualTo(CatalogErrorCode.VariantNotFound));

            var unknown = await catalog.GetVariantAsync(session, Guid.NewGuid(), CancellationToken.None);
            Assert.That(unknown.Error?.Code, Is.EqualTo(CatalogErrorCode.VariantNotFound));
            Assert.That((await catalog.GetVariantAsync(session, Guid.Empty, CancellationToken.None)).Error?.Code,
                Is.EqualTo(CatalogErrorCode.InvalidQuery));

            var cancelled = new CancellationTokenSource();
            cancelled.Cancel();
            Assert.That((await catalog.GetVariantAsync(session, Guid.Parse(variant), cancelled.Token)).Error?.Code,
                Is.EqualTo(CatalogErrorCode.Cancelled));

            session.Dispose();
            Assert.That((await catalog.GetVariantAsync(session, Guid.Parse(variant), CancellationToken.None)).Error?.Code,
                Is.EqualTo(CatalogErrorCode.InvalidQuery));
        }

        [TestCase(0, 0, 0, false)]
        [TestCase(101, 0, 101, true)]
        [TestCase(101, 3, 98, true)]
        [Property("TDD", "CT-005")]
        public async Task GetCoverageAsync_ContractMatrix_ReturnsSpecifiedOutcome(int c, int g, int v, bool reviewed)
        {
            using (var db = new NativeSqlite(Path.Combine(root, "catalog.db"), false))
                db.Execute("UPDATE runtime_snapshots SET coverage_json=? WHERE snapshot_id=?",
                    JsonConvert.SerializeObject(new { C = c, G = g, V = v, scope_reviewed = reviewed }), snapshot);
            ConfigureReleaseFixture();
            WriteManifest();

            var catalog = new BrickCatalog(root, PackageKind.Release);
            using (var session = (await catalog.OpenAsync(CancellationToken.None)).Value)
            {
                var result = await catalog.GetCoverageAsync(session, CancellationToken.None);
                Assert.That(result.IsSuccess, Is.True);
                Assert.That(result.Error, Is.Null);
                Assert.That(result.Value.C, Is.EqualTo(c));
                Assert.That(result.Value.G, Is.EqualTo(g));
                Assert.That(result.Value.V, Is.EqualTo(v));
                Assert.That(result.Value.ScopeReviewed, Is.EqualTo(reviewed));
                if (c == 0) Assert.That(result.Value.Ratio, Is.Null);
                else Assert.That(result.Value.Ratio, Is.EqualTo((double)v / c).Within(1e-12));
            }
        }

        [Test, Property("TDD", "CT-010")]
        public async Task OpenRelease_PreviewPack_RejectsPackage()
        {
            var release = new BrickCatalog(root, PackageKind.Release);
            var result = await release.OpenAsync(CancellationToken.None);
            Assert.That(result.Error.Code, Is.EqualTo(CatalogErrorCode.IncompatibleContent));
            Assert.That(result.Error.Message, Is.EqualTo("此資產包僅供技術預覽，不能作為正式遊戲資料。"));
            var preview = new BrickCatalog(root, PackageKind.Preview);
            using (var session = (await preview.OpenAsync(CancellationToken.None)).Value)
            {
                var invalid = await preview.QueryAsync(session, new VariantQuery { Purpose = CatalogPurpose.CharacterCreation }, CancellationToken.None);
                Assert.That(invalid.Error.Code, Is.EqualTo(CatalogErrorCode.InvalidQuery));
            }
        }

        [Test, Property("TDD", "IT-008")]
        public async Task RunReadContract_ScenarioMatrix_PreservesContract()
        {
            string usage = JsonConvert.SerializeObject(new
            {
                creationEligible = true,
                bucketEligible = true,
                buildSystems = new[] { "System" },
                characterSlots = new[] { "Head" },
                anchors = new[] { new { id = "head-top", profile = "system-stud-v1" } }
            });
            string metadata = JsonConvert.SerializeObject(new
            {
                bounds = new[] { 0.032, 0.0096, 0.016 },
                vehicleMetadata = new
                {
                    radiusMeters = 0.012,
                    widthMeters = 0.008,
                    axleDirection = new[] { 1, 0, 0 },
                    massKg = (double?)null,
                    massEvidence = "Unknown",
                    massReason = "release-fixture"
                }
            });
            string otherSnapshot = Guid.NewGuid().ToString();
            using (var db = new NativeSqlite(Path.Combine(root, "catalog.db"), false))
            {
                db.Execute("UPDATE runtime_variants SET usage_json=? WHERE snapshot_id=? AND variant_id=?", usage, snapshot, variant);
                db.Execute("UPDATE runtime_models SET metadata_json=? WHERE snapshot_id=? AND variant_id=?", metadata, snapshot, variant);
                db.Execute("UPDATE runtime_snapshots SET coverage_json=? WHERE snapshot_id=?",
                    JsonConvert.SerializeObject(new { C = 101, G = 0, V = 101, scope_reviewed = true }), snapshot);
                db.Execute("INSERT INTO runtime_profiles VALUES(?,?,?)", snapshot, "duplo-stud-v1",
                    JsonConvert.SerializeObject(new { compatibleWith = new[] { "duplo-tube-v1" }, degreesOfFreedom = new[] { "axial-insert" } }));
                db.Execute("INSERT INTO runtime_profiles VALUES(?,?,?)", snapshot, "duplo-tube-v1",
                    JsonConvert.SerializeObject(new { compatibleWith = new[] { "duplo-stud-v1" }, degreesOfFreedom = new[] { "axial-insert" } }));
                db.Execute("INSERT INTO runtime_snapshots VALUES(?,?,?,1)", otherSnapshot, "2026-10-10T00:00:00Z",
                    JsonConvert.SerializeObject(new { C = 1, G = 1, V = 0, scope_reviewed = false }));
                db.Execute("INSERT INTO runtime_profiles VALUES(?,?,?)", otherSnapshot, "system-stud-v1",
                    JsonConvert.SerializeObject(new { compatibleWith = new[] { "wrong-v1" }, degreesOfFreedom = new[] { "wrong" } }));
            }
            ConfigureReleaseFixture();
            WriteManifest();

            Func<System.Collections.Generic.Dictionary<string, string>> snapshotFiles = () =>
                Directory.GetFiles(root, "*", SearchOption.AllDirectories)
                    .ToDictionary(path => Path.GetRelativePath(root, path).Replace('\\', '/'),
                        path => SafeContent.Hash(File.ReadAllBytes(path)), StringComparer.OrdinalIgnoreCase);
            var before = snapshotFiles();

            var catalog = new BrickCatalog(root, PackageKind.Release);
            var opened = await catalog.OpenAsync(CancellationToken.None);
            Assert.That(opened.IsSuccess, Is.True, opened.Error?.Message);
            using (var session = opened.Value)
            {
                var ids = new System.Collections.Generic.List<Guid>();
                string cursor = null;
                do
                {
                    var page = await catalog.QueryAsync(session, new VariantQuery { Cursor = cursor, Limit = 17 }, CancellationToken.None);
                    Assert.That(page.IsSuccess, Is.True);
                    ids.AddRange(page.Value.Items.Select(x => x.VariantId));
                    cursor = page.Value.NextCursor;
                } while (cursor != null);
                Assert.That(ids.Count, Is.EqualTo(101));
                Assert.That(ids.Distinct().Count(), Is.EqualTo(101));
                Assert.That(ids.Select(x => x.ToString()), Is.Ordered.Using<string>(StringComparer.Ordinal));

                var character = await catalog.QueryAsync(session,
                    new VariantQuery { Purpose = CatalogPurpose.CharacterCreation, Limit = 100 }, CancellationToken.None);
                var bucket = await catalog.QueryAsync(session,
                    new VariantQuery { Purpose = CatalogPurpose.InitialBucket, BuildSystem = "System", Limit = 100 }, CancellationToken.None);
                Assert.That(character.Value.Items.Count, Is.EqualTo(100));
                Assert.That(bucket.Value.Items.Count, Is.EqualTo(100));
                Assert.That(character.Value.Items.All(x => x.Tier != BrickTier.Special), Is.True);
                Assert.That(bucket.Value.Items.All(x => x.Tier != BrickTier.Special), Is.True);

                var detail = await catalog.GetVariantAsync(session, Guid.Parse(variant), CancellationToken.None);
                Assert.That(detail.Value.Name, Is.EqualTo("中文'100%_積木"));
                Assert.That(detail.Value.Model.RevisionId, Is.EqualTo(Guid.Parse(revision)));
                var usageJson = JObject.Parse(detail.Value.UsageJson);
                var metadataJson = JObject.Parse(detail.Value.MetadataJson);
                Assert.That((string)usageJson["anchors"][0]["id"], Is.EqualTo("head-top"));
                Assert.That((double)metadataJson["vehicleMetadata"]["radiusMeters"], Is.EqualTo(0.012));
                Assert.That(metadataJson["vehicleMetadata"]["axleDirection"].Values<int>(), Is.EqualTo(new[] { 1, 0, 0 }));

                var coverage = (await catalog.GetCoverageAsync(session, CancellationToken.None)).Value;
                Assert.That(coverage.C, Is.EqualTo(101));
                Assert.That(coverage.G, Is.EqualTo(0));
                Assert.That(coverage.V, Is.EqualTo(101));
                Assert.That(coverage.ScopeReviewed, Is.True);
                Assert.That(coverage.Ratio, Is.EqualTo(1.0));

                var profiles = (await catalog.GetProfilesAsync(session, CancellationToken.None)).Value.Definitions;
                Assert.That(profiles.Keys, Is.EquivalentTo(new[]
                {
                    "system-stud-v1", "system-tube-v1", "duplo-stud-v1", "duplo-tube-v1"
                }));
                var stud = JObject.Parse(profiles["system-stud-v1"]);
                Assert.That((string)stud["compatibleWith"][0], Is.EqualTo("system-tube-v1"));
                Assert.That(stud["degreesOfFreedom"].Values<string>(), Is.Not.Empty);
                Assert.That(profiles.ContainsKey("wrong-v1"), Is.False);
            }

            var after = snapshotFiles();
            Assert.That(after.Keys, Is.EquivalentTo(before.Keys));
            foreach (var entry in before) Assert.That(after[entry.Key], Is.EqualTo(entry.Value), entry.Key);
            Assert.That(File.Exists(Path.Combine(root, "catalog.db-wal")), Is.False);
            Assert.That(File.Exists(Path.Combine(root, "catalog.db-shm")), Is.False);
        }

        [Test, Property("TDD", "UT-043")]
        public async Task BrickCatalog_SessionQueries_KeepSnapshot()
        {
            string otherSnapshot = Guid.NewGuid().ToString();
            using (var db = new NativeSqlite(Path.Combine(root, "catalog.db"), false))
            {
                db.Execute("INSERT INTO runtime_snapshots VALUES(?,?,?,1)", otherSnapshot, "2026-10-10T00:00:00Z",
                    JsonConvert.SerializeObject(new { C = 1, G = 0, V = 1, scope_reviewed = true }));
                db.Execute("INSERT INTO runtime_profiles VALUES(?,?,?)", otherSnapshot, "other-only-v1",
                    JsonConvert.SerializeObject(new { compatibleWith = Array.Empty<string>(), degreesOfFreedom = new[] { "wrong-snapshot" } }));
            }
            WriteManifest();

            var catalog = new BrickCatalog(root, PackageKind.Preview);
            var opened = await catalog.OpenAsync(CancellationToken.None);
            Assert.That(opened.IsSuccess, Is.True);
            Assert.That(opened.Error, Is.Null);
            using (var session = opened.Value)
            {
                Assert.That(session.PackId, Is.EqualTo("test-pack"));
                Assert.That(session.SnapshotId, Is.EqualTo(Guid.Parse(snapshot)));
                Assert.That(session.SchemaVersion, Is.EqualTo(1));
                Assert.That(session.PackageKind, Is.EqualTo(PackageKind.Preview));

                // 已開啟的 session 不跟著外部 manifest 指標漂移。
                manifest["currentSnapshotId"] = otherSnapshot;
                WriteManifest();

                var page = await catalog.QueryAsync(session, new VariantQuery { Limit = 5 }, CancellationToken.None);
                var detail = await catalog.GetVariantAsync(session, Guid.Parse(variant), CancellationToken.None);
                var profiles = await catalog.GetProfilesAsync(session, CancellationToken.None);
                var coverage = await catalog.GetCoverageAsync(session, CancellationToken.None);
                var missing = await catalog.GetVariantAsync(session, Guid.NewGuid(), CancellationToken.None);

                Assert.That(page.IsSuccess, Is.True);
                Assert.That(page.Error, Is.Null);
                Assert.That(page.Value.Items, Is.Not.Empty);
                Assert.That(page.Value.Items.All(x => x.Model.SnapshotId == Guid.Parse(snapshot)), Is.True);
                Assert.That(detail.IsSuccess, Is.True);
                Assert.That(detail.Error, Is.Null);
                Assert.That(detail.Value.Model.SnapshotId, Is.EqualTo(Guid.Parse(snapshot)));
                Assert.That(profiles.IsSuccess, Is.True);
                Assert.That(profiles.Value.Definitions.ContainsKey("other-only-v1"), Is.False);
                Assert.That(coverage.IsSuccess, Is.True);
                Assert.That(coverage.Value.C, Is.EqualTo(101));
                Assert.That(coverage.Value.G, Is.EqualTo(1));
                Assert.That(coverage.Value.V, Is.EqualTo(0));
                Assert.That(missing.IsSuccess, Is.False);
                Assert.That(missing.Value, Is.Null);
                Assert.That(missing.Error, Is.Not.Null);
            }
        }

        [Test, Property("TDD", "UT-044")]
        public async Task BrickCatalog_DetailsProfilesCoverage_ReturnFrozenData()
        {
            string usage = JsonConvert.SerializeObject(new
            {
                creationEligible = true,
                bucketEligible = true,
                buildSystems = new[] { "System" },
                characterSlots = new[] { "Head" },
                anchors = new[] { new { id = "head-top", profile = "system-stud-v1" } }
            });
            string metadata = JsonConvert.SerializeObject(new
            {
                bounds = new[] { 0.032, 0.0096, 0.016 },
                vehicleMetadata = new
                {
                    radiusMeters = 0.012,
                    widthMeters = 0.008,
                    axleDirection = new[] { 1, 0, 0 },
                    massKg = (double?)null,
                    massEvidence = "Unknown",
                    massReason = "fixture"
                }
            });
            string otherSnapshot = Guid.NewGuid().ToString();
            using (var db = new NativeSqlite(Path.Combine(root, "catalog.db"), false))
            {
                db.Execute("UPDATE runtime_variants SET usage_json=? WHERE snapshot_id=? AND variant_id=?", usage, snapshot, variant);
                db.Execute("UPDATE runtime_models SET metadata_json=? WHERE snapshot_id=? AND variant_id=?", metadata, snapshot, variant);
                db.Execute("INSERT INTO runtime_snapshots VALUES(?,?,?,1)", otherSnapshot, "2026-10-10T00:00:00Z",
                    JsonConvert.SerializeObject(new { C = 999, G = 998, V = 1, scope_reviewed = true }));
                db.Execute("INSERT INTO runtime_profiles VALUES(?,?,?)", otherSnapshot, "wrong-only-v1",
                    JsonConvert.SerializeObject(new { compatibleWith = Array.Empty<string>(), degreesOfFreedom = new[] { "wrong-snapshot" } }));
            }
            WriteManifest();

            var catalog = new BrickCatalog(root, PackageKind.Preview);
            using (var session = (await catalog.OpenAsync(CancellationToken.None)).Value)
            {
                var detail = await catalog.GetVariantAsync(session, Guid.Parse(variant), CancellationToken.None);
                var profiles = await catalog.GetProfilesAsync(session, CancellationToken.None);
                var coverage = await catalog.GetCoverageAsync(session, CancellationToken.None);

                Assert.That(detail.IsSuccess, Is.True);
                Assert.That(detail.Value.Model.RevisionId, Is.EqualTo(Guid.Parse(revision)));
                var usageJson = JObject.Parse(detail.Value.UsageJson);
                var metadataJson = JObject.Parse(detail.Value.MetadataJson);
                Assert.That((string)usageJson["anchors"][0]["id"], Is.EqualTo("head-top"));
                Assert.That((string)usageJson["anchors"][0]["profile"], Is.EqualTo("system-stud-v1"));
                Assert.That((double)metadataJson["vehicleMetadata"]["radiusMeters"], Is.EqualTo(0.012));
                Assert.That((double)metadataJson["vehicleMetadata"]["widthMeters"], Is.EqualTo(0.008));
                Assert.That(metadataJson["vehicleMetadata"]["axleDirection"].Values<int>(), Is.EqualTo(new[] { 1, 0, 0 }));
                Assert.That((string)metadataJson["vehicleMetadata"]["massEvidence"], Is.EqualTo("Unknown"));

                Assert.That(profiles.Value.Definitions.Keys, Is.EquivalentTo(new[] { "system-stud-v1", "system-tube-v1" }));
                Assert.That(profiles.Value.Definitions.ContainsKey("wrong-only-v1"), Is.False);
                Assert.That(coverage.Value.C, Is.EqualTo(101));
                Assert.That(coverage.Value.G, Is.EqualTo(1));
                Assert.That(coverage.Value.V, Is.EqualTo(0));
                Assert.That(coverage.Value.ScopeReviewed, Is.False);
            }
        }

        [Test, Property("TDD", "UT-045")]
        public async Task BrickCatalog_ReadOnlyCalls_DoNotGrantOwnership()
        {
            Func<System.Collections.Generic.Dictionary<string, string>> snapshotFiles = () =>
                Directory.GetFiles(root, "*", SearchOption.AllDirectories)
                    .ToDictionary(path => Path.GetRelativePath(root, path).Replace('\\', '/'),
                        path => SafeContent.Hash(File.ReadAllBytes(path)), StringComparer.OrdinalIgnoreCase);
            var before = snapshotFiles();

            var catalog = new BrickCatalog(root, PackageKind.Preview);
            using (var session = (await catalog.OpenAsync(CancellationToken.None)).Value)
            {
                Assert.That((await catalog.QueryAsync(session, new VariantQuery { Limit = 3 }, CancellationToken.None)).IsSuccess, Is.True);
                Assert.That((await catalog.GetVariantAsync(session, Guid.Parse(variant), CancellationToken.None)).IsSuccess, Is.True);
                Assert.That((await catalog.GetProfilesAsync(session, CancellationToken.None)).IsSuccess, Is.True);
                Assert.That((await catalog.GetCoverageAsync(session, CancellationToken.None)).IsSuccess, Is.True);
            }

            var after = snapshotFiles();
            Assert.That(after.Keys, Is.EquivalentTo(before.Keys));
            foreach (var entry in before)
                Assert.That(after[entry.Key], Is.EqualTo(entry.Value), entry.Key);
            Assert.That(File.Exists(Path.Combine(root, "catalog.db-wal")), Is.False);
            Assert.That(File.Exists(Path.Combine(root, "catalog.db-shm")), Is.False);

            var methods = typeof(IBrickCatalog).GetMethods().Select(x => x.Name).OrderBy(x => x).ToArray();
            Assert.That(methods, Is.EqualTo(new[]
            {
                "GetCoverageAsync", "GetProfilesAsync", "GetVariantAsync", "OpenAsync", "QueryAsync"
            }));
        }

        [Test, Property("TDD", "CT-004")]
        public async Task GetProfilesAsync_FixedSession_SeparatesFamiliesAndSnapshotVersions()
        {
            string otherSnapshot = Guid.NewGuid().ToString();
            using (var db = new NativeSqlite(Path.Combine(root, "catalog.db"), false))
            {
                db.Execute("INSERT INTO runtime_profiles VALUES(?,?,?)", snapshot, "duplo-stud-v1",
                    "{\"compatibleWith\":[\"duplo-tube-v1\"],\"degreesOfFreedom\":[\"axial-insert\"]}");
                db.Execute("INSERT INTO runtime_profiles VALUES(?,?,?)", snapshot, "duplo-tube-v1",
                    "{\"compatibleWith\":[\"duplo-stud-v1\"],\"degreesOfFreedom\":[\"axial-insert\"]}");
                db.Execute("INSERT INTO runtime_snapshots SELECT ?,baseline_at,coverage_json,schema_version FROM runtime_snapshots WHERE snapshot_id=?",
                    otherSnapshot, snapshot);
                db.Execute("INSERT INTO runtime_profiles VALUES(?,?,?)", otherSnapshot, "system-stud-v1",
                    "{\"compatibleWith\":[\"wrong-other-snapshot-v1\"],\"degreesOfFreedom\":[\"wrong\"]}");
                db.Execute("INSERT INTO runtime_profiles VALUES(?,?,?)", otherSnapshot, "second-only-v1",
                    "{\"compatibleWith\":[\"other-v1\"],\"degreesOfFreedom\":[\"wrong\"]}");
            }
            WriteManifest();

            var catalog = new BrickCatalog(root, PackageKind.Preview);
            using (var session = (await catalog.OpenAsync(CancellationToken.None)).Value)
            {
                var result = await catalog.GetProfilesAsync(session, CancellationToken.None);
                Assert.That(result.IsSuccess, Is.True);
                Assert.That(result.Value.Definitions.Keys, Is.EquivalentTo(new[]
                {
                    "system-stud-v1", "system-tube-v1", "duplo-stud-v1", "duplo-tube-v1"
                }));
                Assert.That(result.Value.Definitions.ContainsKey("second-only-v1"), Is.False);

                var systemStud = JObject.Parse(result.Value.Definitions["system-stud-v1"]);
                var duploStud = JObject.Parse(result.Value.Definitions["duplo-stud-v1"]);
                Assert.That(systemStud["compatibleWith"].Values<string>(), Is.EquivalentTo(new[] { "system-tube-v1" }));
                Assert.That(duploStud["compatibleWith"].Values<string>(), Is.EquivalentTo(new[] { "duplo-tube-v1" }));
                Assert.That(systemStud["degreesOfFreedom"].Values<string>(), Is.Not.Empty);
                Assert.That(duploStud["degreesOfFreedom"].Values<string>(), Is.Not.Empty);
            }
        }

        [Test, Property("TDD", "UT-058")]
        public async Task VariantQuery_InvalidEnumsAndVariantIds_ReturnSpecifiedError()
        {
            var catalog = new BrickCatalog(root, PackageKind.Preview);
            using (var session = (await catalog.OpenAsync(CancellationToken.None)).Value)
            {
                foreach (var invalid in new[]
                {
                    new VariantQuery { Purpose = (CatalogPurpose)999 },
                    new VariantQuery { Tier = (BrickTier)999 },
                    new VariantQuery { Slot = (CharacterSlot)999 },
                    new VariantQuery { Limit = 0 }
                })
                {
                    var result = await catalog.QueryAsync(session, invalid, CancellationToken.None);
                    Assert.That(result.Error?.Code, Is.EqualTo(CatalogErrorCode.InvalidQuery));
                }
                Assert.That((await catalog.GetVariantAsync(session, Guid.Empty, CancellationToken.None)).Error?.Code,
                    Is.EqualTo(CatalogErrorCode.InvalidQuery));
                var unknown = Guid.NewGuid();
                while (unknown == Guid.Parse(variant)) unknown = Guid.NewGuid();
                Assert.That((await catalog.GetVariantAsync(session, unknown, CancellationToken.None)).Error?.Code,
                    Is.EqualTo(CatalogErrorCode.VariantNotFound));
            }
        }

        [Test, Property("TDD", "CT-014")]
        public async Task QueryAsync_OversizedOrLiteralWildcard_ValidatesAndBinds()
        {
            var catalog = new BrickCatalog(root, PackageKind.Preview);
            using (var session = (await catalog.OpenAsync(CancellationToken.None)).Value)
            {
                foreach (var query in new[] { "%", "_", "'", "中文", "3001" })
                {
                    var result = await catalog.QueryAsync(session, new VariantQuery { QueryText = query }, CancellationToken.None);
                    Assert.That(result.Value.Items.Count, Is.EqualTo(1));
                    Assert.That(result.Value.Items[0].VariantId, Is.EqualTo(Guid.Parse(variant)));
                }
                var page = (await catalog.QueryAsync(session, new VariantQuery(), CancellationToken.None)).Value;
                var foreign = await catalog.QueryAsync(session, new VariantQuery { QueryText = "磚", Cursor = page.NextCursor }, CancellationToken.None);
                Assert.That(foreign.Error.Code, Is.EqualTo(CatalogErrorCode.InvalidCursor));
                foreach (var bad in new[] { "broken", new string('a', 4096), "非ASCII" })
                    Assert.That((await catalog.QueryAsync(session, new VariantQuery { Cursor = bad }, CancellationToken.None)).Error.Code,
                        Is.EqualTo(CatalogErrorCode.InvalidCursor));
            }
        }

        [Test, Property("TDD", "CT-013")]
        public async Task QueryAsync_NullOrDisposedSession_ReturnsInvalidQuery()
        {
            var catalog = new BrickCatalog(root, PackageKind.Preview);
            var session = (await catalog.OpenAsync(CancellationToken.None)).Value;
            Assert.That((await catalog.QueryAsync(session, null, CancellationToken.None)).Error.Code, Is.EqualTo(CatalogErrorCode.InvalidQuery));
            var other = new BrickCatalog(root, PackageKind.Preview);
            Assert.That((await other.QueryAsync(session, new VariantQuery(), CancellationToken.None)).Error.Code, Is.EqualTo(CatalogErrorCode.InvalidQuery));
            session.Dispose(); session.Dispose();
            Assert.That((await catalog.QueryAsync(session, new VariantQuery(), CancellationToken.None)).Error.Code, Is.EqualTo(CatalogErrorCode.InvalidQuery));
            Assert.That((await catalog.QueryAsync(null, null, new CancellationToken(true))).Error.Code, Is.EqualTo(CatalogErrorCode.Cancelled));
        }

        [Test, Property("TDD", "CT-012")]
        public async Task OpenAsync_ManifestCatalogMismatch_RejectsPack()
        {
            manifest["packId"] = "wrong";
            WriteManifest();
            Assert.That((await new BrickCatalog(root, PackageKind.Preview).OpenAsync(CancellationToken.None)).Error.Code, Is.EqualTo(CatalogErrorCode.IncompatibleContent));
            manifest["packId"] = "test-pack";
            manifest["catalogSchemaVersion"] = 99;
            WriteManifest();
            Assert.That((await new BrickCatalog(root, PackageKind.Preview).OpenAsync(CancellationToken.None)).Error.Code, Is.EqualTo(CatalogErrorCode.UnsupportedSchema));
            manifest["catalogSchemaVersion"] = 1;
            File.WriteAllBytes(Path.Combine(root, "catalog.db"), new byte[] { 1, 2, 3 });
            WriteManifest();
            Assert.That((await new BrickCatalog(root, PackageKind.Preview).OpenAsync(CancellationToken.None)).Error.Code, Is.EqualTo(CatalogErrorCode.AssetCorrupt));
        }

        [Test, Property("TDD", "CT-014")]
        public async Task QueryAsync_CursorFromAnotherOpenSession_RejectsBinding()
        {
            var catalog = new BrickCatalog(root, PackageKind.Preview);
            using (var first = (await catalog.OpenAsync(CancellationToken.None)).Value)
            using (var second = (await catalog.OpenAsync(CancellationToken.None)).Value)
            {
                var page = (await catalog.QueryAsync(first, new VariantQuery(), CancellationToken.None)).Value;
                var result = await catalog.QueryAsync(second, new VariantQuery { Cursor = page.NextCursor }, CancellationToken.None);
                Assert.That(result.Error?.Code, Is.EqualTo(CatalogErrorCode.InvalidCursor));
            }
        }

        [Test, Property("TDD", "CT-014")]
        public async Task QueryAsync_CursorRankOverflow_ReturnsFailureWithoutThrowing()
        {
            var catalog = new BrickCatalog(root, PackageKind.Preview);
            using (var session = (await catalog.OpenAsync(CancellationToken.None)).Value)
            {
                var page = (await catalog.QueryAsync(session, new VariantQuery(), CancellationToken.None)).Value;
                var json = JObject.Parse(System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(page.NextCursor)));
                json["rank"] = long.MaxValue;
                var cursor = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(json.ToString()));
                var result = await catalog.QueryAsync(session, new VariantQuery { Cursor = cursor }, CancellationToken.None);
                Assert.That(result.Error?.Code, Is.EqualTo(CatalogErrorCode.InvalidCursor));
            }
        }
    }
}
