using System;
using System.IO;
using System.Runtime.InteropServices;
using BrickHigh.Domain;
using BrickHigh.Infrastructure;

/// <summary>目前使用者 Start Menu 的原生 Shell Link；測試可注入隔離目錄。</summary>
public static class ShortcutPolicy
{
    /// <summary>空字串代表明確選擇可攜安裝；null 使用目前使用者 Start Menu。</summary>
    public static string Root(string shortcutRoot)
    {
        if (shortcutRoot == string.Empty) return null;
        string root = shortcutRoot ?? Environment.GetFolderPath(Environment.SpecialFolder.Programs);
        if (string.IsNullOrWhiteSpace(root) || !Path.IsPathRooted(root))
            throw new InvalidDataException("快捷入口位置無效。");
        return Path.GetFullPath(root);
    }

    /// <summary>固定依包身分分離 Preview 與 Release 的捷徑名稱。</summary>
    public static string PathFor(PackageKind kind, string shortcutRoot)
    {
        string root = Root(shortcutRoot);
        if (root == null) return null;
        string name = kind == PackageKind.Preview ? "BrickHigh Preview.lnk"
            : kind == PackageKind.Release ? "BrickHigh.lnk"
            : throw new InvalidDataException("包身分無效。");
        return SafeContent.Resolve(root, name);
    }

    /// <summary>依包身分分離可雙擊的移除入口。</summary>
    public static string UninstallPathFor(PackageKind kind, string shortcutRoot)
    {
        string root = Root(shortcutRoot);
        if (root == null) return null;
        string name = kind == PackageKind.Preview ? "解除安裝 BrickHigh Preview.lnk"
            : kind == PackageKind.Release ? "解除安裝 BrickHigh.lnk"
            : throw new InvalidDataException("包身分無效。");
        return SafeContent.Resolve(root, name);
    }

    /// <summary>只建立不存在的自身捷徑；同名但不同目標視為衝突。</summary>
    public static bool Ensure(PackageKind kind, string installRoot, string shortcutRoot)
    {
        string path = PathFor(kind, shortcutRoot);
        if (path == null) return false;
        string target = SafeContent.Resolve(installRoot, "BrickHighLauncher.exe");
        if (File.Exists(path))
        {
            var existing = Read(path);
            if (!SameTarget(existing.Target, target) || existing.Description != Marker(kind))
                throw new InvalidDataException("已有其他快捷入口。");
            return false;
        }
        Directory.CreateDirectory(Path.GetDirectoryName(path));
        string temporary = SafeContent.Resolve(Path.GetDirectoryName(path), ".shortcut-" + Guid.NewGuid().ToString("N") + ".lnk");
        try
        {
            Save(temporary, target, installRoot, Marker(kind), string.Empty);
            if (!SameTarget(ReadTarget(temporary), target)) throw new InvalidDataException("快捷入口目標不符。");
            File.Move(temporary, path);
            return true;
        }
        finally { if (File.Exists(temporary)) File.Delete(temporary); }
    }

    /// <summary>切換版本內卸載入口，回傳指標提交失敗時所需的原樣回復動作。</summary>
    public static Action EnsureUninstall(PackageKind kind, string installRoot, string buildId, string shortcutRoot)
    {
        string path = UninstallPathFor(kind, shortcutRoot);
        if (path == null) return null;
        string target = SafeContent.Resolve(installRoot, "versions/" + buildId + "/Installer/BrickHighInstaller.exe");
        string arguments = UninstallArguments(kind, installRoot);
        byte[] previous = null;
        if (File.Exists(path))
        {
            var existing = Read(path);
            if (existing.Description != UninstallMarker(kind) || existing.Arguments != arguments
                || !IsVersionInstaller(existing.Target, installRoot) || !File.Exists(existing.Target))
                throw new InvalidDataException("已有其他移除快捷入口。");
            if (SameTarget(existing.Target, target)) return null;
            previous = File.ReadAllBytes(path);
        }
        Directory.CreateDirectory(Path.GetDirectoryName(path));
        string temporary = SafeContent.Resolve(Path.GetDirectoryName(path), ".shortcut-" + Guid.NewGuid().ToString("N") + ".lnk");
        try
        {
            Save(temporary, target, installRoot, UninstallMarker(kind), arguments);
            var created = Read(temporary);
            if (!SameTarget(created.Target, target) || created.Arguments != arguments)
                throw new InvalidDataException("移除快捷入口目標不符。");
            if (previous == null) File.Move(temporary, path);
            else File.Replace(temporary, path, null);
            if (previous == null) return () => RemoveUninstallIfOwned(kind, installRoot, shortcutRoot);
            return () => RestoreUninstallIfOwned(kind, installRoot, shortcutRoot, target, previous);
        }
        finally { if (File.Exists(temporary)) File.Delete(temporary); }
    }

    private static void RestoreUninstallIfOwned(PackageKind kind, string installRoot, string shortcutRoot,
        string expectedTarget, byte[] previous)
    {
        string path = UninstallPathFor(kind, shortcutRoot);
        if (path == null || !File.Exists(path)) return;
        var current = Read(path);
        if (current.Description != UninstallMarker(kind) || current.Arguments != UninstallArguments(kind, installRoot)
            || !SameTarget(current.Target, expectedTarget)) return;
        string temporary = SafeContent.Resolve(Path.GetDirectoryName(path), ".shortcut-" + Guid.NewGuid().ToString("N") + ".lnk");
        try
        {
            File.WriteAllBytes(temporary, previous);
            File.Replace(temporary, path, null);
        }
        finally { if (File.Exists(temporary)) File.Delete(temporary); }
    }

    /// <summary>只刪除目標精確指向本安裝入口的捷徑；未知或損毀捷徑保留。</summary>
    public static void RemoveIfOwned(PackageKind kind, string installRoot, string shortcutRoot)
    {
        string path = PathFor(kind, shortcutRoot);
        if (path == null || !File.Exists(path)) return;
        (string Target, string Description, string Arguments) actual;
        try { actual = Read(path); }
        catch (Exception error) when (error is COMException || error is InvalidDataException) { return; }
        if (actual.Description == Marker(kind)
            && SameTarget(actual.Target, SafeContent.Resolve(installRoot, "BrickHighLauncher.exe"))) File.Delete(path);
    }

    /// <summary>只清理標記、安裝根及完整參數皆符合的自身移除捷徑。</summary>
    public static void RemoveUninstallIfOwned(PackageKind kind, string installRoot, string shortcutRoot)
    {
        string path = UninstallPathFor(kind, shortcutRoot);
        if (path == null || !File.Exists(path)) return;
        (string Target, string Description, string Arguments) actual;
        try { actual = Read(path); }
        catch (Exception error) when (error is COMException || error is InvalidDataException) { return; }
        if (actual.Description == UninstallMarker(kind) && actual.Arguments == UninstallArguments(kind, installRoot)
            && IsVersionInstaller(actual.Target, installRoot)) File.Delete(path);
    }

    /// <summary>從 Windows Shell Link 讀取磁碟上的實際 TargetPath。</summary>
    public static string ReadTarget(string shortcutPath)
        => Read(shortcutPath).Target;

    public static string ReadArguments(string shortcutPath)
        => Read(shortcutPath).Arguments;

    private static (string Target, string Description, string Arguments) Read(string shortcutPath)
    {
        if (!File.Exists(shortcutPath)) throw new FileNotFoundException("快捷入口不存在。");
        dynamic shell = Activator.CreateInstance(Type.GetTypeFromProgID("WScript.Shell"));
        object shortcut = null;
        try
        {
            shortcut = shell.CreateShortcut(shortcutPath);
            string target = ((dynamic)shortcut).TargetPath;
            if (string.IsNullOrWhiteSpace(target)) throw new InvalidDataException("快捷入口目標無效。");
            string description = ((dynamic)shortcut).Description;
            string arguments = ((dynamic)shortcut).Arguments;
            return (target, description, arguments);
        }
        finally
        {
            if (shortcut != null && Marshal.IsComObject(shortcut)) Marshal.FinalReleaseComObject(shortcut);
            if (shell != null && Marshal.IsComObject(shell)) Marshal.FinalReleaseComObject(shell);
        }
    }

    private static void Save(string path, string target, string workingDirectory, string description, string arguments)
    {
        dynamic shell = Activator.CreateInstance(Type.GetTypeFromProgID("WScript.Shell"));
        object shortcut = null;
        try
        {
            shortcut = shell.CreateShortcut(path);
            ((dynamic)shortcut).TargetPath = target;
            ((dynamic)shortcut).WorkingDirectory = workingDirectory;
            ((dynamic)shortcut).Description = description;
            ((dynamic)shortcut).Arguments = arguments;
            ((dynamic)shortcut).Save();
        }
        finally
        {
            if (shortcut != null && Marshal.IsComObject(shortcut)) Marshal.FinalReleaseComObject(shortcut);
            if (shell != null && Marshal.IsComObject(shell)) Marshal.FinalReleaseComObject(shell);
        }
    }

    private static bool SameTarget(string actual, string expected)
    {
        try { return string.Equals(Path.GetFullPath(actual), Path.GetFullPath(expected), StringComparison.OrdinalIgnoreCase); }
        catch (Exception error) when (error is ArgumentException || error is NotSupportedException) { return false; }
    }

    private static string Marker(PackageKind kind)
        => "BrickHigh managed v1: " + InstallIdentity.For(kind).ApplicationId;

    private static string UninstallMarker(PackageKind kind)
        => "BrickHigh uninstall managed v1: " + InstallIdentity.For(kind).ApplicationId;

    private static string UninstallArguments(PackageKind kind, string installRoot)
        => "uninstall \"" + Path.GetFullPath(installRoot) + "\" " + kind;

    private static bool IsVersionInstaller(string target, string installRoot)
    {
        try
        {
            string relative = Path.GetRelativePath(Path.GetFullPath(installRoot), Path.GetFullPath(target)).Replace('\\', '/');
            var parts = relative.Split('/');
            return parts.Length == 4 && parts[0] == "versions" && parts[1].Length > 0
                && parts[1] != "." && parts[1] != ".." && parts[2] == "Installer"
                && parts[3] == "BrickHighInstaller.exe";
        }
        catch (Exception error) when (error is ArgumentException || error is NotSupportedException) { return false; }
    }
}
