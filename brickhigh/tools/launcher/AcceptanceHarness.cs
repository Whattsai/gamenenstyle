using System;
using System.Diagnostics;
using System.IO;
using System.Threading;
using BrickHigh.Domain;
using BrickHigh.Infrastructure;

/// <summary>開發端跨程序驗收；不隨玩家安裝包發行。</summary>
internal static class AcceptanceHarness
{
    private static int Main(string[] args)
    {
        if (args.Length < 2) return 2;
        var identity = InstallIdentity.For(PackageKind.Preview);
        string root = Path.GetFullPath(args[1]);
        if (args[0] == "client")
            return ControlledLaunch.AuthorizeAsync(Environment.GetEnvironmentVariable("BRICKHIGH_LAUNCH_PIPE"),
                Environment.GetEnvironmentVariable("BRICKHIGH_LAUNCH_TOKEN"), InstallLifecycle.LockName(identity, root), "fixture-v1")
                .GetAwaiter().GetResult() ? 0 : 8;
        using (var lifecycle = InstallLifecycle.TryAcquire(identity, root))
        {
            if (lifecycle == null) return 7;
            if (args[0] == "claim") return 0;
            if (args[0] == "hold")
            {
                File.WriteAllText(args[2], "held");
                var timer = Stopwatch.StartNew();
                while (!File.Exists(Path.Combine(root, "release")) && timer.Elapsed.TotalSeconds < 15) Thread.Sleep(20);
                return timer.Elapsed.TotalSeconds < 15 ? 0 : 9;
            }
            if (args[0] == "launch")
            {
                using (var authority = new LaunchAuthority())
                {
                    var start = new ProcessStartInfo(Environment.ProcessPath) { UseShellExecute = false, CreateNoWindow = true };
                    start.ArgumentList.Add("client"); start.ArgumentList.Add(root);
                    start.Environment["BRICKHIGH_LAUNCH_PIPE"] = authority.PipeName;
                    start.Environment["BRICKHIGH_LAUNCH_TOKEN"] = authority.Token;
                    using (var child = Process.Start(start))
                    {
                        bool accepted = authority.AcceptAsync(child.Id, InstallLifecycle.LockName(identity, root), "fixture-v1", 5000).GetAwaiter().GetResult();
                        child.WaitForExit();
                        return accepted && child.ExitCode == 0 ? 0 : 8;
                    }
                }
            }
        }
        return 2;
    }
}
