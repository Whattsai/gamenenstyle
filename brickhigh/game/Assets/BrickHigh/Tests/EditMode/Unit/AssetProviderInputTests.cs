#if UNITY_EDITOR
using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using BrickHigh.Domain;
using BrickHigh.Infrastructure;
using BrickHigh.UnityRuntime;
using NUnit.Framework;

namespace BrickHigh.Tests
{
    public class AssetProviderInputTests
    {
        [Test, Property("TDD", "UT-156")]
        public async Task AcquireAsync_PreCancelled_AllocatesNoHandleOrIo()
        {
            var missing = Path.Combine(Path.GetTempPath(), "absent-probe-" + Guid.NewGuid().ToString("N"));
            using (var provider = new BrickAssetProvider(new BrickCatalog(missing, PackageKind.Preview), null))
            {
                var result = await provider.AcquireAsync(null, new CancellationToken(true));
                Assert.That(result.Error.Code, Is.EqualTo(CatalogErrorCode.Cancelled));
                Assert.That(provider.BundleReadCount, Is.Zero);
                Assert.That(provider.AllocatedHandleCount, Is.Zero);
                Assert.That(Directory.Exists(missing), Is.False);
            }
        }

        [Test, Property("TDD", "CT-006")]
        public async Task AcquireAsync_InvalidModelOrSession_FailsBeforeIo()
        {
            var missing = Path.Combine(Path.GetTempPath(), "absent-probe-" + Guid.NewGuid().ToString("N"));
            using (var provider = new BrickAssetProvider(new BrickCatalog(missing, PackageKind.Preview), null))
            {
                foreach (var model in new[] { null, new ModelReference(Guid.Empty, Guid.NewGuid(), Guid.NewGuid()),
                    new ModelReference(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid()) })
                    Assert.That((await provider.AcquireAsync(model, CancellationToken.None)).Error.Code, Is.EqualTo(CatalogErrorCode.InvalidQuery));
                Assert.That(provider.BundleReadCount, Is.Zero);
                Assert.That(provider.AllocatedHandleCount, Is.Zero);
            }
        }
    }
}
#endif
