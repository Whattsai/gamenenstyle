using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using BrickHigh.Domain;

namespace BrickHigh.Infrastructure
{
    /// <summary>包內原生 SQLite 讀取；背景 IO 與 Unity 物件完全分離。</summary>
    public sealed class BrickCatalog : IBrickCatalog
    {
        private readonly string root;
        private readonly PackageKind kind;
        private readonly object owner = new object();
        private const string Target = "windows-x64";
        private const string PreviewMessage = "此資產包僅供技術預覽，不能作為正式遊戲資料。";
        private const string SelectVariant = @"SELECT v.*,m.metadata_json,m.runtime_build_id,
            CASE WHEN json_extract(v.display_json,'$.partNumber')=? THEN 0 ELSE 1 END AS match_rank
            FROM runtime_variants v JOIN runtime_models m ON m.snapshot_id=v.snapshot_id
            AND m.variant_id=v.variant_id AND m.revision_id=v.selected_revision_id AND m.build_target=?";

        /// <summary>種類來自編譯時的 bootstrap，不由玩家設定指定。</summary>
        public BrickCatalog(string root, PackageKind kind)
        {
            if (!Enum.IsDefined(typeof(PackageKind), kind)) throw new ArgumentOutOfRangeException(nameof(kind));
            this.root = Path.GetFullPath(root); this.kind = kind;
        }

        /// <summary>先驗 manifest、實際 DB hash、schema 與完整引用，再交出 session。</summary>
        public Task<CatalogResult<CatalogSession>> OpenAsync(CancellationToken cancellationToken)
        {
            if (cancellationToken.IsCancellationRequested) return Cancelled<CatalogSession>();
            return Task.Run(() => Safe(() =>
            {
                cancellationToken.ThrowIfCancellationRequested();
                JObject manifest;
                using (var stream = SafeContent.OpenRead(root, "release-manifest.json"))
                using (var reader = new StreamReader(stream, new UTF8Encoding(false, true))) manifest = JObject.Parse(reader.ReadToEnd());
                if ((int?)manifest["catalogSchemaVersion"] != 1 || (int?)manifest["assetContractVersion"] != 1)
                    return CatalogResult<CatalogSession>.Failure(CatalogErrorCode.UnsupportedSchema);
                if ((string)manifest["packageKind"] != kind.ToString())
                    return CatalogResult<CatalogSession>.Failure(CatalogErrorCode.IncompatibleContent,
                        kind == PackageKind.Release && (string)manifest["packageKind"] == "Preview" ? PreviewMessage : null);
                string applicationId = kind == PackageKind.Preview ? "com.gamenenstyle.brickhigh.preview" : "com.gamenenstyle.brickhigh";
                if ((string)manifest["applicationId"] != applicationId || (string)manifest["buildTarget"] != Target)
                    return CatalogResult<CatalogSession>.Failure(CatalogErrorCode.IncompatibleContent);
                if ((string)manifest["sourceSnapshotStatus"] != (kind == PackageKind.Preview ? "Frozen" : "Published"))
                    return CatalogResult<CatalogSession>.Failure(CatalogErrorCode.CatalogNotPublished);
                if (!Guid.TryParse((string)manifest["currentSnapshotId"], out Guid snapshot) || snapshot == Guid.Empty
                    || string.IsNullOrWhiteSpace((string)manifest["packId"])) throw new InvalidDataException();
                FileStream guard = null;
                try
                {
                    guard = SafeContent.OpenRead(root, "catalog.db");
                    using (var sha = SHA256.Create())
                    {
                        string hash = BitConverter.ToString(sha.ComputeHash(guard)).Replace("-", "").ToLowerInvariant();
                        if (hash != (string)manifest["catalogDbSha256"]) throw new InvalidDataException();
                    }
                    cancellationToken.ThrowIfCancellationRequested();
                    using (var db = new NativeSqlite(Path.Combine(root, "catalog.db")))
                    {
                        if (db.Query("PRAGMA integrity_check").Any(row => row["integrity_check"] != "ok") || db.Query("PRAGMA foreign_key_check").Count != 0)
                            throw new InvalidDataException();
                        var meta = db.Query("SELECT key,value FROM runtime_meta").ToDictionary(row => row["key"], row => row["value"]);
                        if (!meta.TryGetValue("schemaVersion", out string schema) || schema != "1"
                            || !meta.TryGetValue("minReaderVersion", out string minReader) || !int.TryParse(minReader, out int minimum) || minimum > 1)
                            return CatalogResult<CatalogSession>.Failure(CatalogErrorCode.UnsupportedSchema);
                        foreach (string field in new[] { "packId", "currentSnapshotId", "applicationId", "packageKind", "buildTarget", "sourceSnapshotStatus", "assetContractVersion" })
                            if (!meta.TryGetValue(field, out string value) || value != (string)manifest[field])
                                return CatalogResult<CatalogSession>.Failure(CatalogErrorCode.IncompatibleContent);
                        if (db.Query("SELECT snapshot_id FROM runtime_snapshots WHERE snapshot_id=?", snapshot.ToString()).Count != 1)
                            throw new InvalidDataException();
                        if (db.Query(@"SELECT v.variant_id FROM runtime_variants v LEFT JOIN runtime_models m
                            ON v.snapshot_id=m.snapshot_id AND v.variant_id=m.variant_id AND v.selected_revision_id=m.revision_id
                            AND m.build_target=? WHERE m.runtime_build_id IS NULL LIMIT 1", Target).Count != 0)
                            throw new InvalidDataException();
                    }
                    cancellationToken.ThrowIfCancellationRequested();
                    var session = new CatalogSession(owner, (string)manifest["packId"], snapshot, 1, kind, guard);
                    guard = null;
                    return CatalogResult<CatalogSession>.Success(session);
                }
                finally { guard?.Dispose(); }
            }, opening: true));
        }

        /// <summary>參數化條件與 cursor，精確貨號優先後依 variantId 排序。</summary>
        public Task<CatalogResult<VariantPage>> QueryAsync(CatalogSession session, VariantQuery query, CancellationToken cancellationToken)
        {
            if (cancellationToken.IsCancellationRequested) return Cancelled<VariantPage>();
            var copy = query?.Copy();
            var error = CatalogInputPolicy.Validate(copy);
            if (!Valid(session) || error.HasValue || (kind == PackageKind.Preview && copy.Purpose != CatalogPurpose.Browse))
                return Task.FromResult(CatalogResult<VariantPage>.Failure(!Valid(session) ? CatalogErrorCode.InvalidQuery : error ?? CatalogErrorCode.InvalidQuery));
            string filter = SafeContent.Hash(Encoding.UTF8.GetBytes(new JArray(copy.QueryText ?? "", copy.Family ?? "", copy.Tier?.ToString() ?? "",
                copy.Slot?.ToString() ?? "", copy.Purpose.ToString(), copy.BuildSystem ?? "").ToString(Formatting.None)));
            int lastRank = -1; string lastId = "";
            if (!string.IsNullOrEmpty(copy.Cursor))
            {
                try
                {
                    var cursor = JObject.Parse(Encoding.UTF8.GetString(Convert.FromBase64String(copy.Cursor)));
                    if ((string)cursor["binding"] != session.CursorBinding || (string)cursor["snapshot"] != session.SnapshotId.ToString()
                        || (string)cursor["filter"] != filter || !Guid.TryParseExact((string)cursor["last"], "D", out _)
                        || ((int?)cursor["rank"] != 0 && (int?)cursor["rank"] != 1)) throw new FormatException();
                    lastRank = (int)cursor["rank"]; lastId = (string)cursor["last"];
                }
                catch (Exception e) when (e is FormatException || e is JsonException || e is ArgumentException || e is OverflowException || e is InvalidCastException)
                { return Task.FromResult(CatalogResult<VariantPage>.Failure(CatalogErrorCode.InvalidCursor)); }
            }
            return Read(session, cancellationToken, db =>
            {
                var args = new List<object> { copy.QueryText ?? "", Target, session.SnapshotId.ToString() };
                var sql = new StringBuilder(SelectVariant + " WHERE v.snapshot_id=?");
                sql.Append(kind == PackageKind.Preview ? " AND v.production_status<>'Retired'" : " AND v.production_status='Active'");
                if (!string.IsNullOrEmpty(copy.QueryText))
                {
                    sql.Append(" AND (json_extract(v.display_json,'$.partNumber')=? OR json_extract(v.display_json,'$.name') LIKE ? ESCAPE '\\')");
                    args.Add(copy.QueryText); args.Add("%" + CatalogInputPolicy.EscapeLike(copy.QueryText) + "%");
                }
                if (!string.IsNullOrEmpty(copy.Family)) { sql.Append(" AND json_extract(v.display_json,'$.family')=?"); args.Add(copy.Family); }
                if (copy.Tier.HasValue) { sql.Append(" AND v.tier=?"); args.Add(copy.Tier.Value.ToString()); }
                if (copy.Slot.HasValue)
                { sql.Append(" AND EXISTS(SELECT 1 FROM json_each(v.usage_json,'$.characterSlots') WHERE value=?)"); args.Add(copy.Slot.Value.ToString()); }
                if (copy.Purpose != CatalogPurpose.Browse)
                {
                    sql.Append(" AND v.tier<>'Special'");
                    sql.Append(copy.Purpose == CatalogPurpose.CharacterCreation ? " AND json_extract(v.usage_json,'$.creationEligible')=1" : " AND json_extract(v.usage_json,'$.bucketEligible')=1");
                }
                if (!string.IsNullOrEmpty(copy.BuildSystem))
                { sql.Append(" AND EXISTS(SELECT 1 FROM json_each(v.usage_json,'$.buildSystems') WHERE value=?)"); args.Add(copy.BuildSystem); }
                sql.Insert(0, "SELECT * FROM ("); sql.Append(") WHERE match_rank>? OR (match_rank=? AND variant_id>?) ORDER BY match_rank,variant_id LIMIT ?");
                args.Add(lastRank); args.Add(lastRank); args.Add(lastId); args.Add(copy.Limit + 1);
                var rows = db.Query(sql.ToString(), args.ToArray());
                string next = null;
                if (rows.Count > copy.Limit)
                {
                    rows.RemoveAt(rows.Count - 1);
                    var last = rows[rows.Count - 1];
                    next = Convert.ToBase64String(Encoding.UTF8.GetBytes(new JObject { ["binding"] = session.CursorBinding, ["snapshot"] = session.SnapshotId.ToString(),
                        ["filter"] = filter, ["last"] = last["variant_id"], ["rank"] = int.Parse(last["match_rank"]) }.ToString(Formatting.None)));
                }
                return CatalogResult<VariantPage>.Success(new VariantPage(rows.Select(ToDetails).ToList().AsReadOnly(), next));
            });
        }

        /// <summary>只讀取此快照所選版本，不回退到最新模型。</summary>
        public Task<CatalogResult<VariantDetails>> GetVariantAsync(CatalogSession session, Guid variantId, CancellationToken cancellationToken)
        {
            if (cancellationToken.IsCancellationRequested) return Cancelled<VariantDetails>();
            if (variantId == Guid.Empty) return Task.FromResult(CatalogResult<VariantDetails>.Failure(CatalogErrorCode.InvalidQuery));
            return Read(session, cancellationToken, db =>
            {
                var rows = db.Query(SelectVariant + " WHERE v.snapshot_id=? AND v.variant_id=?", "", Target, session.SnapshotId.ToString(), variantId.ToString());
                return rows.Count == 1 ? CatalogResult<VariantDetails>.Success(ToDetails(rows[0])) : CatalogResult<VariantDetails>.Failure(CatalogErrorCode.VariantNotFound);
            });
        }

        /// <summary>讀取固定快照配對規則。</summary>
        public Task<CatalogResult<CompatibilityProfiles>> GetProfilesAsync(CatalogSession session, CancellationToken cancellationToken) => Read(session, cancellationToken,
            db => CatalogResult<CompatibilityProfiles>.Success(new CompatibilityProfiles(new ReadOnlyDictionary<string, string>(
                db.Query("SELECT profile_id,definition_json FROM runtime_profiles WHERE snapshot_id=?", session.SnapshotId.ToString())
                .ToDictionary(row => row["profile_id"], row => row["definition_json"])))));

        /// <summary>讀取候選分母與待查缺口，不因子集合預覽改變。</summary>
        public Task<CatalogResult<CatalogCoverage>> GetCoverageAsync(CatalogSession session, CancellationToken cancellationToken) => Read(session, cancellationToken, db =>
        {
            var row = db.Query("SELECT coverage_json FROM runtime_snapshots WHERE snapshot_id=?", session.SnapshotId.ToString()).Single();
            var value = JObject.Parse(row["coverage_json"]);
            var result = new CatalogCoverage { C = (int)value["C"], A = (int)value["A"], R = (int)value["R"], U = (int)value["U"],
                G = (int)value["G"], V = (int)value["V"], ScopeReviewed = (bool?)value["scope_reviewed"] == true };
            if (result.C != result.A + result.R + result.U || new[] { result.C, result.A, result.R, result.U, result.G, result.V }.Any(n => n < 0) || result.V > result.A)
                throw new InvalidDataException();
            return CatalogResult<CatalogCoverage>.Success(result);
        });

        private bool Valid(CatalogSession session) => session != null && !session.IsDisposed && ReferenceEquals(session.Owner, owner);
        private Task<CatalogResult<T>> Read<T>(CatalogSession session, CancellationToken token, Func<NativeSqlite, CatalogResult<T>> read)
        {
            if (token.IsCancellationRequested) return Cancelled<T>();
            if (!Valid(session)) return Task.FromResult(CatalogResult<T>.Failure(CatalogErrorCode.InvalidQuery));
            return Task.Run(() => Safe(() =>
            {
                lock (session.Sync)
                {
                    token.ThrowIfCancellationRequested();
                    if (!Valid(session)) return CatalogResult<T>.Failure(CatalogErrorCode.InvalidQuery);
                    using (var db = new NativeSqlite(Path.Combine(root, "catalog.db")))
                    {
                        var result = read(db);
                        token.ThrowIfCancellationRequested();
                        return result;
                    }
                }
            }));
        }
        private static Task<CatalogResult<T>> Cancelled<T>() => Task.FromResult(CatalogResult<T>.Failure(CatalogErrorCode.Cancelled));
        private static CatalogResult<T> Safe<T>(Func<CatalogResult<T>> action, bool opening = false)
        {
            try { return action(); }
            catch (OperationCanceledException) { return CatalogResult<T>.Failure(CatalogErrorCode.Cancelled); }
            catch (DllNotFoundException) { return CatalogResult<T>.Failure(CatalogErrorCode.AssetMissing, "必要執行檔不完整，請使用完整安裝包修復。"); }
            catch (FileNotFoundException) { return CatalogResult<T>.Failure(opening ? CatalogErrorCode.CatalogNotInstalled : CatalogErrorCode.AssetMissing); }
            catch (DirectoryNotFoundException) { return CatalogResult<T>.Failure(CatalogErrorCode.CatalogNotInstalled); }
            catch (Exception e) when (e is InvalidDataException || e is JsonException || e is FormatException || e is KeyNotFoundException
                                      || e is InvalidCastException || e is SqliteFailure || e is InvalidOperationException || e is ArgumentException)
            { return CatalogResult<T>.Failure(CatalogErrorCode.AssetCorrupt); }
            catch (Exception e) when (e is IOException || e is UnauthorizedAccessException)
            { return CatalogResult<T>.Failure(CatalogErrorCode.StorageUnavailable); }
        }
        private static VariantDetails ToDetails(Dictionary<string, string> row)
        {
            var display = JObject.Parse(row["display_json"]);
            return new VariantDetails(Guid.Parse(row["variant_id"]), (string)display["name"], (string)display["family"], row["production_status"],
                (BrickTier)Enum.Parse(typeof(BrickTier), row["tier"]), new ModelReference(Guid.Parse(row["snapshot_id"]), Guid.Parse(row["variant_id"]),
                Guid.Parse(row["selected_revision_id"])), row["usage_json"], row["metadata_json"], row["runtime_build_id"]);
        }
    }
}
