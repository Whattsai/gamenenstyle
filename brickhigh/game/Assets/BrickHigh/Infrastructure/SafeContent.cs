using System;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Security.Cryptography;
using System.Text;

namespace BrickHigh.Infrastructure
{
    /// <summary>Windows 包內路徑及讀取期間的完整性保護。</summary>
    public static class SafeContent
    {
        /// <summary>解析相對 key；拒絕 junction、絕對路徑、ADS 與越界。</summary>
        public static string Resolve(string root, string key)
        {
            if (string.IsNullOrEmpty(key) || key.Contains('\\') || key.Contains(':') || key.Contains('\0') || Path.IsPathRooted(key)
                || key.Split('/').Any(p => p == ".." || p == "." || p.Length == 0 || p.TrimEnd(' ', '.') != p || Reserved(p)))
                throw new InvalidDataException("內容路徑無效。");
            var basePath = Path.GetFullPath(root).TrimEnd(Path.DirectorySeparatorChar) + Path.DirectorySeparatorChar;
            string candidate = Path.GetFullPath(Path.Combine(basePath, key));
            if (!candidate.StartsWith(basePath, StringComparison.OrdinalIgnoreCase)) throw new InvalidDataException("內容路徑越界。");
            string current = candidate;
            while (!string.IsNullOrEmpty(current))
            {
                if ((File.Exists(current) || Directory.Exists(current)) && (File.GetAttributes(current) & FileAttributes.ReparsePoint) != 0)
                    throw new InvalidDataException("內容包含重新解析節點。");
                current = Path.GetDirectoryName(current);
            }
            return candidate;
        }

        /// <summary>持有不可寫換的同一檔案，核對實際目的地後才讀取。</summary>
        public static FileStream OpenRead(string root, string key)
        {
            var stream = new FileStream(Resolve(root, key), FileMode.Open, FileAccess.Read, FileShare.Read);
            try
            {
                var buffer = new StringBuilder(32768);
                uint length = GetFinalPathNameByHandleW(stream.SafeFileHandle.DangerousGetHandle(), buffer, (uint)buffer.Capacity, 0);
                if (length == 0 || length >= buffer.Capacity) throw new InvalidDataException("無法確認實際檔案位置。");
                string final = buffer.ToString();
                if (final.StartsWith(@"\\?\UNC\", StringComparison.Ordinal)) final = @"\\" + final.Substring(8);
                else if (final.StartsWith(@"\\?\", StringComparison.Ordinal)) final = final.Substring(4);
                string prefix = Path.GetFullPath(root).TrimEnd(Path.DirectorySeparatorChar) + Path.DirectorySeparatorChar;
                if (!final.StartsWith(prefix, StringComparison.OrdinalIgnoreCase)) throw new InvalidDataException("實際檔案位於包外。");
                return stream;
            }
            catch { stream.Dispose(); throw; }
        }

        /// <summary>驗證實際 bytes，再將同一 bytes 交給資產載入器。</summary>
        public static byte[] ReadVerified(string root, string key, string expected)
        {
            using (var stream = OpenRead(root, key))
            using (var memory = new MemoryStream())
            {
                stream.CopyTo(memory);
                var data = memory.ToArray();
                if (!string.Equals(Hash(data), expected, StringComparison.Ordinal)) throw new InvalidDataException("資產雜湊不符。");
                return data;
            }
        }
        /// <summary>計算標準小寫 SHA-256。</summary>
        public static string Hash(byte[] data) { using (var sha = SHA256.Create()) return BitConverter.ToString(sha.ComputeHash(data)).Replace("-", "").ToLowerInvariant(); }
        private static bool Reserved(string part)
        {
            string stem = part.Split('.')[0].ToUpperInvariant();
            return new[] { "CON", "PRN", "AUX", "NUL", "CONIN$", "CONOUT$" }.Contains(stem)
                || (stem.Length == 4 && (stem.StartsWith("COM", StringComparison.Ordinal) || stem.StartsWith("LPT", StringComparison.Ordinal))
                    && "123456789¹²³".Contains(stem[3]));
        }
        [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
        private static extern uint GetFinalPathNameByHandleW(IntPtr handle, StringBuilder path, uint length, uint flags);
    }
}
