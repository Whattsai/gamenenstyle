using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using BrickHigh.Domain;
using BrickHigh.Infrastructure;
using UnityEngine;
using UnityEngine.AddressableAssets;
using UnityEngine.AddressableAssets.ResourceLocators;
using UnityEngine.ResourceManagement.AsyncOperations;
using UnityEngine.ResourceManagement.ResourceLocations;
using UnityEngine.ResourceManagement.ResourceProviders;

namespace BrickHigh.UnityRuntime
{
    /// <summary>固定目錄 session 的原生模型取得介面。</summary>
    public interface IBrickAssetProvider
    {
        /// <summary>完整引用驗證後取得一份可獨立釋放的模型租約。</summary>
        Task<CatalogResult<ModelLease>> AcquireAsync(ModelReference model, CancellationToken cancellationToken = default);
    }

    /// <summary>使用私有 locator 與已驗證的 bundle bytes，不以全域 address 搜尋替代固定引用。</summary>
    public sealed class BrickAssetProvider : IBrickAssetProvider, IDisposable
    {
        private readonly BrickCatalog catalog;
        private readonly CatalogSession session;
        private readonly VerifiedBundleProvider bundles = new VerifiedBundleProvider();
        private readonly string suffix = "-brickhigh-" + Guid.NewGuid().ToString("N");
        private Task<IResourceLocator> initialization;
        private AsyncOperationHandle<IResourceLocator> catalogHandle;
        private IResourceLocator locator;
        private RuntimeFile[] files;
        private int disposed, activeLeases, allocatedHandles, inFlight;
        private bool registered;

        /// <summary>建構不開檔、不配置 Addressables handle；session 由呼叫端管理。</summary>
        public BrickAssetProvider(BrickCatalog catalog, CatalogSession session)
        { this.catalog = catalog ?? throw new ArgumentNullException(nameof(catalog)); this.session = session; }

        internal int BundleReadCount => bundles.ReadCount;
        internal int AllocatedHandleCount => Volatile.Read(ref allocatedHandles);
        internal int ActiveLeaseCount => Volatile.Read(ref activeLeases);
        internal int LoadedBundleCount => bundles.LoadedCount;
        // 內部診斷觀察點讓原生探針在確定取得 handle 後測試取消競態，不替換資產或載入結果。
        internal event Action HandleAllocated;

        /// <inheritdoc/>
        public async Task<CatalogResult<ModelLease>> AcquireAsync(ModelReference model, CancellationToken cancellationToken = default)
        {
            if (cancellationToken.IsCancellationRequested) return Failure(CatalogErrorCode.Cancelled);
            if (model == null || !model.IsValid || session == null || session.IsDisposed || Volatile.Read(ref disposed) != 0)
                return Failure(CatalogErrorCode.InvalidQuery);
            var resolved = await catalog.ResolveModelAsync(session, model, cancellationToken).ConfigureAwait(false);
            if (!resolved.IsSuccess) return Failure(resolved.Error.Code);
            var index = await catalog.GetRuntimeFilesAsync(session, cancellationToken).ConfigureAwait(false);
            if (!index.IsSuccess) return Failure(index.Error.Code);
            return await UnityThread.InvokeAsync(async () =>
            {
                if (cancellationToken.IsCancellationRequested || Volatile.Read(ref disposed) != 0) return Failure(CatalogErrorCode.Cancelled);
                AsyncOperationHandle<GameObject> handle = default;
                bool transferred = false;
                inFlight++;
                try
                {
                    files = index.Value;
                    if (initialization == null) initialization = InitializeAsync();
                    var local = await initialization;
                    if (cancellationToken.IsCancellationRequested || Volatile.Read(ref disposed) != 0) return Failure(CatalogErrorCode.Cancelled);
                    if (!local.Locate(resolved.Value.AddressKey, typeof(GameObject), out var locations) || locations.Count != 1)
                        return Failure(CatalogErrorCode.IncompatibleContent);
                    var used = new HashSet<string>(StringComparer.Ordinal);
                    var location = Clone(locations[0], resolved.Value.Root, used, new HashSet<IResourceLocation>(), 0);
                    if (!used.Contains(resolved.Value.BundleKey)) return Failure(CatalogErrorCode.IncompatibleContent);
                    handle = Addressables.LoadAssetAsync<GameObject>(location);
                    Interlocked.Increment(ref allocatedHandles);
                    HandleAllocated?.Invoke();
                    await handle.Task;
                    if (cancellationToken.IsCancellationRequested || Volatile.Read(ref disposed) != 0) return Failure(CatalogErrorCode.Cancelled);
                    if (handle.Status != AsyncOperationStatus.Succeeded || handle.Result == null)
                        return Failure(Map(handle.OperationException));
                    var lease = new ModelLease(handle, () => { activeLeases--; Cleanup(); });
                    activeLeases++;
                    transferred = true;
                    return CatalogResult<ModelLease>.Success(lease);
                }
                catch (Exception error) { return Failure(cancellationToken.IsCancellationRequested ? CatalogErrorCode.Cancelled : Map(error)); }
                finally
                {
                    if (!transferred && handle.IsValid()) Addressables.Release(handle);
                    inFlight--;
                    Cleanup();
                }
            }).ConfigureAwait(false);
        }

        private async Task<IResourceLocator> InitializeAsync()
        {
            UnityThread.RequireMain();
            var catalogs = files.Where(file => file.Kind == "LocalCatalog").ToArray();
            if (catalogs.Length != 1) throw new InvalidDataException("本機 catalog 數量無效。");
            var file = catalogs[0];
            using (var bootstrapGuard = await VerifyBootstrapAsync())
            using (var guard = SafeContent.OpenRead(file.Root, file.Key))
            {
                if (guard.Length != file.Length) throw new InvalidDataException("本機 catalog 長度不符。");
                var digest = await Task.Run(() =>
                {
                    using (var sha = SHA256.Create()) return BitConverter.ToString(sha.ComputeHash(guard)).Replace("-", "").ToLowerInvariant();
                });
                if (digest != file.Sha256) throw new InvalidDataException("本機 catalog 雜湊不符。");
                // 同一檔案在 catalog 讀取完成前持續拒絕寫入與換檔。
                catalogHandle = Addressables.LoadContentCatalogAsync(SafeContent.Resolve(file.Root, file.Key), false, suffix);
                locator = await catalogHandle.Task;
                if (catalogHandle.Status != AsyncOperationStatus.Succeeded || locator == null)
                    throw catalogHandle.OperationException ?? new InvalidDataException("本機 catalog 無法讀取。");
            }
            Addressables.ResourceManager.ResourceProviders.Add(bundles);
            registered = true;
            return locator;
        }

        private async Task<BootstrapFiles> VerifyBootstrapAsync()
        {
            var settings = files.SingleOrDefault(file => file.Key == "aa/settings.json" && file.Kind == "Metadata");
            if (settings == null) throw new InvalidDataException("缺少啟動設定索引。");
            string bootstrapRoot = UnityEngine.Application.streamingAssetsPath;
            string runtime = Path.GetFullPath(Addressables.RuntimePath).TrimEnd(Path.DirectorySeparatorChar);
            string expected = Path.GetFullPath(Path.Combine(bootstrapRoot, "aa")).TrimEnd(Path.DirectorySeparatorChar);
            if (!string.Equals(runtime, expected, StringComparison.OrdinalIgnoreCase))
                throw new InvalidDataException("Addressables 啟動位置不屬於固定安裝包。");
            return await Task.Run(() =>
            {
                var guard = new BootstrapFiles();
                try
                {
                    // 啟動器位置由 Player 固定；其 bytes 必須與選定包的索引完全一致。
                    var bytes = guard.ReadVerified(bootstrapRoot, settings);
                    var catalogs = files.Where(file => file.Kind == "LocalCatalog").ToArray();
                    LocalAddressablesPolicy.Validate(new UTF8Encoding(false, true).GetString(bytes), catalogs.Select(file => file.Key));
                    // Addressables 先開預設 catalog，再開包內私有 catalog；兩份都要保護。
                    foreach (var catalogFile in catalogs) guard.ReadVerified(bootstrapRoot, catalogFile);
                    return guard;
                }
                catch { guard.Dispose(); throw; }
            });
        }

        private IResourceLocation Clone(IResourceLocation source, string root, HashSet<string> used,
            HashSet<IResourceLocation> ancestors, int depth)
        {
            if (depth > 32 || !ancestors.Add(source)) throw new InvalidDataException("資產相依循環。");
            try
            {
                var dependencies = source.Dependencies.Select(dep => Clone(dep, root, used, ancestors, depth + 1)).ToArray();
                if (source.ResourceType == typeof(IAssetBundleResource))
                {
                    string path = Addressables.ResourceManager.TransformInternalId(source);
                    if (!Path.IsPathRooted(path) || path.Contains("://")) throw new InvalidDataException("禁止遠端資產。");
                    string prefix = Path.GetFullPath(root).TrimEnd(Path.DirectorySeparatorChar) + Path.DirectorySeparatorChar;
                    path = Path.GetFullPath(path);
                    string key;
                    if (path.StartsWith(prefix, StringComparison.OrdinalIgnoreCase)) key = path.Substring(prefix.Length).Replace('\\', '/');
                    else
                    {
                        // catalog 中固定 RuntimePath 的 bundle 指向選定包的同一 storage key；不使用頂層 bundle。
                        string bootstrap = Path.GetFullPath(Path.Combine(UnityEngine.Application.streamingAssetsPath, "aa")) + Path.DirectorySeparatorChar;
                        if (!path.StartsWith(bootstrap, StringComparison.OrdinalIgnoreCase)) throw new InvalidDataException("資產不在固定本機位置。");
                        key = "aa/" + path.Substring(bootstrap.Length).Replace('\\', '/');
                    }
                    path = SafeContent.Resolve(root, key);
                    var file = files.SingleOrDefault(item => item.Key == key && item.Kind == "AssetBundle");
                    if (file == null) throw new InvalidDataException("未列入索引的資產。");
                    used.Add(key);
                    return new ResourceLocationBase(key, path, bundles.ProviderId, typeof(IAssetBundleResource), dependencies) { Data = file };
                }
                if (source.ProviderId != typeof(BundledAssetProvider).FullName + suffix || depth != 0 || dependencies.Length == 0)
                    throw new InvalidDataException("不支援的資產 provider。");
                return new ResourceLocationBase(source.PrimaryKey, source.InternalId, source.ProviderId, source.ResourceType, dependencies) { Data = source.Data };
            }
            finally { ancestors.Remove(source); }
        }

        /// <summary>停止新取得；已移交的租約維持有效直到持有者釋放。</summary>
        public void Dispose()
        {
            if (Interlocked.Exchange(ref disposed, 1) == 0 && initialization != null) UnityThread.Post(Cleanup);
        }
        private void Cleanup()
        {
            if (inFlight != 0 || activeLeases != 0) return;
            // 所有共用等待者離開後，暫時 IO 失敗才能清除；下一次明確重試重新驗證實際檔案。
            // 不把永久內容錯誤改為成功，也不在仍有人使用時移除 locator 或 bundle provider。
            bool retryInitialization = initialization != null && initialization.IsFaulted
                && Map(initialization.Exception) == CatalogErrorCode.StorageUnavailable;
            if (Volatile.Read(ref disposed) == 0 && !retryInitialization) return;
            if (locator != null) { Addressables.RemoveResourceLocator(locator); locator = null; }
            if (catalogHandle.IsValid()) Addressables.Release(catalogHandle);
            catalogHandle = default;
            if (registered) { Addressables.ResourceManager.ResourceProviders.Remove(bundles); registered = false; }
            initialization = null;
        }
        private static CatalogResult<ModelLease> Failure(CatalogErrorCode code) => CatalogResult<ModelLease>.Failure(code);
        private static CatalogErrorCode Map(Exception error)
        {
            for (var current = error; current != null; current = current.InnerException)
            {
                if (current is FileNotFoundException || current is DirectoryNotFoundException) return CatalogErrorCode.AssetMissing;
                if (current is InvalidDataException) return CatalogErrorCode.AssetCorrupt;
                if (current is IOException || current is UnauthorizedAccessException) return CatalogErrorCode.StorageUnavailable;
                if (current is OperationCanceledException) return CatalogErrorCode.Cancelled;
            }
            return CatalogErrorCode.AssetCorrupt;
        }

        private sealed class BootstrapFiles : IDisposable
        {
            private readonly List<FileStream> guards = new List<FileStream>();
            internal byte[] ReadVerified(string root, RuntimeFile file)
            {
                var stream = SafeContent.OpenRead(root, file.Key);
                try
                {
                    if (stream.Length != file.Length) throw new InvalidDataException("啟動檔案長度不符。");
                    using (var memory = new MemoryStream())
                    {
                        stream.CopyTo(memory);
                        var bytes = memory.ToArray();
                        if (SafeContent.Hash(bytes) != file.Sha256) throw new InvalidDataException("啟動檔案雜湊不符。");
                        guards.Add(stream);
                        return bytes;
                    }
                }
                catch { stream.Dispose(); throw; }
            }
            public void Dispose() { foreach (var stream in guards) stream.Dispose(); }
        }

        private sealed class VerifiedBundleProvider : ResourceProviderBase
        {
            internal int ReadCount, LoadedCount;
            internal VerifiedBundleProvider() { m_ProviderId = GetType().FullName + "-" + Guid.NewGuid().ToString("N"); }
            public override Type GetDefaultType(IResourceLocation location) => typeof(IAssetBundleResource);
            public override async void Provide(ProvideHandle handle)
            {
                try
                {
                    UnityThread.RequireMain();
                    var file = (RuntimeFile)handle.Location.Data;
                    var bytes = await Task.Run(() =>
                    {
                        Interlocked.Increment(ref ReadCount);
                        var data = SafeContent.ReadVerified(file.Root, file.Key, file.Sha256);
                        if (data.LongLength != file.Length) throw new InvalidDataException("資產長度不符。");
                        return data;
                    });
                    // 只載入剛才驗過的 bytes；不再次依檔名開檔。
                    var request = AssetBundle.LoadFromMemoryAsync(bytes);
                    if (!request.isDone)
                    {
                        var completion = new TaskCompletionSource<bool>();
                        request.completed += _ => completion.TrySetResult(true);
                        await completion.Task;
                    }
                    if (request.assetBundle == null) throw new InvalidDataException("無效的 AssetBundle。");
                    LoadedCount++;
                    handle.Complete<IAssetBundleResource>(new Bundle(request.assetBundle), true, null);
                }
                catch (Exception error) { handle.Complete<IAssetBundleResource>(null, false, error); }
            }
            public override void Release(IResourceLocation location, object value)
            {
                UnityThread.RequireMain();
                if (value is Bundle bundle) { bundle.Value.Unload(true); LoadedCount--; }
            }
            private sealed class Bundle : IAssetBundleResource
            {
                internal readonly AssetBundle Value;
                internal Bundle(AssetBundle value) { Value = value; }
                public AssetBundle GetAssetBundle() => Value;
            }
        }
    }
}
