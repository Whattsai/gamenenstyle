"""Draft 判定交易：保留身份／來源證據與分類，不處理停產或在產狀態。"""

import json
from uuid import UUID, uuid5

from .content import ContentPathPolicy
from .importing import _name, _object, _read_json, _utc
from .policies import CatalogConflict, CatalogError, canonical_json, digest, utc_time


_NAMESPACE = UUID("759e885a-f5a7-47e4-bcf3-5039fdf93b79")
_CLAIMS = {"Identity", "Geometry", "Appearance", "SetMembership", "Candidate", "Unknown"}


def _uuid(value):
    try:
        if isinstance(value, str) and str(UUID(value)) == value:
            return value
    except ValueError:
        pass
    raise CatalogError("判定識別碼無效。")


def _classification(value):
    _object(value, ("tier", "reason", "allowedAcquisitionSources", "characterSlots",
                    "creationEligible", "bucketEligible", "buildSystems"))
    if not isinstance(value["tier"], str) or value["tier"] not in {"Basic", "Advanced", "Special"}:
        raise CatalogError("分類款式無效。")
    _name(value["reason"])
    for key in ("creationEligible", "bucketEligible"):
        if type(value[key]) is not bool or (value["tier"] == "Special" and value[key]):
            raise CatalogError("分類用途無效。")
    for key in ("allowedAcquisitionSources", "characterSlots", "buildSystems"):
        items = value[key]
        if not isinstance(items, list):
            raise CatalogError("分類清單無效。")
        normalized = [_name(item) for item in items]
        if normalized != items or len(set(items)) != len(items):
            raise CatalogError("分類清單重複或未正規化。")
    if value["creationEligible"] and not value["characterSlots"]:
        raise CatalogError("人物候選缺少部位。")
    if value["bucketEligible"] and not value["buildSystems"]:
        raise CatalogError("建材候選缺少相容系統。")
    return value


def verified_artifact(repo, workspace, artifact_id):
    """每次重新讀取實際 bytes，舊 hash 成功不代表檔案仍未被替換。"""
    row = repo.connection.execute("SELECT * FROM source_artifacts WHERE artifact_id=?", (artifact_id,)).fetchone()
    if row is None:
        raise CatalogError("判定缺少來源附件。")
    try:
        ContentPathPolicy.read_verified(workspace, row["storage_key"], row["digest"])
    except OSError as error:
        raise CatalogError("判定來源附件無法讀取。") from error
    return row


def resolve_catalog(repo, workspace, snapshot_id, decisions_key):
    """整份判定原子提交，失敗不留下半套分類、別名或證據。"""
    _uuid(snapshot_id)
    _, document = _read_json(workspace, decisions_key)
    _object(document, ("schemaVersion", "expectedVersion", "entries"))
    if type(document["schemaVersion"]) is not int or document["schemaVersion"] != 1:
        raise CatalogError("判定 schemaVersion 不支援。")
    if type(document["expectedVersion"]) is not int or document["expectedVersion"] < 1:
        raise CatalogError("判定版本無效。")
    entries = document["entries"]
    if not isinstance(entries, list) or not entries:
        raise CatalogError("判定清單不可為空。")
    input_digest = digest(document)
    repo.connection.execute("""CREATE TABLE IF NOT EXISTS catalog_resolution_runs (
        snapshot_id TEXT NOT NULL REFERENCES snapshots, input_digest TEXT NOT NULL,
        result_json TEXT NOT NULL, PRIMARY KEY(snapshot_id,input_digest))""")
    with repo.transaction():
        snapshot = repo._require(snapshot_id, {"Draft"})
        previous = repo.connection.execute("SELECT result_json FROM catalog_resolution_runs WHERE snapshot_id=? AND input_digest=?",
                                           (snapshot_id, input_digest)).fetchone()
        if previous is None and snapshot["version"] != document["expectedVersion"]:
            raise CatalogConflict("判定版本已改變。")
        if previous is not None and snapshot["version"] != json.loads(previous[0])["version"]:
            raise CatalogConflict("此判定後已有新版本，請重新核對。")
        seen = set()
        for item in entries:
            _object(item, ("variantId", "evidence", "classification"), ("aliases",))
            variant = _uuid(item["variantId"])
            if variant in seen:
                raise CatalogError("判定包含重複變體。")
            seen.add(variant)
            entry = repo.connection.execute("SELECT * FROM snapshot_entries WHERE snapshot_id=? AND variant_id=?",
                                            (snapshot_id, variant)).fetchone()
            if entry is None:
                raise CatalogError("變體不屬於此快照。")
            classification = _classification(item["classification"])
            records = item["evidence"]
            if not isinstance(records, list) or not records:
                raise CatalogError("判定至少需要一份附件證據。")
            ids = json.loads(entry["evidence_ids_json"])
            for record in records:
                _object(record, ("artifactId", "claim", "effectiveFrom", "effectiveTo", "reviewer", "reason"))
                artifact = _uuid(record["artifactId"])
                verified_artifact(repo, workspace, artifact)
                if not isinstance(record["claim"], str) or record["claim"] not in _CLAIMS:
                    raise CatalogError("判定主張無效。")
                start = _utc(record["effectiveFrom"], optional=True)
                end = _utc(record["effectiveTo"], optional=True)
                if end is not None and (start is None or utc_time(end) < utc_time(start)):
                    raise CatalogError("證據日期區間無效。")
                reviewer, reason = _name(record["reviewer"]), _name(record["reason"])
                evidence_id = str(uuid5(_NAMESPACE, canonical_json([variant, record])))
                if previous is None:
                    repo.connection.execute("INSERT OR IGNORE INTO evidence VALUES(?,?,?,?,?,?,?,?)", (
                        evidence_id, artifact, variant, record["claim"], start, end, reviewer, reason))
                if evidence_id not in ids:
                    ids.append(evidence_id)
            aliases = item.get("aliases", [])
            if not isinstance(aliases, list):
                raise CatalogError("別名清單無效。")
            for alias in aliases:
                _object(alias, ("source", "externalId", "targetKind"))
                source, external = _name(alias["source"]), _name(alias["externalId"])
                kind = alias["targetKind"]
                if not isinstance(kind, str) or kind not in {"Part", "Variant"}:
                    raise CatalogError("別名種類無效。")
                target = variant if kind == "Variant" else repo.connection.execute(
                    "SELECT part_id FROM variants WHERE variant_id=?", (variant,)).fetchone()[0]
                old = repo.connection.execute("SELECT target_id FROM external_refs WHERE source=? AND external_id=? AND target_kind=?",
                                              (source, external, kind)).fetchone()
                if old is not None and old[0] != target:
                    raise CatalogConflict("來源別名已有相反映射。")
                if previous is None:
                    repo.connection.execute("INSERT OR IGNORE INTO external_refs VALUES(?,?,?,?,?)",
                                            (source, external, kind, target, evidence_id))
            if previous is None:
                repo.connection.execute("""UPDATE snapshot_entries SET evidence_ids_json=?,
                    classification_json=? WHERE snapshot_id=? AND variant_id=?""",
                    (canonical_json(ids), canonical_json(classification), snapshot_id, variant))
        if previous is not None:
            return json.loads(previous[0])
        repo.connection.execute("UPDATE snapshots SET version=version+1 WHERE snapshot_id=?", (snapshot_id,))
        coverage = repo.coverage(snapshot_id)
        result = {"snapshotId": snapshot_id, "version": snapshot["version"] + 1, "inputDigest": input_digest,
                  "counts": {key: coverage[key] for key in ("C", "G", "V")}}
        repo.connection.execute("INSERT INTO catalog_resolution_runs VALUES(?,?,?)",
                                (snapshot_id, input_digest, canonical_json(result)))
        return result
