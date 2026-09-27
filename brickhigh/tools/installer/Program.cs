using System;
using System.IO;
using System.Runtime.InteropServices;
using System.Windows.Forms;
using BrickHigh.Domain;
using BrickHigh.Infrastructure;

/// <summary>Windows 原生安裝入口；所有實際變更交由持鎖的 InstallerCore。</summary>
internal static class Program
{
    [STAThread]
    private static int Main(string[] args)
    {
        if (args.Length == 0) return InteractiveInstall();
        bool portable = args.Length == 4 && args[3] == "--no-shortcut";
        InstallResult result;
        if ((args.Length == 3 || portable) && args[0] == "install")
            result = InstallerCore.Install(args[1], args[2], shortcutRoot: portable ? string.Empty : null);
        else if ((args.Length == 3 || portable) && args[0] == "uninstall"
            && Enum.TryParse(args[2], out PackageKind kind))
            result = InstallerCore.Uninstall(args[1], kind, shortcutRoot: portable ? string.Empty : null);
        else result = InstallResult.Corrupt;
        if (result == InstallResult.UninstalledWithResidual)
            Notice("已移除可啟動版本與快捷入口。卸載程式目前仍在使用，檔案保留於安裝目錄；關閉此視窗後可手動刪除剩餘目錄。", 0x30);
        else if (result != InstallResult.Installed && result != InstallResult.Uninstalled)
        {
            var failure = result == InstallResult.Busy ? StartupFailure.Busy
                : result == InstallResult.Corrupt ? StartupFailure.MissingPlayer : StartupFailure.StorageUnavailable;
            string message = StartupNotice.Message(failure);
            if (args.Length > 0 && args[0] == "install") message += "\n更新未完成，已保留原版本與存檔。";
            Notice(message, 0x10);
        }
        return result == InstallResult.Uninstalled ? 0 : (int)result;
    }

    private static int InteractiveInstall()
    {
        string package = Path.Combine(AppContext.BaseDirectory, "Package");
        var info = InstallerCore.Inspect(package);
        if (info == null)
        {
            Notice("安裝包不完整，找不到可核對的本機 Package。", 0x10);
            return (int)InstallResult.Corrupt;
        }
        var identity = InstallIdentity.For(info.Kind);
        string purpose = string.Equals(info.Purpose, "F-Catalog", StringComparison.OrdinalIgnoreCase)
            ? "此包為內部 F-Catalog 測試資料，尚未通過 Ready 與完整模型庫驗收。"
            : info.Kind == PackageKind.Preview ? "技術預覽・非完整模型庫。" : "正式離線安裝包。";
        if (MessageBoxW(IntPtr.Zero,
            identity.Product + "\n" + purpose + "\n\n下一步選擇本機安裝資料夾。",
            "BrickHigh 安裝", 0x21) != 1) return 0;
        using (var picker = new FolderBrowserDialog())
        {
            picker.Description = "選擇 " + identity.Product + " 的安裝資料夾";
            picker.ShowNewFolderButton = true;
            picker.SelectedPath = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
            if (picker.ShowDialog() != DialogResult.OK) return 0;
            var result = InstallerCore.Install(package, picker.SelectedPath);
            if (result == InstallResult.Installed)
            {
                Notice("安裝完成。請從開始功能表的 " + identity.Product + " 快捷入口啟動。", 0x40);
                return 0;
            }
            var failure = result == InstallResult.Busy ? StartupFailure.Busy
                : result == InstallResult.Corrupt ? StartupFailure.MissingPlayer : StartupFailure.StorageUnavailable;
            Notice(StartupNotice.Message(failure) + "\n更新未完成，已保留原版本與存檔。", 0x10);
            return (int)result;
        }
    }

    private static void Notice(string message, uint style)
    {
        // 僅允許自動化驗證略過視窗；不改安裝、驗證或捷徑政策。
        if (Environment.GetEnvironmentVariable("BRICKHIGH_INSTALLER_SUPPRESS_NOTICE") == "1") return;
        MessageBoxW(IntPtr.Zero, message, "BrickHigh", style);
    }

    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    private static extern int MessageBoxW(IntPtr window, string text, string title, uint type);
}
