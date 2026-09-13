#if UNITY_EDITOR || BRICKHIGH_TOOLCHAIN_PROBE
using System;
using System.Collections;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BrickHigh.Domain;
using BrickHigh.Infrastructure;
using UnityEngine;
using UnityEngine.AddressableAssets;
using UnityEngine.ResourceManagement.AsyncOperations;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;

namespace BrickHigh.UnityRuntime
{
    /// <summary>只供內部原生相依驗證場景；不是正式模型預覽或玩家入口。</summary>
    public sealed class ToolchainProbe : MonoBehaviour
    {
        [Serializable] private sealed class Report
        {
            public string purpose = "InternalToolchainProbe";
            public bool passed;
            public bool readyAsset = false;
            public string unityVersion, graphicsDevice, renderPipeline, sqliteVersion, failure;
            public int meshCount, triangles;
            public int visibleRedPixels;
            public bool leaseSharingVerified, leaseReleaseVerified;
            public bool preCancelledVerified, cancelledLoadVerified, reloadVerified;
            public bool previewFlowVerified;
            public bool previewRetryVerified;
            public int bundleReadCount, allocatedHandleCount, remainingLeaseCount, remainingBundleCount;
            public string captureMode = "PlayerCameraRenderRequest";
            public float widthMeters;
            public string[] shaders;
        }
        private readonly Report report = new Report();
        /// <summary>僅由內部建置器注入的人工快照。</summary>
        public string SnapshotId;
        /// <summary>人工測試變體，不宣稱真實顏色生產證據。</summary>
        public string VariantId;
        /// <summary>人工測試來源引用。</summary>
        public string RevisionId;
        /// <summary>建置器注入的人工包識別，不讀取玩家設定或 URL。</summary>
        public string PackId;
        private string output;
        private bool finished;
        private GameObject model;
        private ModelLease firstLease, secondLease;
        private BrickAssetProvider provider;
        private CatalogSession session;

        private IEnumerator Start()
        {
            var args = Environment.GetCommandLineArgs();
            int arg = Array.IndexOf(args, "-probe-output");
            if (arg < 0 || arg + 1 >= args.Length) { UnityEngine.Application.Quit(2); yield break; }
            output = Path.GetFullPath(args[arg + 1]);
            Directory.CreateDirectory(output);
            UnityEngine.Application.runInBackground = true;
            report.unityVersion = UnityEngine.Application.unityVersion;
            report.graphicsDevice = SystemInfo.graphicsDeviceName;
            report.renderPipeline = GraphicsSettings.currentRenderPipeline?.GetType().Name;
            try
            {
                if (SystemInfo.graphicsDeviceType == GraphicsDeviceType.Null || report.renderPipeline != "UniversalRenderPipelineAsset")
                    throw new InvalidOperationException("GraphicsPipelineUnavailable");
                using (var db = new NativeSqlite(Path.Combine(UnityEngine.Application.streamingAssetsPath, "ToolchainProbe", "probe.db")))
                {
                    report.sqliteVersion = db.Query("SELECT sqlite_version() AS version")[0]["version"];
                    if (db.Query("SELECT value FROM probe WHERE value=?", "繁體中文'100%_積木").Count != 1)
                        throw new InvalidOperationException("NativeReadMismatch");
                    bool rejected = false;
                    try { db.Execute("INSERT INTO probe VALUES('forbidden')"); }
                    catch (SqliteFailure e) when (e.Code == 8) { rejected = true; }
                    if (!rejected) throw new InvalidOperationException("CatalogNotReadOnly");
                }
            }
            catch (Exception e) { Finish(e.GetType().Name + ":" + e.Message); yield break; }
            var catalog = new BrickCatalog(Path.Combine(UnityEngine.Application.streamingAssetsPath, "Catalog", PackId), PackageKind.Preview);
            var opening = catalog.OpenAsync(CancellationToken.None);
            while (!opening.IsCompleted) yield return null;
            if (!opening.Result.IsSuccess) { Finish("CatalogOpen:" + opening.Result.Error.Code); yield break; }
            session = opening.Result.Value;
            provider = new BrickAssetProvider(catalog, session);
            var reference = new ModelReference(Guid.Parse(SnapshotId), Guid.Parse(VariantId), Guid.Parse(RevisionId));
            var preCancelled = provider.AcquireAsync(null, new CancellationToken(true));
            while (!preCancelled.IsCompleted) yield return null;
            report.preCancelledVerified = preCancelled.Result.Error?.Code == CatalogErrorCode.Cancelled
                && provider.BundleReadCount == 0 && provider.AllocatedHandleCount == 0;
            if (!report.preCancelledVerified) { Finish("PreCancelledAllocatedResources"); yield break; }
            var loading = provider.AcquireAsync(reference, CancellationToken.None);
            while (!loading.IsCompleted) yield return null;
            if (!loading.Result.IsSuccess) { Finish("FirstAcquire:" + loading.Result.Error.Code); yield break; }
            firstLease = loading.Result.Value;
            loading = provider.AcquireAsync(reference, CancellationToken.None);
            while (!loading.IsCompleted) yield return null;
            if (!loading.Result.IsSuccess) { Finish("SharedAcquire:" + loading.Result.Error.Code); yield break; }
            try
            {
                secondLease = loading.Result.Value;
                var sharedPrefab = firstLease.Prefab;
                firstLease.Dispose(); firstLease.Dispose();
                report.leaseSharingVerified = provider.ActiveLeaseCount == 1 && secondLease.Prefab == sharedPrefab;
                if (!report.leaseSharingVerified) throw new InvalidOperationException("SharedLeaseReleasedTooEarly");
                model = Instantiate(secondLease.Prefab);
                var renderers = model.GetComponentsInChildren<MeshRenderer>();
                var meshes = model.GetComponentsInChildren<MeshFilter>();
                if (renderers.Length == 0 || meshes.Length == 0) throw new InvalidOperationException("EmptyModel");
                report.meshCount = meshes.Length;
                report.triangles = meshes.Sum(x => x.sharedMesh.triangles.Length / 3);
                report.shaders = renderers.SelectMany(x => x.sharedMaterials).Select(x => x.shader.name).Distinct().ToArray();
                if (renderers.SelectMany(x => x.sharedMaterials).Any(x => x == null || x.shader == null || !x.shader.isSupported
                    || x.shader.name.Contains("InternalError"))) throw new InvalidOperationException("InvalidMaterial");
                var bounds = renderers[0].bounds;
                foreach (var renderer in renderers.Skip(1)) bounds.Encapsulate(renderer.bounds);
                report.widthMeters = bounds.size.x;
                if (Mathf.Abs(report.widthMeters - 0.032f) > 0.0001f || report.triangles < 100)
                    throw new InvalidOperationException("GeometryMismatch");
                var camera = Camera.main;
                camera.transform.position = bounds.center + new Vector3(0.057f, 0.043f, -0.065f);
                camera.transform.LookAt(bounds.center);
            }
            catch (Exception e) { Finish(e.GetType().Name + ":" + e.Message); yield break; }
            for (int frame = 0; frame < 30; frame++) yield return null;
            yield return new WaitForEndOfFrame();
            try
            {
                var target = RenderTexture.GetTemporary(960, 640, 24, RenderTextureFormat.ARGB32);
                var previous = RenderTexture.active;
                var screenshot = new Texture2D(960, 640, TextureFormat.RGB24, false);
                try
                {
                    var request = new UniversalRenderPipeline.SingleCameraRequest { destination = target };
                    RenderPipeline.SubmitRenderRequest(Camera.main, request);
                    RenderTexture.active = target;
                    screenshot.ReadPixels(new Rect(0, 0, 960, 640), 0, 0);
                    screenshot.Apply();
                    var pixels = screenshot.GetPixels32();
                    report.visibleRedPixels = pixels.Count(p => p.r > 60 && p.r > p.g * 1.5f && p.r > p.b * 1.5f);
                    if (report.visibleRedPixels < 500 || pixels.Count(p => p.r > 200 && p.b > 200 && p.g < 50) > 20)
                        throw new InvalidOperationException("BlankOrErrorShaderCapture");
                    using (var stream = new FileStream(Path.Combine(output, "player.png"), FileMode.CreateNew))
                    { var bytes = screenshot.EncodeToPNG(); stream.Write(bytes, 0, bytes.Length); }
                }
                finally { RenderTexture.active = previous; RenderTexture.ReleaseTemporary(target); Destroy(screenshot); }
            }
            catch (Exception e) { Finish(e.GetType().Name); yield break; }
            Destroy(model);
            yield return null;
            secondLease.Dispose(); secondLease.Dispose();
            report.leaseReleaseVerified = provider.ActiveLeaseCount == 0 && provider.LoadedBundleCount == 0;
            if (!report.leaseReleaseVerified) { Finish("LeaseReferenceNotReleased"); yield break; }
            // 先完全卸載，再在真實新 handle 配置後取消；不使用假 bundle 或預製成功結果。
            using (var cancellation = new CancellationTokenSource())
            {
                Action cancelAllocated = () => cancellation.Cancel();
                provider.HandleAllocated += cancelAllocated;
                var cancelled = provider.AcquireAsync(reference, cancellation.Token);
                while (!cancelled.IsCompleted) yield return null;
                provider.HandleAllocated -= cancelAllocated;
                report.cancelledLoadVerified = cancelled.Result.Error?.Code == CatalogErrorCode.Cancelled
                    && provider.ActiveLeaseCount == 0 && provider.LoadedBundleCount == 0 && provider.BundleReadCount == 2;
                if (!report.cancelledLoadVerified) { cancelled.Result.Value?.Dispose(); Finish("CancelledLoadLeakedResources"); yield break; }
            }
            // 背景呼叫必須派回主執行緒；最後一次卸載後重新讀取 bytes，不沿用過期 hash 快取。
            var reloading = Task.Run(() => provider.AcquireAsync(reference, CancellationToken.None));
            while (!reloading.IsCompleted) yield return null;
            if (!reloading.Result.IsSuccess) { Finish("Reload:" + reloading.Result.Error.Code); yield break; }
            secondLease = reloading.Result.Value;
            provider.Dispose();
            report.reloadVerified = secondLease.Prefab != null && provider.ActiveLeaseCount == 1
                && provider.LoadedBundleCount == 1 && provider.BundleReadCount == 3;
            secondLease.Dispose();
            if (!report.reloadVerified || provider.ActiveLeaseCount != 0 || provider.LoadedBundleCount != 0)
            { Finish("ReloadOrDisposeLifetimeMismatch"); yield break; }
            // 使用正式預覽控制層串接真實 SQLite 與受控 provider；仍是人工資料，不是合格 Preview。
            var openingPreview = CatalogPreviewController.OpenAsync(catalog);
            while (!openingPreview.IsCompleted) yield return null;
            if (!openingPreview.Result.IsSuccess) { Finish("PreviewOpen:" + openingPreview.Result.Error.Code); yield break; }
            using (var preview = openingPreview.Result.Value)
            {
                var searching = preview.SearchAsync(new VariantQuery { QueryText = "__no_fixture_matches__" });
                while (!searching.IsCompleted) yield return null;
                if (!searching.Result || preview.State.Rows.Count != 0 || preview.State.Message != "找不到符合條件的模型。")
                { Finish("PreviewEmptyStateMismatch"); yield break; }
                searching = preview.ClearFiltersAsync();
                while (!searching.IsCompleted) yield return null;
                if (!searching.Result || preview.State.Rows.Count != 1)
                { Finish("PreviewClearMismatch"); yield break; }
                // 暫時讀取鎖只限制本探針包的啟動設定，不修改 bytes；釋放後同一 provider 應可重試。
                using (var locked = new FileStream(Path.Combine(UnityEngine.Application.streamingAssetsPath, "aa", "settings.json"),
                    FileMode.Open, FileAccess.Read, FileShare.None))
                {
                    var blocked = preview.SelectAsync(Guid.Parse(VariantId));
                    while (!blocked.IsCompleted) yield return null;
                    if (!blocked.Result || preview.State.ErrorCode != CatalogErrorCode.StorageUnavailable
                        || !preview.State.CanRetry || preview.Instance != null || preview.State.Model != null)
                    { Finish("PreviewTransientFailureMismatch"); yield break; }
                }
                var selecting = preview.RetryAsync();
                var duplicate = preview.RetryAsync();
                while (!selecting.IsCompleted) yield return null;
                while (!duplicate.IsCompleted) yield return null;
                report.previewRetryVerified = selecting.Result && !duplicate.Result && preview.State.Model != null && !preview.State.CanRetry;
                if (!report.previewRetryVerified) { Finish("PreviewRetryDidNotRecover:" + preview.State.ErrorCode); yield break; }
                report.previewFlowVerified = selecting.Result && preview.State.Model != null && preview.Instance != null
                    && preview.State.SelectedDetails.Model.SnapshotId == Guid.Parse(SnapshotId)
                    && preview.State.ProductionStatusText == "生產狀態待查"
                    && preview.Instance.GetComponentsInChildren<MeshFilter>().Sum(x => x.sharedMesh.triangles.Length / 3) == report.triangles;
                preview.Dispose();
                report.previewFlowVerified &= preview.Instance == null && preview.State.Model == null && !preview.State.CanSearch
                    && preview.RemainingLeases == 0 && preview.RemainingBundles == 0;
                if (!report.previewFlowVerified) { Finish("PreviewFlowMismatch"); yield break; }
            }
            Finish(null);
        }
        private void Update()
        {
            if (!finished && Time.realtimeSinceStartup > 120) Finish("ProbeTimeout");
        }
        private void Finish(string failure)
        {
            if (finished) return;
            finished = true;
            firstLease?.Dispose(); secondLease?.Dispose();
            provider?.Dispose(); session?.Dispose();
            report.bundleReadCount = provider?.BundleReadCount ?? 0;
            report.allocatedHandleCount = provider?.AllocatedHandleCount ?? 0;
            report.remainingLeaseCount = provider?.ActiveLeaseCount ?? 0;
            report.remainingBundleCount = provider?.LoadedBundleCount ?? 0;
            report.failure = failure;
            report.passed = failure == null;
            string json = JsonUtility.ToJson(report, true);
            Debug.Log("BRICKHIGH_TOOLCHAIN_PROBE " + json);
            if (output != null)
            {
                using (var stream = new StreamWriter(new FileStream(Path.Combine(output, "player-report.json"), FileMode.CreateNew))) stream.Write(json);
            }
            UnityEngine.Application.Quit(report.passed ? 0 : 3);
        }
    }
}
#endif
