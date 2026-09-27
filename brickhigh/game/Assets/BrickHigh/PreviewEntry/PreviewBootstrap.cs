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
                if (SystemInfo.graphicsDeviceType == GraphicsDeviceType.Null) { UnityEngine.Application.Quit(12); return; }
                string root = Environment.GetEnvironmentVariable("BRICKHIGH_INSTALL_ROOT");
                string executable = UnityEngine.Application.dataPath.Substring(0, UnityEngine.Application.dataPath.Length - 5) + ".exe";
                int.TryParse(Environment.GetEnvironmentVariable("BRICKHIGH_LAUNCH_PID"), out int launcherPid);
                bool valid = launcherPid > 0 && PlayerStartupPolicy.ValidateInstallation(root, executable, BuildId, PackageKind.Preview);
                if (valid) valid = await ControlledLaunch.AuthorizeAsync(Environment.GetEnvironmentVariable("BRICKHIGH_LAUNCH_PIPE"),
                    Environment.GetEnvironmentVariable("BRICKHIGH_LAUNCH_TOKEN"), InstallLifecycle.LockName(InstallIdentity.For(PackageKind.Preview), root),
                    BuildId, 5000, launcherPid);
                Environment.SetEnvironmentVariable("BRICKHIGH_LAUNCH_TOKEN", null);
                if (!valid)
                {
                    MessageBoxW(IntPtr.Zero, StartupNotice.Message(StartupFailure.UncontrolledLaunch), "BrickHighPreview", 0x10);
                    UnityEngine.Application.Quit(3); return;
                }
                if (BundledFont == null || FontLicense == null) throw new InvalidDataException("缺少隨包字型或授權。");
                view = CatalogPreviewView.Create(BundledFont, ModelCamera);
                view.ExitRequested += () => UnityEngine.Application.Quit();
                string content = SafeContent.Resolve(UnityEngine.Application.streamingAssetsPath, "Catalog/" + PackId);
                var opened = await CatalogPreviewController.OpenAsync(new BrickCatalog(content, PackageKind.Preview), lifetime.Token);
                if (!opened.IsSuccess)
                {
                    view.StatusText.text = opened.Error.Message + "  診斷 ID：" + opened.Error.DiagnosticId;
                    SignalReady(); return;
                }
                controller = opened.Value;
                if (lifetime.IsCancellationRequested) { controller.Dispose(); return; }
                var coverage = await controller.GetCoverageAsync(lifetime.Token);
                if (!coverage.IsSuccess) throw new InvalidDataException("覆蓋資料無法讀取。");
                view.SetCoverage(coverage.Value, PackagedVariantCount);
                view.Bind(controller);
                SignalReady();
#if BRICKHIGH_INTERNAL_UI
                var acceptance = gameObject.AddComponent<InternalPreviewAcceptance>();
                acceptance.Begin(view, controller, ModelCamera, BuildId, PackId);
#endif
            }
            catch (Exception error)
            {
                // 僅保存診斷類型；管線 token、stack 與來源憑證不進入玩家畫面。
                Debug.LogError("PreviewStartup: " + error.GetType().Name);
                UnityEngine.Application.Quit(14);
            }
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
