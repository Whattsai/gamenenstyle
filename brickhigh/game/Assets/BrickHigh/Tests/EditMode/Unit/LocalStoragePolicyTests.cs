using System;
using System.IO;
using System.Linq;
using BrickHigh.Domain;
using BrickHigh.Infrastructure;
using Newtonsoft.Json.Linq;
using NUnit.Framework;

namespace BrickHigh.Tests
{
    public class LocalStoragePolicyTests
    {
        private string root;
        private string installRoot;
        private string localLowRoot;

        [SetUp]
        public void SetUp()
        {
            root = Path.Combine(Path.GetTempPath(), "BrickHigh-storage-" + Guid.NewGuid().ToString("N"));
            installRoot = Path.Combine(root, "source-workspace", "Player");
            localLowRoot = Path.Combine(root, "user", "LocalLow");
            Directory.CreateDirectory(installRoot);
            Directory.CreateDirectory(localLowRoot);
        }

        [TearDown]
        public void TearDown()
        {
            if (Directory.Exists(root)) Directory.Delete(root, true);
        }

        [Test, Property("TDD", "UT-047")]
        public void LocalStoragePolicy_WritableData_UsesUserRoot()
        {
            var paths = LocalStoragePolicy.Resolve(installRoot, localLowRoot, PackageKind.Preview);

            string expected = Path.Combine(localLowRoot, InstallIdentity.Company, "BrickHighPreview");
            Assert.That(paths.Root, Is.EqualTo(Path.GetFullPath(expected).TrimEnd(Path.DirectorySeparatorChar)));
            Assert.That(paths.ProfilesRoot, Is.EqualTo(Path.Combine(paths.Root, "Profiles")));
            Assert.That(paths.DiagnosticsRoot, Is.EqualTo(Path.Combine(paths.Root, "Diagnostics")));
            Assert.That(paths.Root.StartsWith(Path.GetFullPath(installRoot) + Path.DirectorySeparatorChar,
                StringComparison.OrdinalIgnoreCase), Is.False);

            string profile = LocalStoragePolicy.ProfileFile(paths, "profile.db");
            Directory.CreateDirectory(paths.ProfilesRoot);
            File.WriteAllText(profile, "profile-fixture");
            LocalStoragePolicy.WriteStartupDiagnostic(paths, StartupFailure.Unknown,
                new DateTime(2026, 10, 10, 0, 0, 0, DateTimeKind.Utc), new string('a', 32));

            Assert.That(File.Exists(profile), Is.True);
            Assert.That(Directory.GetFiles(installRoot, "*", SearchOption.AllDirectories), Is.Empty);
            Assert.Throws<InvalidOperationException>(() =>
                LocalStoragePolicy.Resolve(installRoot, installRoot, PackageKind.Preview));
            Assert.Throws<InvalidDataException>(() => LocalStoragePolicy.ProfileFile(paths, "../escape.db"));
            Assert.Throws<InvalidDataException>(() => LocalStoragePolicy.ProfileFile(paths, "nested/profile.db"));
        }

        [Test, Property("TDD", "UT-048")]
        public void LocalStoragePolicy_DiagnosticRecord_RedactsSecrets()
        {
            var paths = LocalStoragePolicy.Resolve(installRoot, localLowRoot, PackageKind.Release);
            string secret = "launch-token-should-never-appear";
            string fullSave = "{playerInventory:[all-private-save-content]}";
            File.WriteAllText(Path.Combine(installRoot, "secret.txt"), secret);
            File.WriteAllText(Path.Combine(installRoot, "save.fixture"), fullSave);

            string path = LocalStoragePolicy.WriteStartupDiagnostic(paths, StartupFailure.StorageUnavailable,
                new DateTime(2026, 10, 10, 1, 2, 3, DateTimeKind.Utc), new string('b', 32));
            string json = File.ReadAllText(path);
            var record = JObject.Parse(json);

            Assert.That(record.Properties().Select(x => x.Name), Is.EquivalentTo(new[] { "diagnosticId", "failure", "time" }));
            Assert.That((string)record["diagnosticId"], Is.EqualTo(new string('b', 32)));
            Assert.That((string)record["failure"], Is.EqualTo("StorageUnavailable"));
            Assert.That(json, Does.Not.Contain(secret));
            Assert.That(json, Does.Not.Contain(fullSave));
            Assert.That(json, Does.Not.Contain("token"));
            Assert.That(json, Does.Not.Contain("inventory"));
            Assert.That(LocalStoragePolicy.AutomaticDiagnosticUploadEnabled, Is.False);
            Assert.That(Directory.GetFiles(paths.Root, "*", SearchOption.AllDirectories), Is.EquivalentTo(new[] { path }));

            Assert.Throws<ArgumentException>(() =>
                LocalStoragePolicy.WriteStartupDiagnostic(paths, StartupFailure.Unknown, DateTime.Now, new string('c', 32)));
            Assert.Throws<ArgumentException>(() =>
                LocalStoragePolicy.WriteStartupDiagnostic(paths, StartupFailure.Unknown, DateTime.UtcNow, "../escape"));
        }
    }
}
