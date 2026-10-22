using System;
using System.IO;
using System.Runtime.InteropServices;
using System.Threading;
using BrickHigh.Domain;
using BrickHigh.Infrastructure;
using BrickHigh.Presentation;
using BrickHigh.UnityRuntime;
using UnityEngine;
using UnityEngine.Rendering;

namespace BrickHigh.PreviewEntry
{
    /// <summary>編譯場景固定的 Preview 入口；只接受隨包啟動器授權及離線本機內容。</summary>
    public sealed class PreviewBootstrap : MonoBehaviour
    {
        public Font BundledFont;
        public TextAsset FontLicense;
        public Camera ModelCamera;
        public string PackId;
        public string BuildId;
        public int PackagedVariantCount;
        private readonly CancellationTokenSource lifetime = new CancellationTokenSource();
        private CatalogPreviewView view;
        private CatalogPreviewController controller;

        private async void Start()
        {
            try
            {
                // 在啟動器驗證與非同步管線授權前就啟用 QA 背景進度；
                // 否則後續唯讀／故障注入情境失焦時，Unity 可能停止派送 async continuation。
                if (HasAcceptanceOutput()) UnityEngine.Application.runInBackground = true;
                WriteAcceptanceStartup("Start");
                if (SystemInfo.graphicsDeviceType == GraphicsDeviceType.Null) { WriteAcceptanceStartup("GraphicsUnsupported"); UnityEngine.Application.Quit(12); return; }
                string root = Environment.GetEnvironmentVariable("BRICKHIGH_INSTALL_ROOT");
                string executable = UnityEngine.Application.dataPath.Substring(0, UnityEngine.Application.dataPath.Length - 5) + ".exe";
                int.TryParse(Environment.GetEnvironmentVariable("BRICKHIGH_LAUNCH_PID"), out int launcherPid);
                WriteAcceptanceStartup("InstallValidationStarted");
                bool valid = launcherPid > 0 && PlayerStartupPolicy.ValidateInstallation(root, executable, BuildId, PackageKind.Preview);
                WriteAcceptanceStartup(valid ? "InstallValidated" : "InstallRejected");
                if (valid)
                {
                    WriteAcceptanceStartup("LaunchAuthorizationStarted");
                    valid = await ControlledLaunch.AuthorizeAsync(Environment.GetEnvironmentVariable("BRICKHIGH_LAUNCH_PIPE"),
                        Environment.GetEnvironmentVariable("BRICKHIGH_LAUNCH_TOKEN"), InstallLifecycle.LockName(InstallIdentity.For(PackageKind.Preview), root),
                        BuildId, 5000, launcherPid);
                }
                Environment.SetEnvironmentVariable("BRICKHIGH_LAUNCH_TOKEN", null);
                WriteAcceptanceStartup(valid ? "LaunchAuthorized" : "LaunchRejected");
                if (!valid)
                {
                    MessageBoxW(IntPtr.Zero, StartupNotice.Message(StartupFailure.UncontrolledLaunch), "BrickHighPreview", 0x10);
                    UnityEngine.Application.Quit(3); return;
                }
                if (BundledFont == null || FontLicense == null) throw new InvalidDataException("缺少隨包字型或授權。");
                view = CatalogPreviewView.Create(BundledFont, ModelCamera);
                WriteAcceptanceStartup("ViewCreated");
                view.ExitRequested += () => UnityEngine.Application.Quit();
                string content = SafeContent.Resolve(UnityEngine.Application.streamingAssetsPath, "Catalog/" + PackId);
                string sqlite = SafeContent.Resolve(UnityEngine.Application.dataPath, "Plugins/x86_64/sqlite3.dll");
                WriteAcceptanceStartup("CatalogOpenStarted");
                var opened = await CatalogPreviewController.OpenAsync(new BrickCatalog(content, PackageKind.Preview, sqlite), lifetime.Token);
                if (!opened.IsSuccess)
                {
                    view.StatusText.text = opened.Error.Message + "  診斷 ID：" + opened.Error.DiagnosticId;
                    WriteAcceptanceStartup("CatalogOpenFailed", opened.Error.Code.ToString(), opened.Error.Message);
#if BRICKHIGH_INTERNAL_UI
                    WriteAcceptanceCatalogDiagnostics(content);
#endif
                    SignalReady();
                    if (HasAcceptanceOutput()) UnityEngine.Application.Quit(16);
                    return;
                }
                WriteAcceptanceStartup("CatalogOpened");
                controller = opened.Value;
                if (lifetime.IsCancellationRequested) { controller.Dispose(); return; }
                var coverage = await controller.GetCoverageAsync(lifetime.Token);
                if (!coverage.IsSuccess) { WriteAcceptanceStartup("CoverageFailed", coverage.Error.Code.ToString()); throw new InvalidDataException("覆蓋資料無法讀取。"); }
                WriteAcceptanceStartup("CoverageLoaded");
                view.SetCoverage(coverage.Value, PackagedVariantCount);
                view.Bind(controller);
                SignalReady();
                WriteAcceptanceStartup("ViewBound");
#if BRICKHIGH_INTERNAL_UI
                var acceptance = gameObject.AddComponent<InternalPreviewAcceptance>();
                WriteAcceptanceStartup("AcceptanceBegin");
                acceptance.Begin(view, controller, ModelCamera, BuildId, PackId);
#endif
            }
            catch (Exception error)
            {
                // 僅保存診斷類型；管線 token、stack 與來源憑證不進入玩家畫面。
                WriteAcceptanceStartup("Exception", error.GetType().Name);
                Debug.LogError("PreviewStartup: " + error.GetType().Name);
                UnityEngine.Application.Quit(14);
            }
        }

        private static bool HasAcceptanceOutput() => !string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("BRICKHIGH_ACCEPTANCE_OUTPUT"));
#if BRICKHIGH_INTERNAL_UI
        private static void WriteAcceptanceCatalogDiagnostics(string contentRoot)
        {
            string directory = Environment.GetEnvironmentVariable("BRICKHIGH_ACCEPTANCE_OUTPUT");
            if (string.IsNullOrWhiteSpace(directory) || !Path.IsPathRooted(directory)) return;
            try
            {
                var result = new Newtonsoft.Json.Linq.JObject();
                var failures = new Newtonsoft.Json.Linq.JArray();
                result["contentRootExists"] = Directory.Exists(contentRoot);
                foreach (string key in new[] { "release-manifest.json", "catalog.db" })
                {
                    try { using (SafeContent.OpenRead(contentRoot, key)) { } }
                    catch (Exception error) { failures.Add(new Newtonsoft.Json.Linq.JObject { ["storageKey"] = key, ["errorType"] = error.GetType().Name }); }
                }
                string manifestPath = Path.Combine(contentRoot, "release-manifest.json");
                if (File.Exists(manifestPath))
                {
                    var manifest = Newtonsoft.Json.Linq.JObject.Parse(File.ReadAllText(manifestPath));
                    if (manifest["files"] is Newtonsoft.Json.Linq.JArray files)
                    {
                        result["manifestFileCount"] = files.Count;
                        foreach (var token in files)
                        {
                            string key = (string)token?["storageKey"];
                            if (string.IsNullOrWhiteSpace(key)) continue;
                            try { using (SafeContent.OpenRead(contentRoot, key)) { } }
                            catch (Exception error) { failures.Add(new Newtonsoft.Json.Linq.JObject { ["storageKey"] = key, ["errorType"] = error.GetType().Name }); }
                        }
                    }
                }
                result["failures"] = failures;
                Directory.CreateDirectory(directory);
                File.WriteAllText(Path.Combine(directory, "catalog-open-diagnostics.json"), result.ToString());
            }
            catch { }
        }
#endif
        private static void WriteAcceptanceStartup(string stage, string error = null, string message = null)
        {
            string directory = Environment.GetEnvironmentVariable("BRICKHIGH_ACCEPTANCE_OUTPUT");
            if (string.IsNullOrWhiteSpace(directory) || !Path.IsPathRooted(directory)) return;
            try
            {
                Directory.CreateDirectory(directory);
                File.WriteAllText(Path.Combine(directory, "bootstrap.json"), Newtonsoft.Json.Linq.JObject.FromObject(new {
                    stage, error, message, time = DateTime.UtcNow.ToString("O")
                }).ToString());
            }
            catch { }
        }

        private static void SignalReady()
        {
            string name = Environment.GetEnvironmentVariable("BRICKHIGH_READY_EVENT");
            if (string.IsNullOrEmpty(name) || !name.StartsWith("Local\\BrickHigh-Ready-", StringComparison.Ordinal)) return;
            using (var ready = EventWaitHandle.OpenExisting(name)) ready.Set();
        }
        private void OnDestroy() { lifetime.Cancel(); view?.Dispose(); controller?.Dispose(); lifetime.Dispose(); }
        [DllImport("user32.dll", CharSet = CharSet.Unicode)]
        private static extern int MessageBoxW(IntPtr window, string text, string title, uint type);
    }
}
