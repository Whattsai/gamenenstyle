using System;
using System.IO;
using System.Threading;
using BrickHigh.Domain;
using BrickHigh.Infrastructure;

/// <summary>只供隔離測試的命令入口；發行安裝器不編入故障注入。</summary>
internal static class InstallerHarness
{
    private static int Main(string[] args)
    {
        if (args.Length < 2) return 2;
        InstallResult result;
        if ((args[0] == "install" || args[0] == "install-fail-before-switch"
            || args[0] == "install-denied" || args[0] == "install-pause"
            || args[0] == "install-tamper-before-switch" || args[0] == "install-replace-index"
            || args[0] == "install-lock-pointer-before-switch")
            && (args.Length == 3 || (args[0] == "install-pause" && args.Length == 5)))
        {
            Action<InstallPhase> callback = args[0] == "install-fail-before-switch"
                ? phase => { if (phase == InstallPhase.BeforeSwitch) throw new IOException("測試中斷"); }
                : null;
            if (args[0] == "install-denied") callback = phase => { throw new UnauthorizedAccessException("測試權限失敗"); };
            if (args[0] == "install-tamper-before-switch") callback = phase =>
                File.WriteAllBytes(Path.Combine(args[2], "versions", "build-b", "Player", "BrickHigh.exe"),
                    new byte[] { 0xFF });
            if (args[0] == "install-replace-index") callback = phase =>
                File.WriteAllText(Path.Combine(args[1], "package-index.json"), "{}");
            FileStream lockedPointer = null;
            if (args[0] == "install-lock-pointer-before-switch") callback = phase =>
                lockedPointer = new FileStream(Path.Combine(args[2], "installation.json"), FileMode.Open,
                    FileAccess.Read, FileShare.None);
            if (args[0] == "install-pause") callback = phase =>
            {
                File.WriteAllText(args[3], "held");
                for (int n = 0; n < 400 && !File.Exists(args[4]); n++) Thread.Sleep(20);
                if (!File.Exists(args[4])) throw new IOException("等待同步超時");
            };
            string shortcutRoot = Path.Combine(Path.GetDirectoryName(Path.GetFullPath(args[2])), "shortcuts");
            try { result = InstallerCore.Install(args[1], args[2], callback, shortcutRoot); }
            finally { lockedPointer?.Dispose(); }
        }
        else if (args[0] == "uninstall" && args.Length == 3 && Enum.TryParse(args[2], out PackageKind kind))
            result = InstallerCore.Uninstall(args[1], kind,
                Path.Combine(Path.GetDirectoryName(Path.GetFullPath(args[1])), "shortcuts"));
        else if (args[0] == "shortcut-target" && args.Length == 2)
        {
            Console.WriteLine(ShortcutPolicy.ReadTarget(args[1]));
            return 0;
        }
        else if (args[0] == "shortcut-arguments" && args.Length == 2)
        {
            Console.WriteLine(ShortcutPolicy.ReadArguments(args[1]));
            return 0;
        }
        else if (args[0] == "make-unmanaged-shortcut" && args.Length == 3)
        {
            dynamic shell = Activator.CreateInstance(Type.GetTypeFromProgID("WScript.Shell"));
            dynamic shortcut = shell.CreateShortcut(args[1]);
            shortcut.TargetPath = args[2];
            shortcut.Description = "使用者自建快捷入口";
            shortcut.Save();
            return 0;
        }
        else if (args[0] == "hold" && args.Length == 4)
        {
            using (var held = InstallLifecycle.TryAcquire(InstallIdentity.For(PackageKind.Preview), args[1]))
            {
                if (held == null) { Console.WriteLine(InstallResult.Busy); return (int)InstallResult.Busy; }
                File.WriteAllText(args[2], "held");
                for (int n = 0; n < 400 && !File.Exists(args[3]); n++) Thread.Sleep(20);
                return File.Exists(args[3]) ? 0 : 9;
            }
        }
        else if (args[0] == "hold-pointer" && args.Length == 4)
        {
            using (var held = new FileStream(Path.Combine(args[1], "installation.json"), FileMode.Open,
                FileAccess.Read, FileShare.None))
            {
                File.WriteAllText(args[2], "held");
                for (int n = 0; n < 400 && !File.Exists(args[3]); n++) Thread.Sleep(20);
                return File.Exists(args[3]) ? 0 : 9;
            }
        }
        else return 2;
        Console.WriteLine(result);
        return result == InstallResult.Uninstalled ? 0 : (int)result;
    }
}
