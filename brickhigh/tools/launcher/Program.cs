using System;
using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices;
using System.Text.Json;
using System.Threading;
using BrickHigh.Domain;
using BrickHigh.Infrastructure;

/// <summary>隨包 Windows 啟動入口；固定 Preview 身分、離線相依及原生通知。</summary>
internal static class Program
{
    [STAThread]
    private static int Main()
    {
#if BRICKHIGH_PREVIEW
        var kind = PackageKind.Preview;
#else
        var kind = PackageKind.Release;
#endif
        var identity = InstallIdentity.For(kind);
        string root = Path.GetFullPath(AppContext.BaseDirectory);
        string diagnostics = null;
        try
        {
            diagnostics = Path.Combine(identity.DataRoot(LocalLow()), "Diagnostics");
            using (var lifecycle = InstallLifecycle.TryAcquire(identity, root))
            {
                if (lifecycle == null) return Fail(StartupFailure.Busy, diagnostics);
                using (var manifest = JsonDocument.Parse(File.ReadAllBytes(SafeContent.Resolve(root, "installation.json"))))
                {
                    var data = manifest.RootElement;
                    if (data.GetProperty("applicationId").GetString() != identity.ApplicationId
                        || data.GetProperty("packageKind").GetString() != kind.ToString())
                        return Fail(StartupFailure.Unknown, diagnostics);
                    string build = data.GetProperty("buildId").GetString();
                    string key = data.GetProperty("playerKey").GetString();
                    string player = SafeContent.Resolve(root, key);
                    if (!File.Exists(player)) return Fail(StartupFailure.MissingPlayer, diagnostics);
                    using (var guardedPlayer = SafeContent.OpenRead(root, key))
                    {
                        using (var sha = System.Security.Cryptography.SHA256.Create())
                        {
                            string actual = BitConverter.ToString(sha.ComputeHash(guardedPlayer)).Replace("-", "").ToLowerInvariant();
                            if (actual != data.GetProperty("playerSha256").GetString()) return Fail(StartupFailure.MissingPlayer, diagnostics);
                        }
                        Directory.CreateDirectory(diagnostics);
                        string id = DateTime.UtcNow.ToString("yyyyMMddTHHmmss") + "-" + Guid.NewGuid().ToString("N");
                        using (var ready = new EventWaitHandle(false, EventResetMode.ManualReset, "Local\\BrickHigh-Ready-" + id))
                        using (var authority = new LaunchAuthority())
                        {
                            var start = new ProcessStartInfo(player) { UseShellExecute = false, WorkingDirectory = root };
                            start.ArgumentList.Add("-logFile"); start.ArgumentList.Add(Path.Combine(diagnostics, id + "-player.log"));
                            start.Environment["BRICKHIGH_LAUNCH_PIPE"] = authority.PipeName;
                            start.Environment["BRICKHIGH_LAUNCH_TOKEN"] = authority.Token;
                            start.Environment["BRICKHIGH_LAUNCH_PID"] = Environment.ProcessId.ToString();
                            start.Environment["BRICKHIGH_INSTALL_ROOT"] = root;
                            start.Environment["BRICKHIGH_READY_EVENT"] = "Local\\BrickHigh-Ready-" + id;
                            using (var child = Process.Start(start))
                            {
                                var authorization = authority.AcceptAsync(child.Id, InstallLifecycle.LockName(identity, root), build, 120000);
                                var exit = child.WaitForExitAsync();
                                System.Threading.Tasks.Task.WhenAny(authorization, exit).GetAwaiter().GetResult();
                                bool accepted = authorization.IsCompletedSuccessfully && authorization.Result;
                                if (child.HasExited && !authorization.IsCompleted) authority.Dispose();
                                bool notified = false;
                                if (!accepted && !child.HasExited) { Fail(StartupFailure.Unknown, diagnostics); notified = true; }
                                // 原執行緒持鎖到 Player 退出；不強殺遊戲、不在執行中更新安裝內容。
                                child.WaitForExit();
                                if (!notified && (!accepted || !ready.WaitOne(0) || child.ExitCode != 0))
                                    return Fail(child.ExitCode == 12 ? StartupFailure.GraphicsUnsupported : StartupFailure.Unknown, diagnostics);
                                return child.ExitCode;
                            }
                        }
                    }
                }
            }
        }
        catch (FileNotFoundException) { return Fail(StartupFailure.MissingPlayer, diagnostics); }
        catch (DirectoryNotFoundException) { return Fail(StartupFailure.MissingPlayer, diagnostics); }
        catch (UnauthorizedAccessException) { return Fail(StartupFailure.StorageUnavailable, diagnostics); }
        catch (IOException) { return Fail(StartupFailure.StorageUnavailable, diagnostics); }
        catch { return Fail(StartupFailure.Unknown, diagnostics); }
    }

    private static int Fail(StartupFailure failure, string directory)
    {
        string id = Guid.NewGuid().ToString("N");
        string details = StartupNotice.Message(failure) + "\n\n診斷 ID：" + id;
        try
        {
            Directory.CreateDirectory(directory);
            File.WriteAllText(Path.Combine(directory, id + ".json"), JsonSerializer.Serialize(new {
                diagnosticId = id, failure = failure.ToString(), time = DateTime.UtcNow.ToString("O") }));
            details += "\n診斷位置：" + directory;
        }
        catch { details += "\n無法寫入本機診斷，請檢查可用空間與權限。"; }
        MessageBoxW(IntPtr.Zero, details, "BrickHigh", 0x10);
        return 3;
    }
    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    private static extern int MessageBoxW(IntPtr window, string text, string title, uint type);

    private static string LocalLow()
    {
        var id = new Guid("A520A1A4-1780-4FF6-BD18-167343C5AF16");
        int result = SHGetKnownFolderPath(ref id, 0, IntPtr.Zero, out IntPtr path);
        if (result != 0) Marshal.ThrowExceptionForHR(result);
        try { return Marshal.PtrToStringUni(path); }
        finally { Marshal.FreeCoTaskMem(path); }
    }
    [DllImport("shell32.dll")]
    private static extern int SHGetKnownFolderPath(ref Guid folder, uint flags, IntPtr token, out IntPtr path);
}
