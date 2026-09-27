"""有證據的三態判定須經實際 CLI、檔案 hash 與 SQLite 交易。"""

import json
import subprocess
import sys
from pathlib import Path
from uuid import uuid4

import pytest

from tools.catalog.content import ObjectStore
from tools.catalog.repository import CatalogRepository


ROOT = Path(__file__).resolve().parents[4]


def invoke(workspace, snapshot, key="decisions.json"):
    return subprocess.run([sys.executable, "-m", "tools.catalog", "--workspace", str(workspace),
                           "resolve", "--snapshot", snapshot, "--decisions", key],
                          cwd=ROOT, capture_output=True, timeout=20)


def setup(workspace):
    artifact = str(uuid4())
    stored = ObjectStore(workspace / "artifacts" / "catalog").put(b"F-Catalog reviewed evidence")
    with CatalogRepository(workspace / "catalog.sqlite") as repo:
        part = repo.add_part("基本磚", "System", "fixture-part")
        variant = repo.add_variant(part, {"color": "4"})
        snapshot = repo.create_snapshot("2026-09-08T15:59:59Z", {"families": ["System"]})
        repo.put_entry(snapshot, variant, "Unknown", [], {}, {"name": "基本磚", "fixture": True})
        repo.connection.execute("INSERT INTO source_artifacts VALUES(?,?,?,?,?,?,?,?)", (
            artifact, "https://example.invalid/evidence", "2026-09-09T00:00:00Z", None,
            stored["sha256"], "artifacts/catalog/" + stored["storage_key"], "{}", "{}"))
        version = repo.snapshot(snapshot)["version"]
    document = {"schemaVersion": 1, "expectedVersion": version, "entries": [{
        "variantId": variant,
        "evidence": [{"artifactId": artifact, "claim": "Producing",
                      "effectiveFrom": "2026-09-01T00:00:00Z", "effectiveTo": None,
                      "reviewer": "fixture-reviewer", "reason": "人工測試資料，非真實生產證據"}],
        "classification": {"tier": "Basic", "reason": "人工分類 fixture",
                           "allowedAcquisitionSources": [], "characterSlots": [],
                           "creationEligible": False, "bucketEligible": False, "buildSystems": []},
        "aliases": [{"source": "fixture", "externalId": "fixture-4", "targetKind": "Variant"}]
    }]}
    write(workspace, document)
    return snapshot, variant, artifact, document, stored


def write(workspace, document):
    (workspace / "decisions.json").write_text(json.dumps(document, ensure_ascii=False), encoding="utf-8")


def test_resolve_verified_claim_persists_and_exact_retry_does_not_increment_version(tmp_path):
    snapshot, variant, _, document, _ = setup(tmp_path)
    result = invoke(tmp_path, snapshot)
    assert result.returncode == 0, result.stderr
    report = json.loads(result.stdout)
    assert report["counts"]["A"] == 1
    assert report["counts"]["V"] == 0
    assert invoke(tmp_path, snapshot).returncode == 0
    with CatalogRepository(tmp_path / "catalog.sqlite") as repo:
        assert repo.snapshot(snapshot)["version"] == document["expectedVersion"] + 1
        entry = repo.entries(snapshot)[0]
        assert entry["production_status"] == "Active"
        assert len(json.loads(entry["evidence_ids_json"])) == 1
        assert json.loads(entry["display_projection_json"])["fixture"] is True
        assert repo.connection.execute("SELECT target_id FROM external_refs").fetchone()[0] == variant
        assert repo.head()["snapshot_id"] is None


@pytest.mark.parametrize("claim,start,end,expected", [
    ("Discontinued", "2026-09-01T00:00:00Z", None, "Retired"),
    ("Producing", None, None, "Unknown"),
    ("Producing", "2026-09-09T00:00:00Z", None, "Unknown"),
    ("Producing", "2026-09-01T00:00:00Z", "2026-09-07T00:00:00Z", "Unknown"),
    ("InStock", "2026-09-01T00:00:00Z", None, "Unknown"),
    ("OutOfStock", "2026-09-01T00:00:00Z", None, "Unknown"),
])
def test_resolve_uses_effective_production_evidence_only(tmp_path, claim, start, end, expected):
    snapshot, _, _, document, _ = setup(tmp_path)
    document["entries"][0]["evidence"][0].update(claim=claim, effectiveFrom=start, effectiveTo=end)
    write(tmp_path, document)
    assert invoke(tmp_path, snapshot).returncode == 0
    with CatalogRepository(tmp_path / "catalog.sqlite") as repo:
        assert repo.entries(snapshot)[0]["production_status"] == expected


def test_resolve_appends_contrary_claim_instead_of_silently_discarding_old_evidence(tmp_path):
    snapshot, _, _, document, _ = setup(tmp_path)
    assert invoke(tmp_path, snapshot).returncode == 0
    document["expectedVersion"] += 1
    document["entries"][0]["evidence"][0]["claim"] = "Discontinued"
    write(tmp_path, document)
    assert invoke(tmp_path, snapshot).returncode == 0
    with CatalogRepository(tmp_path / "catalog.sqlite") as repo:
        entry = repo.entries(snapshot)[0]
        assert entry["production_status"] == "Unknown"
        assert len(json.loads(entry["evidence_ids_json"])) == 2


@pytest.mark.parametrize("fault,expected", [("hash", 2), ("version", 5), ("frozen", 5),
    ("missing-variant", 2), ("bad-classification", 2), ("invalid-date", 2), ("alias-conflict", 5)])
def test_resolve_rejects_invalid_decisions_and_preserves_entire_transaction(tmp_path, fault, expected):
    snapshot, variant, _, document, stored = setup(tmp_path)
    with CatalogRepository(tmp_path / "catalog.sqlite") as repo:
        if fault == "hash":
            (tmp_path / "artifacts" / "catalog" / stored["storage_key"]).write_bytes(b"corrupt")
        elif fault == "version":
            document["expectedVersion"] += 1
        elif fault == "frozen":
            repo.freeze(snapshot, document["expectedVersion"])
        elif fault == "missing-variant":
            document["entries"].append({**document["entries"][0], "variantId": str(uuid4())})
        elif fault == "bad-classification":
            document["entries"][0]["classification"].update(tier="Special", creationEligible=True)
        elif fault == "invalid-date":
            document["entries"][0]["evidence"][0]["effectiveFrom"] = "not-a-date"
        elif fault == "alias-conflict":
            repo.connection.execute("INSERT INTO external_refs VALUES(?,?,?,?,?)",
                                    ("fixture", "fixture-4", "Variant", str(uuid4()), "prior"))
        before = repo.snapshot(snapshot)["version"]
    write(tmp_path, document)
    result = invoke(tmp_path, snapshot)
    assert result.returncode == expected, (result.stdout, result.stderr)
    assert str(tmp_path).encode() not in result.stderr
    with CatalogRepository(tmp_path / "catalog.sqlite") as repo:
        assert repo.snapshot(snapshot)["version"] == before
        assert repo.entries(snapshot)[0]["production_status"] == "Unknown"
        assert repo.connection.execute("SELECT COUNT(*) FROM evidence").fetchone()[0] == 0


def test_resolve_retry_reverifies_artifact_bytes(tmp_path):
    snapshot, _, _, _, stored = setup(tmp_path)
    assert invoke(tmp_path, snapshot).returncode == 0
    (tmp_path / "artifacts" / "catalog" / stored["storage_key"]).write_bytes(b"corrupt")
    assert invoke(tmp_path, snapshot).returncode == 2


def test_superseded_decision_retry_cannot_report_stale_active_result(tmp_path):
    snapshot, _, _, document, _ = setup(tmp_path)
    original = json.loads(json.dumps(document))
    assert invoke(tmp_path, snapshot).returncode == 0
    document["expectedVersion"] += 1
    document["entries"][0]["evidence"][0]["claim"] = "Discontinued"
    write(tmp_path, document)
    assert invoke(tmp_path, snapshot).returncode == 0
    write(tmp_path, original)
    assert invoke(tmp_path, snapshot).returncode == 5


def test_validate_recognizes_resolved_evidence_but_still_requires_quality_and_real_content(tmp_path):
    snapshot, _, _, document, _ = setup(tmp_path)
    assert invoke(tmp_path, snapshot).returncode == 0
    with CatalogRepository(tmp_path / "catalog.sqlite") as repo:
        repo.freeze(snapshot, document["expectedVersion"] + 1)
    result = subprocess.run([sys.executable, "-m", "tools.catalog", "--workspace", str(tmp_path),
                             "validate", "--snapshot", snapshot], cwd=ROOT, capture_output=True, timeout=20)
    assert result.returncode == 3
    issues = json.loads(result.stdout)["variants"][0]["issues"]
    assert "unverified-production-claim" not in issues
    assert "fixture-content" in issues
    assert "missing-selected-revision" in issues


@pytest.mark.parametrize("table,column", [("source_artifacts", "digest"), ("evidence", "claim")])
def test_resolved_evidence_is_immutable_even_before_freeze(tmp_path, table, column):
    import sqlite3
    snapshot, _, _, _, _ = setup(tmp_path)
    assert invoke(tmp_path, snapshot).returncode == 0
    with CatalogRepository(tmp_path / "catalog.sqlite") as repo:
        with pytest.raises(sqlite3.IntegrityError):
            repo.connection.execute(f"UPDATE {table} SET {column}='rewritten'")
        with pytest.raises(sqlite3.IntegrityError):
            repo.connection.execute(f"DELETE FROM {table}")


def test_IT_001_source_import_to_resolve_keeps_variant_status_and_print_identity(tmp_path):
    from tools.catalog.tests.integration.test_source_import import fixture
    import hashlib
    manifest = fixture(tmp_path)
    page = {"schemaVersion": 1, "records": [
        {"kind": "candidate", "sourceId": "plain", "partId": "part-1", "name": "普通紅磚",
         "family": "System", "appearance": {"color": "4", "print": None, "material": "plastic"}},
        {"kind": "candidate", "sourceId": "printed", "partId": "part-1", "name": "印刷藍磚",
         "family": "System", "appearance": {"color": "1", "print": "pattern", "material": "plastic"}}
    ]}
    data = json.dumps(page).encode()
    (tmp_path / "page.json").write_bytes(data)
    manifest["sources"][0]["pages"][0]["sha256"] = hashlib.sha256(data).hexdigest()
    (tmp_path / "manifest.json").write_text(json.dumps(manifest), encoding="utf-8")
    imported = subprocess.run([sys.executable, "-m", "tools.catalog", "--workspace", str(tmp_path),
        "import", "--manifest", "manifest.json", "--job-key", "matrix"],
        cwd=ROOT, capture_output=True, timeout=20)
    assert imported.returncode == 0, imported.stderr
    snapshot = json.loads(imported.stdout)["snapshotId"]
    with CatalogRepository(tmp_path / "catalog.sqlite") as repo:
        artifact = repo.connection.execute("SELECT artifact_id FROM source_artifacts").fetchone()[0]
        variants = {row["external_id"]: row["target_id"] for row in repo.connection.execute(
            "SELECT * FROM external_refs WHERE target_kind='Variant'")}
        version = repo.snapshot(snapshot)["version"]
    decisions = {"schemaVersion": 1, "expectedVersion": version, "entries": []}
    for alias, claim in (("plain", "Discontinued"), ("printed", "Producing")):
        decisions["entries"].append({"variantId": variants[alias], "evidence": [{
            "artifactId": artifact, "claim": claim, "effectiveFrom": "2026-09-01T00:00:00Z",
            "effectiveTo": None, "reviewer": "fixture-reviewer", "reason": "人工測試判定"}],
            "classification": {"tier": "Basic", "reason": "人工測試分类", "creationEligible": False,
                "bucketEligible": False, "allowedAcquisitionSources": [], "characterSlots": [], "buildSystems": []}})
    write(tmp_path, decisions)
    result = invoke(tmp_path, snapshot)
    assert result.returncode == 0, result.stderr
    assert json.loads(result.stdout)["counts"] == {"C": 2, "A": 1, "R": 1, "U": 0, "G": 0, "V": 0}
    with CatalogRepository(tmp_path / "catalog.sqlite") as repo:
        rows = {row["variant_id"]: row for row in repo.entries(snapshot)}
        assert rows[variants["plain"]]["production_status"] == "Retired"
        assert rows[variants["printed"]]["production_status"] == "Active"
        assert all(len(json.loads(row["evidence_ids_json"])) == 2 for row in rows.values())
        assert repo.connection.execute("SELECT COUNT(*) FROM parts").fetchone()[0] == 1
        assert repo.connection.execute("SELECT COUNT(*) FROM variants").fetchone()[0] == 2
        assert list(repo.connection.execute("PRAGMA foreign_key_check")) == []
        assert repo.connection.execute("PRAGMA integrity_check").fetchone()[0] == "ok"
        assert repo.head() == {"snapshot_id": None, "version": 0}


@pytest.mark.parametrize("field", ["tier", "claim", "targetKind"])
def test_resolve_malformed_enum_is_input_error_not_tool_failure(tmp_path, field):
    snapshot, _, _, document, _ = setup(tmp_path)
    entry = document["entries"][0]
    container = entry["classification"] if field == "tier" else (
        entry["evidence"][0] if field == "claim" else entry["aliases"][0])
    container[field] = []
    write(tmp_path, document)
    assert invoke(tmp_path, snapshot).returncode == 2
