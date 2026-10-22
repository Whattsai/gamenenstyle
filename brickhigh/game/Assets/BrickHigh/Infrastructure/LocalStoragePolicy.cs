using System;
using System.IO;
using System.Linq;
using System.Text;
using BrickHigh.Domain;

namespace BrickHigh.Infrastructure
{
    /// <summary>安裝內容與玩家可變資料的路徑隔離；所有可變資料只落在明確 LocalLow 根。</summary>
    public sealed class LocalStoragePaths
    {
        /// <summary>此產品的可寫資料根。</summary>
        public string Root { get; }
        /// <summary>玩家 profile 根；不得位於安裝目錄。</summary>
        public string ProfilesRoot { get; }
        /// <summary>本機診斷根；不得位於安裝目錄。</summary>
        public string DiagnosticsRoot { get; }

        internal LocalStoragePaths(string root)
        {
            Root = root;
            ProfilesRoot = Path.Combine(root, "Profiles");
            DiagnosticsRoot = Path.Combine(root, "Diagnostics");
        }
    }

    /// <summary>本機可變資料與診斷輸出的 fail-closed policy。</summary>
    public static class LocalStoragePolicy
    {
        /// <summary>診斷永不由此 policy 自動上傳；分享必須由外部明確使用者操作實作。</summary>
        public static bool AutomaticDiagnosticUploadEnabled => false;

        /// <summary>由安裝根與 Windows LocalLow 根推導固定可寫位置；兩者重疊一律拒絕。</summary>
        public static LocalStoragePaths Resolve(string installRoot, string localLowRoot, PackageKind kind)
        {
            if (string.IsNullOrWhiteSpace(installRoot) || string.IsNullOrWhiteSpace(localLowRoot)
                || !Path.IsPathRooted(installRoot) || !Path.IsPathRooted(localLowRoot))
                throw new ArgumentException("本機資料位置必須使用明確的絕對路徑。");

            string install = Normalize(installRoot);
            string localLow = Normalize(localLowRoot);
            string data = Normalize(InstallIdentity.For(kind).DataRoot(localLow));
            if (Overlaps(data, install))
                throw new InvalidOperationException("可變資料根不得與安裝內容重疊。");

            return new LocalStoragePaths(data);
        }

        /// <summary>只建立安全的 profile 檔案位置；拒絕子目錄、ADS 與相對跳脫。</summary>
        public static string ProfileFile(LocalStoragePaths paths, string fileName)
        {
            if (paths == null) throw new ArgumentNullException(nameof(paths));
            ValidateLeaf(fileName);
            return Path.Combine(paths.ProfilesRoot, fileName);
        }

        /// <summary>寫入最小本機啟動診斷；API 不接受 token、完整存檔、命令列或任意玩家內容。</summary>
        public static string WriteStartupDiagnostic(LocalStoragePaths paths, StartupFailure failure, DateTime utc,
            string diagnosticId = null)
        {
            if (paths == null) throw new ArgumentNullException(nameof(paths));
            if (!Enum.IsDefined(typeof(StartupFailure), failure)) throw new ArgumentOutOfRangeException(nameof(failure));
            if (utc.Kind != DateTimeKind.Utc) throw new ArgumentException("診斷時間必須為 UTC。", nameof(utc));

            string id = diagnosticId ?? Guid.NewGuid().ToString("N");
            if (!IsHexId(id)) throw new ArgumentException("診斷識別格式無效。", nameof(diagnosticId));

            Directory.CreateDirectory(paths.DiagnosticsRoot);
            string path = Path.Combine(paths.DiagnosticsRoot, id + ".json");
            string record = "{\"diagnosticId\":\"" + id
                + "\",\"failure\":\"" + failure
                + "\",\"time\":\"" + utc.ToString("O") + "\"}";
            using (var stream = new FileStream(path, FileMode.CreateNew, FileAccess.Write, FileShare.Read))
            using (var writer = new StreamWriter(stream, new UTF8Encoding(false)))
                writer.Write(record);
            return path;
        }

        private static string Normalize(string path) =>
            Path.GetFullPath(path).TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);

        private static bool Overlaps(string left, string right) =>
            Within(left, right) || Within(right, left);

        private static bool Within(string path, string root)
        {
            if (string.Equals(path, root, StringComparison.OrdinalIgnoreCase)) return true;
            string prefix = root + Path.DirectorySeparatorChar;
            return path.StartsWith(prefix, StringComparison.OrdinalIgnoreCase);
        }

        private static void ValidateLeaf(string value)
        {
            if (string.IsNullOrWhiteSpace(value) || value != Path.GetFileName(value)
                || value.IndexOfAny(new[] { '/', '\\', ':', '\0' }) >= 0
                || value == "." || value == ".." || value.TrimEnd(' ', '.') != value)
                throw new InvalidDataException("玩家資料檔名無效。");
        }

        private static bool IsHexId(string value) =>
            value != null && value.Length == 32 && value.All(c =>
                (c >= '0' && c <= '9') || (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F'));
    }
}
