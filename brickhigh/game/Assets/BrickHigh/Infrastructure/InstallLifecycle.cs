using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading;
using BrickHigh.Domain;

namespace BrickHigh.Infrastructure
{
    /// <summary>穩定的產品身分；展示文字變更不改動既有資料根。</summary>
    public sealed class InstallIdentity
    {
        /// <summary>固定的本機公司名稱。</summary>
        public const string Company = "GameNenStyle";
        /// <summary>固定產品名稱。</summary>
        public string Product { get; }
        /// <summary>固定應用識別。</summary>
        public string ApplicationId { get; }
        private InstallIdentity(string product, string id) { Product = product; ApplicationId = id; }
        /// <summary>只接受編譯時選定的 Preview 或 Release。</summary>
        public static InstallIdentity For(PackageKind kind)
        {
            if (kind == PackageKind.Preview) return new InstallIdentity("BrickHighPreview", "com.gamenenstyle.brickhigh.preview");
            if (kind == PackageKind.Release) return new InstallIdentity("BrickHigh", "com.gamenenstyle.brickhigh");
            throw new ArgumentOutOfRangeException(nameof(kind));
        }
        /// <summary>從明確的 LocalLow 根推導資料根；本方法不建立或讀取 profile。</summary>
        public string DataRoot(string localLowRoot) => Path.Combine(localLowRoot, Company, Product);
    }

    /// <summary>啟動器與更新器共用的 Windows 生命週期鎖，持有者必須涵蓋整個操作。</summary>
    public sealed class InstallLifecycle : IDisposable
    {
        private static readonly HashSet<string> Held = new HashSet<string>(StringComparer.Ordinal);
        private static readonly object Gate = new object();
        private readonly Mutex mutex;
        private readonly string name;
        private readonly int ownerThread;
        private bool disposed;
        private InstallLifecycle(Mutex mutex, string name)
        { this.mutex = mutex; this.name = name; ownerThread = Thread.CurrentThread.ManagedThreadId; }

        /// <summary>相同應用與正規安裝路徑共用鎖；拒絕相對路徑和重新解析節點。</summary>
        public static string LockName(InstallIdentity identity, string installRoot)
        {
            if (identity == null || string.IsNullOrWhiteSpace(installRoot) || !Path.IsPathRooted(installRoot))
                throw new ArgumentException("安裝位置必須是明確的絕對路徑。");
            string resolved = Path.GetDirectoryName(SafeContent.Resolve(installRoot, ".lifecycle-probe"));
            string canonical = resolved.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar).ToUpperInvariant();
            return "Local\\BrickHigh-Life-" + SafeContent.Hash(Encoding.UTF8.GetBytes(identity.ApplicationId + "\n" + canonical));
        }

        /// <summary>立即取得鎖或回 null；權限錯誤向上回報，不退回直接覆寫。</summary>
        public static InstallLifecycle TryAcquire(InstallIdentity identity, string installRoot)
        {
            string name = LockName(identity, installRoot);
            lock (Gate)
            {
                if (Held.Contains(name)) return null;
                var mutex = new Mutex(false, name);
                bool acquired;
                try { acquired = mutex.WaitOne(0); }
                catch (AbandonedMutexException) { acquired = true; }
                catch { mutex.Dispose(); throw; }
                if (!acquired) { mutex.Dispose(); return null; }
                Held.Add(name);
                return new InstallLifecycle(mutex, name);
            }
        }

        /// <summary>於取得鎖的執行緒釋放；可重複呼叫，不提早結束另一持有者。</summary>
        public void Dispose()
        {
            lock (Gate)
            {
                if (disposed) return;
                if (Thread.CurrentThread.ManagedThreadId != ownerThread)
                    throw new InvalidOperationException("生命週期鎖必須由原執行緒釋放。");
                mutex.ReleaseMutex(); mutex.Dispose(); Held.Remove(name); disposed = true;
            }
        }
    }

    /// <summary>啟動器可以辨識的失敗種類；未知原因不可歸因為圖形裝置。</summary>
    public enum StartupFailure { Unknown, GraphicsUnsupported, MissingPlayer, Busy, StorageUnavailable, UncontrolledLaunch }

    /// <summary>不依賴 Unity 圖形的穩定通知文案。</summary>
    public static class StartupNotice
    {
        /// <summary>依已確認的失敗原因提供玩家可採取的修復方法。</summary>
        public static string Message(StartupFailure failure)
        {
            switch (failure)
            {
                case StartupFailure.GraphicsUnsupported: return "目前圖形裝置不支援本遊戲，請檢查顯示驅動與系統需求。";
                case StartupFailure.MissingPlayer: return "必要執行檔不完整，請使用完整安裝包修復。";
                case StartupFailure.Busy: return "遊戲或更新程序正在執行，請關閉後再試。";
                case StartupFailure.StorageUnavailable: return "無法寫入本機資料，請檢查權限與可用空間。";
                case StartupFailure.UncontrolledLaunch: return "請使用安裝捷徑啟動遊戲。";
                default: return "遊戲未能完成啟動，請檢查安裝檔與顯示驅動。";
            }
        }
    }
}
