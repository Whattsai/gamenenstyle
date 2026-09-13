using System;
using BrickHigh.Application;
using BrickHigh.Domain;
using NUnit.Framework;

namespace BrickHigh.Tests
{
    public class SelectionRequestPolicyTests
    {
        private sealed class Resource : IDisposable
        {
            public int Releases;
            public void Dispose() { Releases++; }
        }

        [Test, Property("TDD", "UT-115")]
        public void SelectionRequestPolicy_LateResult_DoesNotOverrideSelection()
        {
            using (var policy = new SelectionRequestPolicy<Resource>())
            {
                var a = policy.Begin("A");
                var b = policy.Begin("B");
                var first = new Resource(); var second = new Resource();
                Assert.That(policy.Complete(b, CatalogResult<Resource>.Success(second)), Is.True);
                Assert.That(policy.Complete(a, CatalogResult<Resource>.Success(first)), Is.False);
                Assert.That(policy.SelectedKey, Is.EqualTo("B"));
                Assert.That(policy.Current.Value, Is.SameAs(second));
                Assert.That(second.Releases, Is.Zero);
            }
        }

        [Test, Property("TDD", "UT-116")]
        public void SelectionRequestPolicy_DiscardedResult_ReleasesHandle()
        {
            var policy = new SelectionRequestPolicy<Resource>();
            var a = policy.Begin("A");
            var b = policy.Begin("B");
            var first = new Resource(); var second = new Resource();
            Assert.That(a.CancellationToken.IsCancellationRequested, Is.True);
            policy.Complete(a, CatalogResult<Resource>.Success(first));
            policy.Dispose(); policy.Dispose();
            policy.Complete(b, CatalogResult<Resource>.Success(second));
            Assert.That(first.Releases, Is.EqualTo(1));
            Assert.That(second.Releases, Is.EqualTo(1));
            Assert.That(policy.Current, Is.Null);
            Assert.Throws<ObjectDisposedException>(() => policy.Begin("C"));
        }

        [Test, Property("TDD", "UT-117")]
        public void SelectionRequestPolicy_RequestVersion_KeepsLoadingAccurate()
        {
            using (var policy = new SelectionRequestPolicy<Resource>())
            {
                var a = policy.Begin("A");
                var b = policy.Begin("B");
                policy.Complete(a, CatalogResult<Resource>.Failure(CatalogErrorCode.AssetMissing));
                Assert.That(policy.IsLoading, Is.True);
                Assert.That(policy.Current, Is.Null);
                policy.Complete(b, CatalogResult<Resource>.Failure(CatalogErrorCode.StorageUnavailable));
                Assert.That(policy.IsLoading, Is.False);
                Assert.That(policy.Current.Error.Code, Is.EqualTo(CatalogErrorCode.StorageUnavailable));
                var c = policy.Begin("C");
                Assert.That(policy.IsLoading, Is.True);
                Assert.That(policy.Current, Is.Null);
                policy.Complete(c, CatalogResult<Resource>.Success(new Resource()));
                Assert.That(policy.IsLoading, Is.False);
            }
        }
    }
}
