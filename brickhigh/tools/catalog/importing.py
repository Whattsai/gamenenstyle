"""把指定盒組與 LEGO 元素身份的受控來源 adapter 頁匯入 Draft。"""

from dataclasses import dataclass
from hashlib import sha256
import json
from pathlib import Path
import re
from urllib.parse import urlsplit
from uuid import uuid5

from .content import ContentPathPolicy, ObjectStore
from .policies import CatalogConflict, CatalogError, canonical_json, digest, utc_time
from .repository import CatalogRepository


_KEY = re.compile(r"^[A-Za-z0-9._-]{1,128}$")
_SHA = re.compile(r"^[0-9a-f]{64}$")
_MAX_PAGE_BYTES = 256 * 1024 * 1024
_NAMESPACE = __import__("uuid").UUID("ed348264-3e50-4b19-986f-1c76f9c92825")


@dataclass(frozen=True)
class ImportResult:
    """只回傳安全識別與涵蓋摘要，不回顯來源 URL 或本機路徑。"""

    snapshot_id: str
    input_digest: str
    coverage: dict


def _object(value, required, optional=()):
    if not isinstance(value, dict) or set(value) - (set(required) | set(optional)) or set(required) - set(value):
        raise CatalogError("來源 manifest 欄位無效。")
    return value


def _name(value):
    if not isinstance(value, str) or not value.strip() or len(value) > 256:
        raise CatalogError("來源識別或文字欄位無效。")
    return value.strip()


def _utc(value, optional=False):
    if value is None and optional:
        return None
    if not isinstance(value, str):
        raise CatalogError("來源日期無效。")
    try:
        parsed = utc_time(value)
    except (TypeError, ValueError) as error:
        raise CatalogError("來源日期無效。") from error
    if parsed.utcoffset().total_seconds() != 0:
        raise CatalogError("來源日期必須使用 UTC。")
    return value


def _uri(value):
    text = _name(value)
    parsed = urlsplit(text)
    if parsed.scheme != "https" or not parsed.hostname or parsed.username or parsed.password or parsed.query or parsed.fragment:
        raise CatalogError("來源 URI 必須是不含憑證的 HTTPS 位址。")
    return text


def _read_json(workspace, key):
    try:
        data = ContentPathPolicy.read_bytes(workspace, key)
    except (OSError, ValueError) as error:
        raise CatalogError("來源檔案無法安全讀取。") from error
    if len(data) > _MAX_PAGE_BYTES:
        raise CatalogError("來源檔案超出受控大小。")
    try:
        value = json.loads(data.decode("utf-8"))
    except (UnicodeError, json.JSONDecodeError) as error:
        raise CatalogError("來源 JSON 無效。") from error
    return data, value


def _load(workspace, manifest_key):
    manifest_bytes, manifest = _read_json(workspace, manifest_key)
    _object(manifest, ("schemaVersion", "baselineAt", "expectedFamilies", "sources"), ("parentSnapshot", "cohort"))
    if type(manifest["schemaVersion"]) is not int or manifest["schemaVersion"] != 1:
        raise CatalogError("來源 manifest schemaVersion 不支援。")
    baseline = _utc(manifest["baselineAt"])
    families = manifest["expectedFamilies"]
    if not isinstance(families, list) or not families or any(not isinstance(item, str) for item in families):
        raise CatalogError("預期系列清單無效。")
    families = [_name(item) for item in families]
    if len(set(families)) != len(families):
        raise CatalogError("預期系列重複。")
    sources = manifest["sources"]
    if not isinstance(sources, list) or not sources:
        raise CatalogError("來源清單不可為空。")
    prepared = []
    fingerprints = []
    source_names = set()
    for source in sources:
        _object(source, ("name", "sourceUri", "sourceVersion", "observedAt", "effectiveAt",
                         "expectedPages", "pages"), ("license", "provenance"))
        name = _name(source["name"])
        if name in source_names:
            raise CatalogError("來源名稱重複。")
        source_names.add(name)
        uri = _uri(source["sourceUri"])
        version = _name(source["sourceVersion"])
        observed = _utc(source["observedAt"])
        effective = _utc(source["effectiveAt"], optional=True)
        expected = source["expectedPages"]
        if type(expected) is not int or not 1 <= expected <= 100000:
            raise CatalogError("來源分頁數無效。")
        pages = source["pages"]
        if not isinstance(pages, list) or len(pages) > expected:
            raise CatalogError("來源分頁清單無效。")
        license_value = source.get("license", {})
        if not isinstance(license_value, dict):
            raise CatalogError("來源使用條件欄位無效。")
        parsed_pages = []
        numbers = set()
        for page in pages:
            _object(page, ("number", "path", "sha256"))
            number = page["number"]
            if type(number) is not int or not 1 <= number <= expected or number in numbers:
                raise CatalogError("來源頁碼重複或超出範圍。")
            numbers.add(number)
            declared_sha = page["sha256"]
            if not isinstance(declared_sha, str) or not _SHA.fullmatch(declared_sha):
                raise CatalogError("來源 SHA-256 無效。")
            path = page["path"]
            if not isinstance(path, str):
                raise CatalogError("來源頁路徑無效。")
            data, document = _read_json(workspace, path)
            actual_sha = sha256(data).hexdigest()
            if actual_sha != declared_sha:
                raise CatalogError("來源 SHA-256 不符。")
            _object(document, ("schemaVersion", "records"))
            if (type(document["schemaVersion"]) is not int or document["schemaVersion"] != 1
                    or not isinstance(document["records"], list)):
                raise CatalogError("來源頁 schemaVersion 或 records 無效。")
            parsed_pages.append({"number": number, "path": path, "sha256": actual_sha,
                                 "bytes": data, "records": document["records"]})
            fingerprints.append({"source": name, "number": number, "path": path, "sha256": actual_sha})
        provenance = []
        for reference in source.get("provenance", []):
            _object(reference, ("path", "sha256"))
            data = ContentPathPolicy.read_verified(workspace, reference["path"], reference["sha256"])
            provenance.append(dict(reference, bytes=data))
            fingerprints.append({"source": name, "rawPath": reference["path"], "sha256": reference["sha256"]})
        prepared.append({"provenance": provenance, "name": name, "uri": uri, "version": version, "observed": observed,
                         "effective": effective, "expected": expected, "pages": parsed_pages,
                         "license": license_value})
    input_digest = digest({"manifestSha256": sha256(manifest_bytes).hexdigest(), "pages": fingerprints})
    return baseline, families, prepared, input_digest


def _record(record, families):
    if not isinstance(record, dict) or record.get("kind") not in {"candidate", "set", "minifigure", "excluded"}:
        raise CatalogError("來源紀錄種類無效。")
    kind = record["kind"]
    common = {"kind", "sourceId", "family"}
    if kind == "candidate":
        required = common | {"designId", "elementId", "name", "appearance"}
    elif kind == "excluded":
        required = common | {"reason"}
    elif kind == "set":
        required = common | {"setNumber", "componentElementIds"}
    else:
        required = common | {"componentElementIds"}
    _object(record, required)
    _name(record["sourceId"])
    if _name(record["family"]) not in families:
        raise CatalogError("來源系列不在 manifest 範圍內。")
    if kind == "candidate":
        if record["designId"] is not None:
            _name(record["designId"])
        _name(record["elementId"])
        _name(record["name"])
        if not isinstance(record["appearance"], dict) or not record["appearance"]:
            raise CatalogError("候選外觀欄位無效。")
        canonical_json(record["appearance"])
    elif kind == "excluded":
        _name(record["reason"])
    else:
        if kind == "set":
            _name(record["setNumber"])
        if (not isinstance(record["componentElementIds"], list) or not record["componentElementIds"]
                or any(not isinstance(item, str) or not item.strip() for item in record["componentElementIds"])):
            raise CatalogError("組件 Element ID 展開清單無效。")
    return record


def _uuid(*parts):
    return str(uuid5(_NAMESPACE, canonical_json(parts)))


def _retry_result(previous, input_digest, workspace, sources):
    if previous["input_digest"] != input_digest:
        raise CatalogConflict("相同工作鍵的來源內容已改變。")
    for source in sources:
        for page in source["pages"]:
            key = "artifacts/catalog/objects/" + page["sha256"] + "/content"
            try:
                ContentPathPolicy.read_verified(workspace, key, page["sha256"])
            except OSError as error:
                raise CatalogError("封存來源無法讀取。") from error
    return ImportResult(previous["snapshot_id"], input_digest, json.loads(previous["coverage_json"]))


def _bind_alias(repo, source, external_id, kind, target, evidence_id):
    row = repo.connection.execute("SELECT target_id FROM external_refs WHERE source=? AND external_id=? AND target_kind=?",
                                  (source, external_id, kind)).fetchone()
    if row is None:
        repo.connection.execute("INSERT INTO external_refs VALUES(?,?,?,?,?)",
                                (source, external_id, kind, target, evidence_id))
        return False
    if row["target_id"] == target:
        return False
    conflict = _uuid("alias", source, external_id, kind, row["target_id"], target)
    repo.connection.execute("INSERT OR IGNORE INTO mapping_conflicts VALUES(?,?,?,?,?,?,NULL)",
                            (conflict, source, external_id, kind, row["target_id"], target))
    return True


def import_catalog(repo: CatalogRepository, workspace: Path, manifest_key: str, job_key: str) -> ImportResult:
    """驗證來源頁後以單一 SQLite 交易建立 Draft、候選與可追溯缺口。"""
    if not isinstance(repo, CatalogRepository) or not isinstance(job_key, str) or not _KEY.fullmatch(job_key):
        raise CatalogError("匯入工作鍵或 repository 無效。")
    workspace = Path(workspace).absolute()
    if not repo.path.is_relative_to(workspace):
        raise CatalogError("目錄資料庫必須位於受控工作目錄內。")
    baseline, families, sources, input_digest = _load(workspace, manifest_key)
    repo.connection.execute("""CREATE TABLE IF NOT EXISTS catalog_import_runs (
        job_key TEXT PRIMARY KEY, input_digest TEXT NOT NULL, snapshot_id TEXT NOT NULL REFERENCES snapshots,
        coverage_json TEXT NOT NULL)""")
    with repo.transaction():
        previous = repo.connection.execute("SELECT * FROM catalog_import_runs WHERE job_key=?", (job_key,)).fetchone()
        if previous is not None:
            return _retry_result(previous, input_digest, workspace, sources)

    # 內容庫先提交不可變原始位元組；DB 失敗只可能留下未引用物件。
    store = ObjectStore(workspace / "artifacts" / "catalog")
    for source in sources:
        for page in source["pages"]:
            page["object"] = store.put(page["bytes"])
        for raw_source in source["provenance"]:
            raw_source["object"] = store.put(raw_source["bytes"])

    with repo.transaction():
        previous = repo.connection.execute("SELECT * FROM catalog_import_runs WHERE job_key=?", (job_key,)).fetchone()
        if previous is not None:
            return _retry_result(previous, input_digest, workspace, sources)

        scope = {"schemaVersion": 1, "expectedFamilies": families, "observedFamilies": [],
                 "sources": [], "expansions": [], "exclusions": []}
        _, source_manifest = _read_json(workspace, manifest_key)
        parent = source_manifest.get("parentSnapshot")
        if parent:
            _object(parent, ("snapshotId", "version", "selectionDigest"))
            current = repo._require(parent["snapshotId"], {"Frozen"})
            if (type(parent["version"]) is not int or current["version"] != parent["version"]
                    or repo.selection_digest(parent["snapshotId"]) != parent["selectionDigest"]):
                raise CatalogConflict("來源父Frozen版本或selection digest已改變。")
        if "cohort" in source_manifest:
            scope["cohort"] = source_manifest["cohort"]
        snapshot = repo.create_snapshot(baseline, scope, parent["snapshotId"] if parent else None)
        observed = set()
        gaps = []
        candidates = 0
        for source in sources:
            name = source["name"]
            present = {page["number"] for page in source["pages"]}
            scope["sources"].append({"name": name, "sourceVersion": source["version"],
                                     "observedAt": source["observed"], "effectiveAt": source["effective"],
                                     "expectedPages": source["expected"], "actualPages": sorted(present),
                                     "complete": len(present) == source["expected"]})
            for missing in sorted(set(range(1, source["expected"] + 1)) - present):
                gaps.append((name, "", "MissingPage:" + str(missing)))
            candidate_ids = set()
            expansions = []
            for page in source["pages"]:
                artifact = _uuid("artifact", name, source["uri"], source["version"],
                                 page["number"], page["sha256"], source["observed"], source["effective"], source["license"])
                metadata = {"schemaVersion": 1, "sourceName": name, "sourceVersion": source["version"],
                            "pageNumber": page["number"], "expectedPages": source["expected"],
                            "relativePath": page["path"], "byteLength": len(page["bytes"]),
                            "rawSources": [{"path": r["path"], "sha256": r["sha256"],
                                "storageKey": "artifacts/catalog/" + r["object"]["storage_key"]}
                                for r in source["provenance"]]}
                repo.connection.execute("""INSERT OR IGNORE INTO source_artifacts
                    VALUES(?,?,?,?,?,?,?,?)""", (artifact, source["uri"], source["observed"],
                    source["effective"], page["sha256"], "artifacts/catalog/" + page["object"]["storage_key"],
                    canonical_json(source["license"]), canonical_json(metadata)))
                for raw in page["records"]:
                    record = _record(raw, families)
                    kind = record["kind"]
                    observed.add(record["family"])
                    if kind == "excluded":
                        scope["exclusions"].append({"source": name, "sourceId": record["sourceId"],
                                                    "family": record["family"], "reason": record["reason"]})
                        continue
                    if kind in {"set", "minifigure"}:
                        expansion = {"source": name, "sourceId": record["sourceId"], "kind": kind,
                                     "componentElementIds": record["componentElementIds"]}
                        if kind == "set":
                            expansion["setNumber"] = record["setNumber"]
                        scope["expansions"].append(expansion)
                        expansions.append((record["family"], expansion))
                        continue
                    candidate_ids.add(record["elementId"])
                    part = repo.add_part(record["name"], record["family"], ("LEGO-Design:" + record["designId"]) if record["designId"] else ("LEGO-Element:" + record["elementId"]))
                    element_appearance = dict(record["appearance"])
                    element_appearance["elementId"] = record["elementId"]
                    variant = repo.add_variant(part, element_appearance)
                    evidence_id = _uuid("candidate", artifact, record["sourceId"], variant)
                    repo.connection.execute("""INSERT OR IGNORE INTO evidence
                        VALUES(?,?,?,?,?,?,?,?)""", (evidence_id, artifact, name + ":" + record["sourceId"],
                        "Candidate", source["effective"], None, "source-adapter",
                        "來源盒組／元素身份候選；只用於身份與來源追溯。"))
                    aliases = [("LEGO-Element", record["elementId"], "Variant", variant),
                               (name, record["sourceId"], "Variant", variant)]
                    if record["designId"]:
                        aliases.append(("LEGO-Design", record["designId"], "Part", part))
                    for alias_source, external_id, target_kind, target in aliases:
                        if _bind_alias(repo, alias_source, external_id, target_kind, target, evidence_id):
                            gaps.append((alias_source, record["family"], "MappingConflict:" + external_id))
                    old = repo.connection.execute("""SELECT evidence_ids_json FROM snapshot_entries
                        WHERE snapshot_id=? AND variant_id=?""", (snapshot, variant)).fetchone()
                    if old is None:
                        repo.connection.execute("""INSERT INTO snapshot_entries VALUES(?,?,?,?,?,NULL)""",
                            (snapshot, variant, canonical_json([evidence_id]), canonical_json({"schemaVersion": 1}),
                             canonical_json({"schemaVersion": 1, "name": record["name"], "family": record["family"],
                                             "source": name, "externalId": record["sourceId"],
                                             "designId": record["designId"], "elementId": record["elementId"]})))
                        candidates += 1
                    else:
                        ids = json.loads(old["evidence_ids_json"])
                        if evidence_id not in ids:
                            ids.append(evidence_id)
                            repo.connection.execute("""UPDATE snapshot_entries SET evidence_ids_json=?
                                WHERE snapshot_id=? AND variant_id=?""", (canonical_json(ids), snapshot, variant))
            for family, expansion in expansions:
                for component in expansion["componentElementIds"]:
                    if component not in candidate_ids:
                        gaps.append((name, family, "MissingComponent:" + expansion["sourceId"] + ":" + component))
        for family in families:
            if family not in observed:
                gaps.append(("scope", family, "MissingFamily:" + family))
        scope["observedFamilies"] = [family for family in families if family in observed]
        repo.connection.execute("UPDATE snapshots SET scope_manifest_json=? WHERE snapshot_id=?",
                                (canonical_json(scope), snapshot))
        for source, family, kind in gaps:
            repo.connection.execute("INSERT INTO coverage_gaps VALUES(?,?,?,?,?,NULL)",
                                    (_uuid("gap", snapshot, source, family, kind), snapshot, source, family, kind))
        coverage = {"C": candidates, "G": len(gaps)}
        repo.connection.execute("INSERT INTO catalog_import_runs VALUES(?,?,?,?)",
                                (job_key, input_digest, snapshot, canonical_json(coverage)))
        return ImportResult(snapshot, input_digest, coverage)
