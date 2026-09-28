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
                ["packageKind"] = "Preview", ["buildTarget"] = "windows-x64", ["sourceSnapshotStatus"] = "Frozen",
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
                db.Execute("INSERT INTO runtime_snapshots VALUES(?,?,?,?)", snapshot, "2026-09-08T15:59:59Z", "{\"C\":101,\"A\":0,\"R\":0,\"U\":101,\"G\":1,\"V\":0,\"scope_reviewed\":false}", 1);
                db.Execute("INSERT INTO runtime_profiles VALUES(?,?,?)", snapshot, "system-stud-v1", "{\"compatibleWith\":[\"system-tube-v1\"],\"degreesOfFreedom\":[\"explicit-fixture-freedom\"]}");
                db.Execute("INSERT INTO runtime_profiles VALUES(?,?,?)", snapshot, "system-tube-v1", "{\"compatibleWith\":[\"system-stud-v1\"],\"degreesOfFreedom\":[\"explicit-fixture-freedom\"]}");
                foreach (var file in manifest["files"])
                    db.Execute("INSERT INTO runtime_files VALUES(?,?,?,?)", (string)file["storageKey"], (string)file["sha256"],
                        (long)file["byteLength"], (string)file["kind"]);
                for (int i = 0; i < 101; i++)
                {
                    var v = i == 0 ? variant : Guid.NewGuid().ToString();
                    var r = i == 0 ? revision : Guid.NewGuid().ToString();
                    var b = Guid.NewGuid().ToString();
                    db.Execute("INSERT INTO runtime_revisions VALUES(?,?)", v, r);
                    db.Execute("INSERT INTO runtime_variants VALUES(?,?,?,?,?,?,?,?)", snapshot, v, Guid.NewGuid().ToString(), "Unknown",
                        i == 2 ? "Special" : "Basic", JsonConvert.SerializeObject(new { name = i == 0 ? "中文'100%_積木" : "磚 " + i,
                            family = "System", partNumber = i == 0 ? "3001" : "part" + i }),
                        "{\"creationEligible\":true,\"bucketEligible\":true,\"buildSystems\":[\"System\"],\"characterSlots\":[\"Head\"]}", r);
                    db.Execute("INSERT INTO runtime_builds VALUES(?,?,?,?,?,?,?,?,?,?)", b, v, r, "windows-x64", "6000.3.18f1",
                        "lock", "canonical-rh-to-unity-lh-v1", "content", "validation", "models.bundle");
                    db.Execute("INSERT INTO runtime_models VALUES(?,?,?,?,?,?,?)", snapshot, v, r, "windows-x64", b,
                        "{\"bounds\":[0.032,0.0096,0.016],\"vehicleMetadata\":null}", "model/" + v);
                }
            }
            WriteManifest();
        }

        private void AddFile(string key, string kind, byte[] bytes)
        {
            File.WriteAllBytes(Path.Combine(root, key), bytes);
            ((JArray)manifest["files"]).Add(new JObject { ["storageKey"] = key, ["kind"] = kind,
                ["sha256"] = SafeContent.Hash(bytes), ["byteLength"] = bytes.LongLength });
        }

        [Test, Property("TDD", "IT-024")]
        public async Task Resolve_MixedReferenceTuple_RejectsModelAndPreservesHistoricalRevision()
        {
            string oldSnapshot = Guid.NewGuid().ToString(), oldRevision = Guid.NewGuid().ToString(), oldBuild = Guid.NewGuid().ToString();
            using (var db = new NativeSqlite(Path.Combine(root, "catalog.db"), false))
            {
                db.Execute("INSERT INTO runtime_snapshots SELECT ?,baseline_at,coverage_json,schema_version FROM runtime_snapshots WHERE snapshot_id=?", oldSnapshot, snapshot);
                db.Execute("INSERT INTO runtime_revisions VALUES(?,?)", variant, oldRevision);
                db.Execute("INSERT INTO runtime_variants SELECT ?,variant_id,part_id,'Retired',tier,display_json,usage_json,? FROM runtime_variants WHERE variant_id=?", oldSnapshot, oldRevision, variant);
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
            var catalog = new BrickCatalog(root, PackageKind.Preview);
            var opened = await catalog.OpenAsync(CancellationToken.None);
            Assert.That(opened.IsSuccess, Is.True, opened.Error?.Message);
            using (var session = opened.Value)
            {
                var ids = new System.Collections.Generic.List<Guid>();
                string cursor = null;
                do
                {
                    var page = await catalog.QueryAsync(session, new VariantQuery { Cursor = cursor }, CancellationToken.None);
                    Assert.That(page.IsSuccess, Is.True);
                    ids.AddRange(page.Value.Items.Select(x => x.VariantId));
                    cursor = page.Value.NextCursor;
                } while (cursor != null);
                Assert.That(ids.Count, Is.EqualTo(101));
                Assert.That(ids.Distinct().Count(), Is.EqualTo(101));
                Assert.That(ids.Select(x => x.ToString()), Is.Ordered.Using<string>(StringComparer.Ordinal));
                var detail = await catalog.GetVariantAsync(session, Guid.Parse(variant), CancellationToken.None);
                Assert.That(detail.Value.Name, Is.EqualTo("中文'100%_積木"));
                Assert.That(detail.Value.Model.RevisionId, Is.EqualTo(Guid.Parse(revision)));
                Assert.That((await catalog.GetCoverageAsync(session, CancellationToken.None)).Value.U, Is.EqualTo(101));
                var profiles = (await catalog.GetProfilesAsync(session, CancellationToken.None)).Value.Definitions;
                Assert.That(profiles.Keys, Is.EquivalentTo(new[] { "system-stud-v1", "system-tube-v1" }));
                var stud = JObject.Parse(profiles["system-stud-v1"]);
                var tube = JObject.Parse(profiles["system-tube-v1"]);
                Assert.That((string)stud["compatibleWith"][0], Is.EqualTo("system-tube-v1"));
                Assert.That((string)tube["compatibleWith"][0], Is.EqualTo("system-stud-v1"));
                Assert.That(stud["degreesOfFreedom"].Values<string>(), Is.Not.Empty);
                Assert.That(tube["degreesOfFreedom"].Values<string>(), Is.Not.Empty);
                Assert.That(File.Exists(Path.Combine(root, "catalog.db-wal")), Is.False);
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
