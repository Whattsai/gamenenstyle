using System;
using System.Security.Cryptography;
using System.Text;

namespace BrickHigh.Infrastructure
{
    /// <summary>RuntimeBuild 的內容位址身分；同一 source revision 可因執行期工具鏈或輸出改變而形成新 build。</summary>
    public static class RuntimeBuildPolicy
    {
        /// <summary>以不可變建置輸入與驗證摘要計算穩定 RuntimeBuild ID。</summary>
        public static string ComputeIdentity(string sourceRevisionId, string buildTarget, string editorVersion,
            string packageLockDigest, string coordinateProfile, string contentDigest, string validationDigest)
        {
            if (!Guid.TryParse(sourceRevisionId, out var revision) || revision == Guid.Empty
                || string.IsNullOrWhiteSpace(buildTarget) || string.IsNullOrWhiteSpace(editorVersion)
                || string.IsNullOrWhiteSpace(coordinateProfile)
                || !IsDigest(packageLockDigest) || !IsDigest(contentDigest) || !IsDigest(validationDigest))
                throw new ArgumentException("RuntimeBuild identity input is invalid.");

            string payload = Encode(revision.ToString(), buildTarget, editorVersion, packageLockDigest,
                coordinateProfile, contentDigest, validationDigest);
            using (var sha = SHA256.Create())
            {
                byte[] hash = sha.ComputeHash(Encoding.UTF8.GetBytes(payload));
                var builder = new StringBuilder(hash.Length * 2);
                foreach (byte value in hash) builder.Append(value.ToString("x2"));
                return builder.ToString();
            }
        }

        internal static bool IsDigest(string value)
        {
            if (value == null || value.Length != 64) return false;
            foreach (char c in value)
                if (!((c >= '0' && c <= '9') || (c >= 'a' && c <= 'f'))) return false;
            return true;
        }

        private static string Encode(params string[] values)
        {
            var builder = new StringBuilder();
            foreach (string value in values)
                builder.Append(value.Length).Append(':').Append(value);
            return builder.ToString();
        }
    }
}
