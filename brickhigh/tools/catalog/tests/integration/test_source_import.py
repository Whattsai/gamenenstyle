"""來源匯入跨過實際 SQLite、受控檔案與原子提交邊界。"""

import hashlib
import json

import pytest

from tools.catalog.importing import import_catalog
from tools.catalog.policies import CatalogConflict, CatalogError
from tools.catalog.repository import CatalogRepository
from tools.catalog.content import ContentPathPolicy


def fixture(workspace, *, appearance=None, key="manifest.json", source_id="v1"):
    page = {"schemaVersion": 1, "records": [{"kind": "candidate", "sourceId": source_id,
            "designId": "3001", "elementId": source_id, "name": "基本磚", "family": "System",
            "appearance": appearance or {"color": "4"}}]}
    data = json.dumps(page, ensure_ascii=False).encode("utf-8")
    (workspace / "page.json").write_bytes(data)
    manifest = {"schemaVersion": 1, "baselineAt": "2026-09-08T15:59:59Z",
                "expectedFamilies": ["System"], "sources": [{"name": "catalog",
                "sourceUri": "https://example.invalid/catalog", "sourceVersion": "v1",
                "observedAt": "2026-09-10T12:00:00Z", "effectiveAt": None,
                "expectedPages": 1, "pages": [{"number": 1, "path": "page.json",
                "sha256": hashlib.sha256(data).hexdigest()}]}]}
    (workspace / key).write_text(json.dumps(manifest), encoding="utf-8")
    return manifest


def test_IT_001_Import_IdempotentAndAtomic(tmp_path):
    fixture(tmp_path)
    with CatalogRepository(tmp_path / "catalog.db") as repo:
        first = import_catalog(repo, tmp_path, "manifest.json", "job-1")
        second = import_catalog(repo, tmp_path, "manifest.json", "job-1")
        assert first == second
        assert repo.connection.execute("SELECT COUNT(*) FROM snapshots").fetchone()[0] == 1
        assert repo.connection.execute("SELECT COUNT(*) FROM source_artifacts").fetchone()[0] == 1
        assert repo.connection.execute("SELECT COUNT(*) FROM catalog_import_runs").fetchone()[0] == 1
        artifact = repo.connection.execute("SELECT * FROM source_artifacts").fetchone()
        assert ContentPathPolicy.read_verified(tmp_path, artifact["storage_key"], artifact["digest"]) == (tmp_path / "page.json").read_bytes()
        fixture(tmp_path, appearance={"color": "1"})
        with pytest.raises(CatalogConflict):
            import_catalog(repo, tmp_path, "manifest.json", "job-1")
        assert repo.connection.execute("SELECT COUNT(*) FROM snapshots").fetchone()[0] == 1
        assert repo.connection.execute("SELECT COUNT(*) FROM source_artifacts").fetchone()[0] == 1


def test_IT_001_Import_BadHashAndOutOfBoundsLeaveNoRows(tmp_path):
    manifest = fixture(tmp_path)
    with CatalogRepository(tmp_path / "catalog.db") as repo:
        manifest["sources"][0]["pages"][0]["sha256"] = "0" * 64
        (tmp_path / "manifest.json").write_text(json.dumps(manifest), encoding="utf-8")
        with pytest.raises(CatalogError):
            import_catalog(repo, tmp_path, "manifest.json", "bad-hash")
        manifest["sources"][0]["pages"][0]["path"] = "../outside.json"
        (tmp_path / "manifest.json").write_text(json.dumps(manifest), encoding="utf-8")
        with pytest.raises(CatalogError):
            import_catalog(repo, tmp_path, "manifest.json", "outside")
        assert repo.connection.execute("SELECT COUNT(*) FROM snapshots").fetchone()[0] == 0
        assert repo.connection.execute("SELECT COUNT(*) FROM source_artifacts").fetchone()[0] == 0


def test_IT_001_Import_ConflictingAliasPreservesBothCandidates(tmp_path):
    fixture(tmp_path)
    with CatalogRepository(tmp_path / "catalog.db") as repo:
        first = import_catalog(repo, tmp_path, "manifest.json", "job-1")
        fixture(tmp_path, appearance={"color": "1"})
        second = import_catalog(repo, tmp_path, "manifest.json", "job-2")
        assert first.snapshot_id != second.snapshot_id
        aliases = [dict(row) for row in repo.connection.execute("SELECT * FROM external_refs")]
        conflicts = [dict(row) for row in repo.connection.execute("SELECT * FROM mapping_conflicts")]
        assert len(aliases) == 3  # LEGO Design、LEGO Element 與來源 variant 原映射不被覆寫
        assert len(conflicts) == 2
        assert all(row["proposed_id"] != row["existing_id"] for row in conflicts)
        assert repo.coverage(second.snapshot_id)["G"] >= 1
        assert repo.connection.execute("SELECT COUNT(*) FROM variants").fetchone()[0] == 2


def test_IT_001_Import_SameDesignDifferentElementsShareGeometryButKeepElementIdentity(tmp_path):
    from tools.catalog.tests.unit.test_sc_001 import source, write_manifest, write_page
    records = [
        {"kind": "candidate", "sourceId": "6411587", "designId": "11211", "elementId": "6411587",
         "name": "BRICK 1X2 W. 2 KNOBS", "family": "System", "appearance": {"colour": "Medium Nougat"}},
        {"kind": "candidate", "sourceId": "6135606", "designId": "11211", "elementId": "6135606",
         "name": "BRICK 1X2 W. 2 KNOBS", "family": "System", "appearance": {"colour": "Earth Blue"}},
    ]
    page = write_page(tmp_path, "sources/lego-elements.json", records)
    write_manifest(tmp_path, [source("lego", [page])], ["System"])
    with CatalogRepository(tmp_path / "catalog.db") as repo:
        imported = import_catalog(repo, tmp_path, "manifest.json", "lego-elements")
        assert imported.coverage == {"C": 2, "G": 0}
        assert repo.connection.execute("SELECT COUNT(*) FROM parts").fetchone()[0] == 1
        assert repo.connection.execute("SELECT COUNT(*) FROM variants").fetchone()[0] == 2
        design_refs = [dict(row) for row in repo.connection.execute(
            "SELECT * FROM external_refs WHERE source='LEGO-Design' AND external_id='11211'")]
        element_refs = [dict(row) for row in repo.connection.execute(
            "SELECT * FROM external_refs WHERE source='LEGO-Element' ORDER BY external_id")]
        assert len(design_refs) == 1
        assert design_refs[0]["target_kind"] == "Part"
        assert [row["external_id"] for row in element_refs] == ["6135606", "6411587"]
        assert all(row["target_kind"] == "Variant" for row in element_refs)
        assert len({row["target_id"] for row in element_refs}) == 2
        part_ids = {row[0] for row in repo.connection.execute("SELECT part_id FROM variants")}
        assert part_ids == {design_refs[0]["target_id"]}


def test_IT_001_Import_TransactionFaultRollsBackCandidateAndRun(tmp_path):
    fixture(tmp_path)
    with CatalogRepository(tmp_path / "catalog.db") as repo:
        repo.connection.execute("CREATE TRIGGER fail_entry BEFORE INSERT ON snapshot_entries "
                                "BEGIN SELECT RAISE(ABORT, 'fault'); END")
        with pytest.raises(Exception):
            import_catalog(repo, tmp_path, "manifest.json", "fault")
        for table in ("snapshots", "parts", "variants", "source_artifacts", "evidence",
                      "snapshot_entries", "catalog_import_runs"):
            assert repo.connection.execute("SELECT COUNT(*) FROM " + table).fetchone()[0] == 0


def test_import_retry_rejects_corrupt_archived_source(tmp_path):
    fixture(tmp_path)
    with CatalogRepository(tmp_path / "catalog.db") as repo:
        import_catalog(repo, tmp_path, "manifest.json", "job-1")
        artifact = repo.connection.execute("SELECT * FROM source_artifacts").fetchone()
        (tmp_path / artifact["storage_key"]).write_bytes(b"corrupt archive")
        with pytest.raises(CatalogError):
            import_catalog(repo, tmp_path, "manifest.json", "job-1")


def test_import_new_observation_keeps_its_own_immutable_provenance(tmp_path):
    manifest = fixture(tmp_path)
    with CatalogRepository(tmp_path / "catalog.db") as repo:
        first = import_catalog(repo, tmp_path, "manifest.json", "job-1")
        manifest["sources"][0]["observedAt"] = "2026-09-11T12:00:00Z"
        (tmp_path / "manifest.json").write_text(json.dumps(manifest), encoding="utf-8")
        second = import_catalog(repo, tmp_path, "manifest.json", "job-2")
        first_id = json.loads(repo.entries(first.snapshot_id)[0]["evidence_ids_json"])[0]
        second_id = json.loads(repo.entries(second.snapshot_id)[0]["evidence_ids_json"])[0]
        assert first_id != second_id
        dates = [row[0] for row in repo.connection.execute("SELECT observed_at FROM source_artifacts ORDER BY observed_at")]
        assert dates == ["2026-09-10T12:00:00Z", "2026-09-11T12:00:00Z"]


@pytest.mark.parametrize("version", [True, 1.0])
def test_import_rejects_noninteger_schema_version(tmp_path, version):
    manifest = fixture(tmp_path)
    manifest["schemaVersion"] = version
    (tmp_path / "manifest.json").write_text(json.dumps(manifest), encoding="utf-8")
    with CatalogRepository(tmp_path / "catalog.db") as repo:
        with pytest.raises(CatalogError):
            import_catalog(repo, tmp_path, "manifest.json", "job-1")


def test_IT_001_cross_source_union_preserves_independent_evidence_and_missing_pages(tmp_path):
    from tools.catalog.tests.unit.test_sc_001 import candidate, source, write_manifest, write_page
    first = write_page(tmp_path, "sources/first.json", [candidate("same-id", "System", "3001")])
    second = write_page(tmp_path, "sources/second.json", [candidate("same-id", "System", "3001")])
    write_manifest(tmp_path, [source("first", [first]), source("second", [second], expected_pages=2)],
                   ["System"])
    with CatalogRepository(tmp_path / "catalog.db") as repo:
        imported = import_catalog(repo, tmp_path, "manifest.json", "cross-source")
        assert imported.coverage == {"C": 1, "G": 1}
        assert repo.connection.execute("SELECT COUNT(*) FROM source_artifacts").fetchone()[0] == 2
        aliases = list(repo.connection.execute("SELECT * FROM external_refs WHERE target_kind='Variant'"))
        assert {row["source"] for row in aliases} == {"LEGO-Element", "first", "second"}
        assert len({row["target_id"] for row in aliases}) == 1
        assert list(repo.connection.execute("PRAGMA foreign_key_check")) == []
        assert repo.connection.execute("PRAGMA integrity_check").fetchone()[0] == "ok"
