using System;
using System.IO;
using BrickHigh.Domain;
using BrickHigh.Infrastructure;
using Newtonsoft.Json.Linq;
using NUnit.Framework;

namespace BrickHigh.Tests
{
    public class PlayerStartupPolicyTests
    {
        private string root;
        private string player;
        [SetUp] public void SetUp()
        {
            root = Path.Combine(Path.GetTempPath(), "brickhigh-startup-" + Guid.NewGuid().ToString("N"));
            Directory.CreateDirectory(Path.Combine(root, "Player"));
            player = Path.Combine(root, "Player/BrickHighPreview.exe");
            File.WriteAllText(player, "F-Catalog executable fixture");
            WriteManifest("build-a", "com.gamenenstyle.brickhigh.preview", "Player/BrickHighPreview.exe");
        }
        [TearDown] public void TearDown() { Directory.Delete(root, true); }
        private void WriteManifest(string build, string app, string key) => File.WriteAllText(Path.Combine(root, "installation.json"),
            new JObject { ["buildId"] = build, ["applicationId"] = app, ["packageKind"] = "Preview", ["playerKey"] = key,
                ["playerSha256"] = SafeContent.Hash(File.ReadAllBytes(player)) }.ToString());

        [Test] public void ValidateInstallation_ExactCompiledIdentity_AllowsHandshake()
        { Assert.That(PlayerStartupPolicy.ValidateInstallation(root, player, "build-a", PackageKind.Preview), Is.True); }

        [TestCase("build-b", "com.gamenenstyle.brickhigh.preview", "Player/BrickHighPreview.exe")]
        [TestCase("build-a", "com.gamenenstyle.brickhigh", "Player/BrickHighPreview.exe")]
        [TestCase("build-a", "com.gamenenstyle.brickhigh.preview", "../BrickHighPreview.exe")]
        public void ValidateInstallation_MixedBuildIdentityOrPath_Rejects(string build, string app, string key)
        {
            WriteManifest(build, app, key);
            Assert.That(PlayerStartupPolicy.ValidateInstallation(root, player, "build-a", PackageKind.Preview), Is.False);
        }

        [Test] public void ValidateInstallation_ReplacedExecutableOrMissingRoot_Rejects()
        {
            File.WriteAllText(player, "different executable bytes");
            Assert.That(PlayerStartupPolicy.ValidateInstallation(root, player, "build-a", PackageKind.Preview), Is.False);
            Assert.That(PlayerStartupPolicy.ValidateInstallation(null, player, "build-a", PackageKind.Preview), Is.False);
            Assert.That(PlayerStartupPolicy.ValidateInstallation(root, player + ".other", "build-a", PackageKind.Preview), Is.False);
        }
    }
}
