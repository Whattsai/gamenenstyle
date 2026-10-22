using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Newtonsoft.Json.Linq;

namespace BrickHigh.Infrastructure
{
    /// <summary>開啟前核對發行檔案索引；bundle 內容仍須於每次新載入核對實際 bytes。</summary>
    internal static class ReleaseFileIndex
    {
        internal static void ValidateHeader(JObject manifest)
        {
            foreach (var key in new[] { "appVersion", "editorVersion", "coordinateProfile" })
                if (manifest[key]?.Type != JTokenType.String || string.IsNullOrWhiteSpace((string)manifest[key]))
                    throw new InvalidDataException();
            foreach (var key in new[] { "readerVersion", "catalogSchemaVersion", "assetContractVersion" })
                PositiveInteger(manifest[key]);
            foreach (var key in new[] { "catalogDbSha256", "packageLockDigest", "sourceSelectionDigest" })
                Digest(manifest[key]);
            if (!(manifest["compatibleSaveVersions"] is JArray versions) || versions.Count == 0)
                throw new InvalidDataException();
            foreach (var version in versions) PositiveInteger(version);
            if (versions.Select(x => (int)x).Distinct().Count() != versions.Count) throw new InvalidDataException();
            if ((string)manifest["packageKind"] == "Preview")
            {
                if (!(manifest["previewCompleteness"] is JObject preview) || preview["incomplete"]?.Type != JTokenType.Boolean
                    || (bool)preview["incomplete"] != true) throw new InvalidDataException();
            }
            else if (manifest["previewCompleteness"]?.Type != JTokenType.Null) throw new InvalidDataException();
        }

        internal static void ValidateRuntimeBuildIdentity(JObject manifest, NativeSqlite db)
        {
            string editorVersion = (string)manifest["editorVersion"];
            string packageLockDigest = (string)manifest["packageLockDigest"];
            string coordinateProfile = (string)manifest["coordinateProfile"];
            string buildTarget = (string)manifest["buildTarget"];
            var builds = db.Query(@"SELECT b.runtime_build_id,b.source_revision_id,b.build_target,b.editor_version,
                b.package_lock_digest,b.coordinate_profile,b.content_digest,b.validation_digest,
                b.bundle_key,f.sha256 AS bundle_sha256
                FROM runtime_builds b JOIN runtime_files f ON f.storage_key=b.bundle_key
                WHERE f.kind='AssetBundle'");
            if (builds.Count == 0) throw new InvalidDataException();
            foreach (var build in builds)
            {
                string expectedIdentity;
                try
                {
                    expectedIdentity = RuntimeBuildPolicy.ComputeIdentity(
                        build["source_revision_id"], build["build_target"], build["editor_version"],
                        build["package_lock_digest"], build["coordinate_profile"],
                        build["content_digest"], build["validation_digest"]);
                }
                catch (ArgumentException)
                {
                    throw new InvalidDataException();
                }
                if (build["runtime_build_id"] != expectedIdentity
                    || build["build_target"] != buildTarget
                    || build["editor_version"] != editorVersion
                    || build["package_lock_digest"] != packageLockDigest
                    || build["coordinate_profile"] != coordinateProfile
                    || build["content_digest"] != build["bundle_sha256"])
                    throw new InvalidDataException();
            }
        }

        internal static bool ValidateFiles(string root, JObject manifest, NativeSqlite db)
        {
            if (!(manifest["files"] is JArray files) || files.Count == 0) throw new InvalidDataException();
            var index = new Dictionary<string, JObject>(StringComparer.OrdinalIgnoreCase);
            foreach (var token in files)
            {
                if (!(token is JObject file) || file["storageKey"]?.Type != JTokenType.String
                    || file["kind"]?.Type != JTokenType.String || file["byteLength"]?.Type != JTokenType.Integer)
                    throw new InvalidDataException();
                string key = (string)file["storageKey"];
                SafeContent.Resolve(root, key);
                Digest(file["sha256"]);
                if ((long)file["byteLength"] < 0 || string.IsNullOrWhiteSpace((string)file["kind"])
                    || index.ContainsKey(key) || key.Equals("catalog.db", StringComparison.OrdinalIgnoreCase)
                    || key.Equals("release-manifest.json", StringComparison.OrdinalIgnoreCase)) throw new InvalidDataException();
                index.Add(key, file);
            }
            if (!index.Values.Any(x => (string)x["kind"] == "LocalCatalog")) throw new InvalidDataException();
            var rows = db.Query("SELECT storage_key,sha256,byte_length,kind FROM runtime_files");
            if (rows.Count != index.Count) throw new InvalidDataException();
            foreach (var row in rows)
            {
                if (!index.TryGetValue(row["storage_key"], out var file) || (string)file["storageKey"] != row["storage_key"]
                    || (string)file["sha256"] != row["sha256"] || (string)file["kind"] != row["kind"]
                    || !long.TryParse(row["byte_length"], out long size) || size != (long)file["byteLength"])
                    throw new InvalidDataException();
            }
            foreach (var build in db.Query("SELECT bundle_key FROM runtime_builds"))
                if (!index.TryGetValue(build["bundle_key"], out var file) || (string)file["kind"] != "AssetBundle"
                    || (string)file["storageKey"] != build["bundle_key"]) throw new InvalidDataException();
            foreach (var entry in index)
            {
                try
                {
                    using (var stream = SafeContent.OpenRead(root, entry.Key))
                        if (stream.Length != (long)entry.Value["byteLength"]) throw new InvalidDataException();
                    // 索引小檔先驗完整內容；大 bundle 不在啟動時全部讀入記憶體。
                    if ((string)entry.Value["kind"] == "LocalCatalog")
                        SafeContent.ReadVerified(root, entry.Key, (string)entry.Value["sha256"]);
                }
                catch (FileNotFoundException) { return false; }
                catch (DirectoryNotFoundException) { return false; }
            }
            return true;
        }

        private static void PositiveInteger(JToken value)
        {
            if (value?.Type != JTokenType.Integer || (long)value < 1 || (long)value > int.MaxValue)
                throw new InvalidDataException();
        }
        private static bool IsDigest(string text) =>
            text != null && text.Length == 64 && text.All(c => (c >= '0' && c <= '9') || (c >= 'a' && c <= 'f'));

        private static void Digest(JToken value)
        {
            if (value?.Type != JTokenType.String || !IsDigest((string)value))
                throw new InvalidDataException();
        }
    }
}
