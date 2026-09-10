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

namespace BrickHigh.Tests
{
    public class ReadContractTests
    {
        private string root;
        private string snapshot;
        private string variant;
        private string revision;
        private JObject manifest;

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
                ["files"] = new JArray()
            };
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
                db.Execute("INSERT INTO runtime_profiles VALUES(?,?,?)", snapshot, "System-v1", "{\"pairs\":[[\"stud\",\"tube\"]]}");
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
                Assert.That((await catalog.GetProfilesAsync(session, CancellationToken.None)).Value.Definitions["System-v1"], Does.Contain("stud"));
                Assert.That(File.Exists(Path.Combine(root, "catalog.db-wal")), Is.False);
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
