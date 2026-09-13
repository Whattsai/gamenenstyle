using System;
using System.Runtime.CompilerServices;
using System.Threading;
using System.Threading.Tasks;
using UnityEngine;
using UnityEngine.AddressableAssets;
using UnityEngine.ResourceManagement.AsyncOperations;

[assembly: InternalsVisibleTo("BrickHigh.Tests.EditMode")]

namespace BrickHigh.UnityRuntime
{
    /// <summary>持有一份 Addressables 引用；不銷毀其他使用者共用的 mesh 或材質。</summary>
    public sealed class ModelLease : IDisposable
    {
        private readonly AsyncOperationHandle<GameObject> handle;
        private int released;
        private readonly Action onReleased;
        internal ModelLease(AsyncOperationHandle<GameObject> handle, Action onReleased = null)
        {
            UnityThread.RequireMain();
            if (!handle.IsValid() || handle.Status != AsyncOperationStatus.Succeeded || handle.Result == null)
                throw new ArgumentException("只能移交已成功的模型引用。", nameof(handle));
            this.handle = handle;
            this.onReleased = onReleased;
        }
        /// <summary>唯讀共用 Prefab；呼叫端只建立自己的 instance，不直接銷毀此資產。</summary>
        public GameObject Prefab
        {
            get
            {
                UnityThread.RequireMain();
                if (Volatile.Read(ref released) != 0) throw new ObjectDisposedException(nameof(ModelLease));
                return handle.Result;
            }
        }
        /// <summary>可從背景要求釋放；真正的 Addressables 操作排回 Unity 主執行緒。</summary>
        public void Dispose()
        {
            if (Interlocked.Exchange(ref released, 1) == 0)
                UnityThread.Post(() => { try { Addressables.Release(handle); } finally { onReleased?.Invoke(); } });
        }
    }

    internal static class UnityThread
    {
        private static int threadId;
        private static SynchronizationContext context;
        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
        private static void Capture()
        {
            context = SynchronizationContext.Current ?? throw new InvalidOperationException("Unity 主執行緒尚未初始化。");
            threadId = Thread.CurrentThread.ManagedThreadId;
        }
#if UNITY_EDITOR
        [UnityEditor.InitializeOnLoadMethod]
        private static void CaptureEditor() => Capture();
#endif
        internal static void RequireMain()
        {
            if (threadId == 0 || Thread.CurrentThread.ManagedThreadId != threadId)
                throw new InvalidOperationException("Unity 物件只能在主執行緒操作。");
        }
        internal static void Post(Action action)
        {
            if (Thread.CurrentThread.ManagedThreadId == threadId) action();
            else context.Post(_ => action(), null);
        }
        internal static Task<T> InvokeAsync<T>(Func<Task<T>> action)
        {
            var result = new TaskCompletionSource<T>(TaskCreationOptions.RunContinuationsAsynchronously);
            Post(async () =>
            {
                try { result.TrySetResult(await action()); }
                catch (Exception error) { result.TrySetException(error); }
            });
            return result.Task;
        }
    }
}
