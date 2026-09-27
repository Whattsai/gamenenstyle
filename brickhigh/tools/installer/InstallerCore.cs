using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using BrickHigh.Domain;
using BrickHigh.Infrastructure;

/// <summary>安裝結果；非成功狀態不切換可啟動版本。</summary>
public enum InstallResult { Installed = 0, Uninstalled = 1, Corrupt = 4, StorageUnavailable = 5, Busy = 7, UninstalledWithResidual = 8 }

/// <summary>僅供核心測試觀察原子切換前邊界。</summary>
public enum InstallPhase { BeforeSwitch }

/// <summary>安裝視窗所需的已核對包身分；完整內容仍由 Install 再驗證。</summary>
public sealed class InstallPackageInfo
{
    public PackageKind Kind { get; }
    public string Purpose { get; }
    internal InstallPackageInfo(PackageKind kind, string purpose) { Kind = kind; Purpose = purpose; }
}

/// <summary>完整離線包及版本化安裝指標的交易協調。</summary>
public static class InstallerCore
{
    private static readonly JsonSerializerOptions JsonOptions = new JsonSerializerOptions
    {
        PropertyNameCaseInsensitive = true,
        WriteIndented = false
    };
    private static readonly Regex BuildName = new Regex(@"^[A-Za-z0-9_-][A-Za-z0-9._-]{0,127}$", RegexOptions.CultureInvariant);
    private static readonly Regex Sha256 = new Regex("^[0-9a-f]{64}$", RegexOptions.CultureInvariant);

    /// <summary>只讀固定 Package 根的包身分；缺檔或損毀回 null，不建立安裝目錄。</summary>
    public static InstallPackageInfo Inspect(string packageRoot)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(packageRoot) || !Path.IsPathRooted(packageRoot)) return null;
            var index = ReadIndex(Path.GetFullPath(packageRoot));
            return new InstallPackageInfo(Enum.Parse<PackageKind>(index.PackageKind),
                index.InternalPurpose ?? index.Purpose);
        }
        catch (Exception error) when (error is IOException || error is InvalidDataException
            || error is JsonException || error is ArgumentException || error is UnauthorizedAccessException)
        { return null; }
    }

    /// <summary>逐件驗證完整包，在同一生命週期鎖內建立新版本並切換 installation.json。</summary>
    public static InstallResult Install(string packageRoot, string installRoot, Action<InstallPhase> checkpoint = null,
        string shortcutRoot = null)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(packageRoot) || string.IsNullOrWhiteSpace(installRoot)
                || !Path.IsPathRooted(packageRoot) || !Path.IsPathRooted(installRoot)) return InstallResult.Corrupt;
            packageRoot = Path.GetFullPath(packageRoot);
            installRoot = Path.GetFullPath(installRoot);
            if (Overlaps(packageRoot, installRoot)) return InstallResult.Corrupt;
            using (var guardedIndex = SafeContent.OpenRead(packageRoot, "package-index.json"))
            {
                var index = ReadIndex(guardedIndex, packageRoot);
                string indexHash = HashStream(guardedIndex).Hash;
                var identity = Identity(index);
                using (var lifecycle = InstallLifecycle.TryAcquire(identity, installRoot))
                {
                if (lifecycle == null) return InstallResult.Busy;
                ValidatePayload(packageRoot, index, includeLauncher: true);
                Directory.CreateDirectory(installRoot);
                string pointer = SafeContent.Resolve(installRoot, "installation.json");
                if (File.Exists(pointer))
                {
                    var previous = ReadPointer(installRoot);
                    if (previous.ApplicationId != identity.ApplicationId || previous.PackageKind != index.PackageKind)
                        throw new InvalidDataException("安裝身分不相符。");
                }
                string launcherKey = "BrickHighLauncher.exe";
                string launcher = SafeContent.Resolve(installRoot, launcherKey);
                string launcherHash = index.Files.Single(x => x.Key == launcherKey).Sha256;
                if (File.Exists(launcher) && HashFile(installRoot, launcherKey).Hash != launcherHash)
                    throw new InvalidDataException("啟動器版本不同，不能覆寫執行中的入口。");

                string versionKey = "versions/" + index.BuildId;
                string version = SafeContent.Resolve(installRoot, versionKey);
                if (Directory.Exists(version))
                {
                    ValidatePayload(version, index, includeLauncher: false);
                    if (HashFile(version, "package-index.json").Hash != indexHash)
                        throw new InvalidDataException("同一 buildId 的索引不同。");
                }
                else
                {
                    string stagedKey = "versions/.stage-" + Guid.NewGuid().ToString("N");
                    string staged = SafeContent.Resolve(installRoot, stagedKey);
                    Directory.CreateDirectory(staged);
                    foreach (var file in index.Files.Where(x => x.Key != launcherKey))
                    {
                        string target = SafeContent.Resolve(staged, file.Key);
                        Directory.CreateDirectory(Path.GetDirectoryName(target));
                        using (var source = SafeContent.OpenRead(packageRoot, file.Key))
                        using (var output = new FileStream(target, FileMode.CreateNew, FileAccess.Write, FileShare.None))
                            source.CopyTo(output);
                    }
                    guardedIndex.Position = 0;
                    using (var output = new FileStream(SafeContent.Resolve(staged, "package-index.json"),
                        FileMode.CreateNew, FileAccess.Write, FileShare.None)) guardedIndex.CopyTo(output);
                    ValidatePayload(staged, index, includeLauncher: false);
                    if (HashFile(staged, "package-index.json").Hash != indexHash)
                        throw new InvalidDataException("staging 索引不符。");
                    Directory.Move(staged, version);
                }

                if (!File.Exists(launcher))
                {
                    string temporary = SafeContent.Resolve(installRoot, ".launcher-" + Guid.NewGuid().ToString("N"));
                    using (var source = SafeContent.OpenRead(packageRoot, launcherKey))
                    using (var output = new FileStream(temporary, FileMode.CreateNew, FileAccess.Write, FileShare.None))
                        source.CopyTo(output);
                    if (HashFile(installRoot, Path.GetFileName(temporary)).Hash != launcherHash)
                        throw new InvalidDataException("啟動器雜湊不符。");
                    File.Move(temporary, launcher);
                }

                var player = index.Files.Single(x => x.Key == index.PlayerKey);
                var next = new InstallPointer
                {
                    ApplicationId = index.ApplicationId, PackageKind = index.PackageKind, BuildId = index.BuildId,
                    PlayerKey = versionKey + "/" + index.PlayerKey,
                    PlayerSha256 = player.Sha256, LauncherSha256 = launcherHash
                };
                string pointerTemp = SafeContent.Resolve(installRoot, ".installation-" + Guid.NewGuid().ToString("N"));
                File.WriteAllBytes(pointerTemp, JsonSerializer.SerializeToUtf8Bytes(next, JsonOptions));
                var guards = new List<FileStream>();
                bool shortcutCreated = false;
                Action rollbackUninstallShortcut = null;
                bool switched = false;
                try
                {
                    foreach (var file in index.Files.Where(x => x.Key != launcherKey))
                        guards.Add(OpenGuard(version, file.Key, file.Sha256, file.ByteLength));
                    guards.Add(OpenGuard(version, "package-index.json", indexHash, null));
                    guards.Add(OpenGuard(installRoot, launcherKey, launcherHash, null));
                    shortcutCreated = ShortcutPolicy.Ensure(Enum.Parse<PackageKind>(index.PackageKind), installRoot, shortcutRoot);
                    rollbackUninstallShortcut = ShortcutPolicy.EnsureUninstall(
                        Enum.Parse<PackageKind>(index.PackageKind), installRoot, index.BuildId, shortcutRoot);
                    checkpoint?.Invoke(InstallPhase.BeforeSwitch);
                    if (File.Exists(pointer)) File.Replace(pointerTemp, pointer, null);
                    else File.Move(pointerTemp, pointer);
                    switched = true;
                    return InstallResult.Installed;
                }
                finally
                {
                    foreach (var guard in guards) guard.Dispose();
                    if (!switched && shortcutCreated)
                        ShortcutPolicy.RemoveIfOwned(Enum.Parse<PackageKind>(index.PackageKind), installRoot, shortcutRoot);
                    if (!switched) rollbackUninstallShortcut?.Invoke();
                }
                }
            }
        }
        catch (InvalidDataException) { return InstallResult.Corrupt; }
        catch (JsonException) { return InstallResult.Corrupt; }
        catch (ArgumentException) { return InstallResult.Corrupt; }
        catch (FileNotFoundException) { return InstallResult.Corrupt; }
        catch (DirectoryNotFoundException) { return InstallResult.Corrupt; }
        catch (UnauthorizedAccessException) { return InstallResult.StorageUnavailable; }
        catch (IOException) { return InstallResult.StorageUnavailable; }
    }

    /// <summary>僅移除指標、已索引內容及入口；未知檔案與根外 profile 保留。</summary>
    public static InstallResult Uninstall(string installRoot, PackageKind kind, string shortcutRoot = null)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(installRoot) || !Path.IsPathRooted(installRoot)) return InstallResult.Corrupt;
            installRoot = Path.GetFullPath(installRoot);
            var identity = InstallIdentity.For(kind);
            using (var lifecycle = InstallLifecycle.TryAcquire(identity, installRoot))
            {
                if (lifecycle == null) return InstallResult.Busy;
                var pointer = ReadPointer(installRoot);
                if (pointer.ApplicationId != identity.ApplicationId || pointer.PackageKind != kind.ToString())
                    throw new InvalidDataException("安裝身分不相符。");
                string pointerFile = SafeContent.Resolve(installRoot, "installation.json");
                File.Delete(pointerFile);
                string launcherKey = "BrickHighLauncher.exe";
                string launcher = SafeContent.Resolve(installRoot, launcherKey);
                if (File.Exists(launcher) && HashFile(installRoot, launcherKey).Hash == pointer.LauncherSha256)
                    File.Delete(launcher);
                string versions = SafeContent.Resolve(installRoot, "versions");
                bool retainedRunningInstaller = false;
                if (Directory.Exists(versions))
                    foreach (string version in Directory.EnumerateDirectories(versions))
                    {
                        if ((File.GetAttributes(version) & FileAttributes.ReparsePoint) != 0) continue;
                        string indexFile = SafeContent.Resolve(version, "package-index.json");
                        if (!File.Exists(indexFile)) continue;
                        PackageIndex index;
                        try { index = ReadIndex(version, requireUninstaller: false); }
                        catch (Exception error) when (error is InvalidDataException || error is JsonException
                            || error is IOException) { continue; }
                        if (index.ApplicationId != identity.ApplicationId) continue;
                        foreach (var file in index.Files.Where(x => x.Key != launcherKey))
                        {
                            string target = SafeContent.Resolve(version, file.Key);
                            if (SamePath(target, Environment.ProcessPath))
                            {
                                retainedRunningInstaller = true;
                                continue;
                            }
                            if (File.Exists(target) && HashFile(version, file.Key).Hash == file.Sha256)
                                File.Delete(target);
                        }
                        File.Delete(indexFile);
                        RemoveEmptyDirectories(version);
                    }
                if (Directory.Exists(versions) && !Directory.EnumerateFileSystemEntries(versions).Any()) Directory.Delete(versions);
                ShortcutPolicy.RemoveIfOwned(kind, installRoot, shortcutRoot);
                ShortcutPolicy.RemoveUninstallIfOwned(kind, installRoot, shortcutRoot);
                return retainedRunningInstaller ? InstallResult.UninstalledWithResidual : InstallResult.Uninstalled;
            }
        }
        catch (InvalidDataException) { return InstallResult.Corrupt; }
        catch (JsonException) { return InstallResult.Corrupt; }
        catch (ArgumentException) { return InstallResult.Corrupt; }
        catch (FileNotFoundException) { return InstallResult.Corrupt; }
        catch (DirectoryNotFoundException) { return InstallResult.Corrupt; }
        catch (UnauthorizedAccessException) { return InstallResult.StorageUnavailable; }
        catch (IOException) { return InstallResult.StorageUnavailable; }
    }

    private static bool Overlaps(string left, string right)
    {
        string a = left.TrimEnd(Path.DirectorySeparatorChar) + Path.DirectorySeparatorChar;
        string b = right.TrimEnd(Path.DirectorySeparatorChar) + Path.DirectorySeparatorChar;
        return a.StartsWith(b, StringComparison.OrdinalIgnoreCase) || b.StartsWith(a, StringComparison.OrdinalIgnoreCase);
    }

    private static bool SamePath(string left, string right)
        => right != null && string.Equals(Path.GetFullPath(left), Path.GetFullPath(right), StringComparison.OrdinalIgnoreCase);

    private static InstallIdentity Identity(PackageIndex index)
    {
        if (!Enum.TryParse(index.PackageKind, false, out PackageKind kind))
            throw new InvalidDataException("包身分無效。");
        var identity = InstallIdentity.For(kind);
        if (index.ApplicationId != identity.ApplicationId) throw new InvalidDataException("包身分不相符。");
        return identity;
    }

    private static PackageIndex ReadIndex(string root, bool requireUninstaller = true)
    {
        using (var source = SafeContent.OpenRead(root, "package-index.json"))
            return ReadIndex(source, root, requireUninstaller);
    }

    private static PackageIndex ReadIndex(Stream source, string root, bool requireUninstaller = true)
    {
            source.Position = 0;
            var index = JsonSerializer.Deserialize<PackageIndex>(source, JsonOptions);
            if (index == null || string.IsNullOrWhiteSpace(index.ApplicationId)
                || string.IsNullOrWhiteSpace(index.PackageKind) || string.IsNullOrWhiteSpace(index.BuildId)
                || !BuildName.IsMatch(index.BuildId) || index.BuildId == "." || index.BuildId == ".."
                || string.IsNullOrWhiteSpace(index.PlayerKey) || index.Files == null || index.Files.Count < 2)
                throw new InvalidDataException("安裝索引不完整。");
            Identity(index);
            var keys = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            foreach (var file in index.Files)
            {
                if (file == null || string.IsNullOrWhiteSpace(file.Key) || file.ByteLength < 0
                    || string.IsNullOrEmpty(file.Sha256) || !Sha256.IsMatch(file.Sha256)
                    || file.Key == "package-index.json" || !keys.Add(file.Key))
                    throw new InvalidDataException("安裝檔案索引無效。");
                SafeContent.Resolve(root, file.Key);
            }
            if (!index.Files.Any(x => x.Key == "BrickHighLauncher.exe")
                || !index.Files.Any(x => x.Key == index.PlayerKey)
                || (requireUninstaller && !index.Files.Any(x => x.Key == "Installer/BrickHighInstaller.exe"))
                || !index.PlayerKey.StartsWith("Player/", StringComparison.Ordinal))
                throw new InvalidDataException("安裝入口缺失。");
            return index;
    }

    private static InstallPointer ReadPointer(string root)
    {
        using (var source = SafeContent.OpenRead(root, "installation.json"))
        {
            var data = JsonSerializer.Deserialize<InstallPointer>(source, JsonOptions);
            if (data == null || string.IsNullOrEmpty(data.ApplicationId) || string.IsNullOrEmpty(data.PackageKind)
                || string.IsNullOrEmpty(data.BuildId) || string.IsNullOrEmpty(data.PlayerKey)
                || string.IsNullOrEmpty(data.PlayerSha256) || string.IsNullOrEmpty(data.LauncherSha256))
                throw new InvalidDataException("安裝指標無效。");
            SafeContent.Resolve(root, data.PlayerKey);
            return data;
        }
    }

    private static void ValidatePayload(string root, PackageIndex index, bool includeLauncher)
    {
        var expected = new HashSet<string>(index.Files.Where(x => includeLauncher || x.Key != "BrickHighLauncher.exe")
            .Select(x => x.Key), StringComparer.OrdinalIgnoreCase) { "package-index.json" };
        var actual = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (string key in EnumerateFiles(root)) actual.Add(key);
        if (!actual.SetEquals(expected)) throw new InvalidDataException("安裝內容清單不完整或有多餘檔案。");
        foreach (var file in index.Files.Where(x => includeLauncher || x.Key != "BrickHighLauncher.exe"))
        {
            var found = HashFile(root, file.Key);
            if (found.Length != file.ByteLength || found.Hash != file.Sha256)
                throw new InvalidDataException("安裝內容雜湊或長度不符。");
        }
    }

    private static IEnumerable<string> EnumerateFiles(string root, string baseRoot = null)
    {
        if (baseRoot == null) baseRoot = root;
        foreach (string entry in Directory.EnumerateFileSystemEntries(root))
        {
            if ((File.GetAttributes(entry) & FileAttributes.ReparsePoint) != 0)
                throw new InvalidDataException("安裝內容含重新解析節點。");
            if (Directory.Exists(entry))
            {
                foreach (var child in EnumerateFiles(entry, baseRoot)) yield return child;
            }
            else yield return Path.GetRelativePath(baseRoot, entry).Replace('\\', '/');
        }
    }

    private static (string Hash, long Length) HashFile(string root, string key)
    {
        using (var source = SafeContent.OpenRead(root, key))
            return HashStream(source);
    }

    private static (string Hash, long Length) HashStream(Stream source)
    {
        source.Position = 0;
        using (var sha = SHA256.Create())
        {
            byte[] hash = sha.ComputeHash(source);
            return (BitConverter.ToString(hash).Replace("-", "").ToLowerInvariant(), source.Length);
        }
    }

    private static FileStream OpenGuard(string root, string key, string expectedHash, long? expectedLength)
    {
        var stream = SafeContent.OpenRead(root, key);
        var found = HashStream(stream);
        if (found.Hash != expectedHash || (expectedLength.HasValue && found.Length != expectedLength.Value))
        {
            stream.Dispose();
            throw new InvalidDataException("切換前安裝內容已改變。");
        }
        return stream;
    }

    private static void RemoveEmptyDirectories(string root)
    {
        foreach (string child in Directory.EnumerateDirectories(root))
        {
            if ((File.GetAttributes(child) & FileAttributes.ReparsePoint) != 0) continue;
            RemoveEmptyDirectories(child);
        }
        if (!Directory.EnumerateFileSystemEntries(root).Any()) Directory.Delete(root);
    }

    private sealed class PackageIndex
    {
        [JsonPropertyName("applicationId")] public string ApplicationId { get; set; }
        [JsonPropertyName("packageKind")] public string PackageKind { get; set; }
        [JsonPropertyName("buildId")] public string BuildId { get; set; }
        [JsonPropertyName("playerKey")] public string PlayerKey { get; set; }
        [JsonPropertyName("purpose")] public string Purpose { get; set; }
        [JsonPropertyName("internalPurpose")] public string InternalPurpose { get; set; }
        [JsonPropertyName("files")] public List<IndexedFile> Files { get; set; }
    }

    private sealed class IndexedFile
    {
        [JsonPropertyName("key")] public string Key { get; set; }
        [JsonPropertyName("sha256")] public string Sha256 { get; set; }
        [JsonPropertyName("byteLength")] public long ByteLength { get; set; }
    }

    private sealed class InstallPointer
    {
        [JsonPropertyName("applicationId")] public string ApplicationId { get; set; }
        [JsonPropertyName("packageKind")] public string PackageKind { get; set; }
        [JsonPropertyName("buildId")] public string BuildId { get; set; }
        [JsonPropertyName("playerKey")] public string PlayerKey { get; set; }
        [JsonPropertyName("playerSha256")] public string PlayerSha256 { get; set; }
        [JsonPropertyName("launcherSha256")] public string LauncherSha256 { get; set; }
    }
}
