using System;
using System.IO;
using System.Threading.Tasks;
using BrickHigh.Domain;
using BrickHigh.Infrastructure;
using NUnit.Framework;

namespace BrickHigh.Tests
{
    public class InstallLifecyclePolicyTests
    {
        private string root;
        [SetUp] public void Setup() { root = Path.Combine(Path.GetTempPath(), "BrickHigh-life-" + Guid.NewGuid().ToString("N")); Directory.CreateDirectory(root); }
        [TearDown] public void Teardown() { Directory.Delete(root, true); }

        [Test]
        public void InstallLifecyclePolicy_ProductIdentity_PreservesRoots()
        {
            Assert.That(InstallIdentity.Company, Is.EqualTo("GameNenStyle"));
            var release = InstallIdentity.For(PackageKind.Release);
            var preview = InstallIdentity.For(PackageKind.Preview);
            Assert.That(release.Product, Is.EqualTo("BrickHigh"));
            Assert.That(preview.Product, Is.EqualTo("BrickHighPreview"));
            Assert.That(release.ApplicationId, Is.EqualTo("com.gamenenstyle.brickhigh"));
            Assert.That(preview.ApplicationId, Is.EqualTo("com.gamenenstyle.brickhigh.preview"));
            Assert.That(release.DataRoot(root), Is.EqualTo(Path.Combine(root, "GameNenStyle", "BrickHigh")));
            Assert.That(preview.DataRoot(root), Is.Not.EqualTo(release.DataRoot(root)));
        }

        [Test]
        public void InstallLifecyclePolicy_CanonicalRoot_UsesSameLock()
        {
            var identity = InstallIdentity.For(PackageKind.Preview);
            string name = InstallLifecycle.LockName(identity, root);
            Assert.That(InstallLifecycle.LockName(identity, Path.Combine(root, ".") + Path.DirectorySeparatorChar), Is.EqualTo(name));
            Assert.That(InstallLifecycle.LockName(identity, root.ToUpperInvariant()), Is.EqualTo(name));
            Assert.That(InstallLifecycle.LockName(InstallIdentity.For(PackageKind.Release), root), Is.Not.EqualTo(name));
            Assert.That(InstallLifecycle.LockName(identity, root + "-other"), Is.Not.EqualTo(name));
        }

        [Test]
        public void InstallLifecyclePolicy_ConcurrentOwner_RejectsUntilReleased()
        {
            var identity = InstallIdentity.For(PackageKind.Preview);
            using (var held = InstallLifecycle.TryAcquire(identity, root))
            {
                Assert.That(held, Is.Not.Null);
                Assert.That(Task.Run(() => { using (var other = InstallLifecycle.TryAcquire(identity, root)) return other == null; }).Result, Is.True);
                Assert.That(InstallLifecycle.TryAcquire(identity, root), Is.Null, "同執行緒也不可遞迴開啟第二 Player");
                held.Dispose(); held.Dispose();
            }
            using (var again = InstallLifecycle.TryAcquire(identity, root)) Assert.That(again, Is.Not.Null);
        }

        [Test]
        public void InstallLifecyclePolicy_InvalidRoot_FailsWithoutCreatingProfiles()
        {
            Assert.Throws<ArgumentOutOfRangeException>(() => InstallIdentity.For((PackageKind)42));
            Assert.Throws<ArgumentException>(() => InstallLifecycle.LockName(InstallIdentity.For(PackageKind.Preview), "relative"));
            Assert.That(Directory.GetFileSystemEntries(root), Is.Empty);
        }

        [Test]
        public void StartupNotice_UnknownFailure_DoesNotInventGraphicsCause()
        {
            Assert.That(StartupNotice.Message(StartupFailure.GraphicsUnsupported), Is.EqualTo("目前圖形裝置不支援本遊戲，請檢查顯示驅動與系統需求。"));
            Assert.That(StartupNotice.Message(StartupFailure.Unknown), Is.EqualTo("遊戲未能完成啟動，請檢查安裝檔與顯示驅動。"));
            Assert.That(StartupNotice.Message(StartupFailure.Busy), Is.EqualTo("遊戲或更新程序正在執行，請關閉後再試。"));
            Assert.That(StartupNotice.Message(StartupFailure.MissingPlayer), Is.EqualTo("必要執行檔不完整，請使用完整安裝包修復。"));
        }
    }
}
