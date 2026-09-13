using BrickHigh.Application;
using BrickHigh.Domain;
using NUnit.Framework;

namespace BrickHigh.Tests
{
    public class RetryRequestPolicyTests
    {
        [Test, Property("TDD", "UT-118")]
        public void RetryRequestPolicy_PendingRetry_DisablesButton()
        {
            var policy = new RetryRequestPolicy();
            policy.SetFailure(CatalogErrorCode.StorageUnavailable);
            Assert.That(policy.CanRetry, Is.True);
            Assert.That(policy.TryBegin(), Is.Not.Null);
            Assert.That(policy.CanRetry, Is.False);
            Assert.That(policy.ButtonText, Is.EqualTo("重試中…"));
        }

        [Test, Property("TDD", "UT-119")]
        public void RetryRequestPolicy_DuplicateRetry_StartsOneRequest()
        {
            var policy = new RetryRequestPolicy();
            policy.SetFailure(CatalogErrorCode.StorageUnavailable);
            var old = policy.TryBegin();
            Assert.That(policy.TryBegin(), Is.Null);
            policy.Reset(); // 換件不受重試鎖阻擋。
            policy.SetFailure(CatalogErrorCode.StorageUnavailable);
            var current = policy.TryBegin();
            Assert.That(current, Is.Not.Null);
            Assert.That(policy.Complete(old, null), Is.False);
            Assert.That(policy.IsPending, Is.True);
            Assert.That(policy.Complete(current, null), Is.True);
        }

        [Test, Property("TDD", "UT-120")]
        public void RetryRequestPolicy_RetryCompletion_RestoresAction()
        {
            var policy = new RetryRequestPolicy();
            policy.SetFailure(CatalogErrorCode.StorageUnavailable);
            Assert.That(policy.Complete(policy.TryBegin(), CatalogErrorCode.StorageUnavailable), Is.True);
            Assert.That(policy.CanRetry, Is.True);
            Assert.That(policy.ButtonText, Is.EqualTo("重試"));
            Assert.That(policy.Complete(policy.TryBegin(), CatalogErrorCode.AssetMissing), Is.True);
            Assert.That(policy.CanRetry, Is.False);
            Assert.That(policy.TryBegin(), Is.Null);
            Assert.That(policy.IsPending, Is.False);
            policy.SetFailure(CatalogErrorCode.StorageUnavailable);
            Assert.That(policy.Complete(policy.TryBegin(), null), Is.True);
            Assert.That(policy.CanRetry, Is.False);
        }
    }
}
