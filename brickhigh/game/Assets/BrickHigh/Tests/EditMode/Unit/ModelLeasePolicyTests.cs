#if UNITY_EDITOR
using System;
using System.Collections;
using System.Threading.Tasks;
using BrickHigh.UnityRuntime;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.AddressableAssets;
using UnityEngine.TestTools;
using Property = NUnit.Framework.PropertyAttribute;

namespace BrickHigh.Tests
{
    public class ModelLeasePolicyTests
    {
        private GameObject prefab;
        [SetUp] public void SetUp() { prefab = new GameObject("Lease unit fixture"); }
        [TearDown] public void TearDown() { UnityEngine.Object.DestroyImmediate(prefab); }

        [Test, Property("TDD", "UT-094")]
        public void ModelLeasePolicy_DoubleDispose_ReleasesOnce()
        {
            var first = Addressables.ResourceManager.CreateCompletedOperation(prefab, (string)null);
            var second = Addressables.ResourceManager.Acquire(first);
            var a = new ModelLease(first);
            var b = new ModelLease(second);
            a.Dispose(); a.Dispose();
            Assert.That(second.IsValid(), Is.True);
            Assert.That(b.Prefab, Is.SameAs(prefab));
            Assert.Throws<ObjectDisposedException>(() => { var unused = a.Prefab; });
            b.Dispose(); b.Dispose();
            Assert.That(first.IsValid(), Is.False);
        }

        [Test, Property("TDD", "UT-095")]
        public void ModelLeasePolicy_SharedActiveHandle_RemainsAlive()
        {
            var acquired = Addressables.ResourceManager.CreateCompletedOperation(prefab, (string)null);
            var pending = Addressables.ResourceManager.Acquire(acquired);
            using (var visible = new ModelLease(acquired))
            {
                // 取消邊界丟棄的是另一份引用，不是仍使用中的 lease。
                new ModelLease(pending).Dispose();
                Assert.That(visible.Prefab, Is.SameAs(prefab));
                Assert.That(acquired.IsValid(), Is.True);
            }
            Assert.That(acquired.IsValid(), Is.False);
        }

        [UnityTest, Property("TDD", "UT-096")]
        public IEnumerator ModelLeasePolicy_UnityOperation_RequiresMainThread()
        {
            var acquired = Addressables.ResourceManager.CreateCompletedOperation(prefab, (string)null);
            var lease = new ModelLease(acquired);
            var task = Task.Run(() =>
            {
                Assert.Throws<InvalidOperationException>(() => { var unused = lease.Prefab; });
                lease.Dispose(); lease.Dispose();
            });
            while (!task.IsCompleted) yield return null;
            task.GetAwaiter().GetResult();
            // 主執行緒排程是非同步契約，不假設恰好下一個 Test Runner tick 就執行。
            var deadline = DateTime.UtcNow.AddSeconds(5);
            while (acquired.IsValid() && DateTime.UtcNow < deadline) yield return null;
            Assert.That(acquired.IsValid(), Is.False);
        }
    }
}
#endif
