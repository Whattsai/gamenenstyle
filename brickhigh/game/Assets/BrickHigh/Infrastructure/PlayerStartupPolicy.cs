using System;
using System.IO;
using System.Security.Cryptography;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using BrickHigh.Domain;

namespace BrickHigh.Infrastructure
{
    /// <summary>核對受控啟動的安裝指標、實際執行檔及編譯版本；不建立任何玩家資料。</summary>
    public static class PlayerStartupPolicy
    {
        /// <summary>此檢查通過後仍須完成一次性啟動器管線授權。</summary>
        public static bool ValidateInstallation(string root, string actualPlayer, string compiledBuildId, PackageKind kind)
        {
            if (string.IsNullOrWhiteSpace(root) || !Path.IsPathRooted(root) || string.IsNullOrWhiteSpace(actualPlayer)
                || string.IsNullOrWhiteSpace(compiledBuildId)) return false;
            try
            {
                JObject manifest;
                using (var input = SafeContent.OpenRead(root, "installation.json"))
                using (var reader = new StreamReader(input)) manifest = JObject.Parse(reader.ReadToEnd(),
                    new JsonLoadSettings { DuplicatePropertyNameHandling = DuplicatePropertyNameHandling.Error });
                if ((string)manifest["applicationId"] != InstallIdentity.For(kind).ApplicationId
                    || (string)manifest["packageKind"] != kind.ToString() || (string)manifest["buildId"] != compiledBuildId) return false;
                string key = (string)manifest["playerKey"];
                if (!string.Equals(SafeContent.Resolve(root, key), Path.GetFullPath(actualPlayer), StringComparison.OrdinalIgnoreCase)) return false;
                using (var file = SafeContent.OpenRead(root, key))
                using (var sha = SHA256.Create())
                    return BitConverter.ToString(sha.ComputeHash(file)).Replace("-", "").ToLowerInvariant() == (string)manifest["playerSha256"];
            }
            catch (Exception error) when (error is IOException || error is InvalidDataException || error is UnauthorizedAccessException || error is ArgumentException
                || error is JsonException || error is InvalidCastException || error is InvalidOperationException)
            { return false; }
        }
    }
}
