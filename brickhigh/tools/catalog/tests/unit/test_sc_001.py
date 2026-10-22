"""SC-001：受控來源頁保留完整性與範圍缺口。"""

import hashlib
import json

from tools.catalog.importing import import_catalog
from tools.catalog.repository import CatalogRepository


BASELINE = "2026-09-08T15:59:59Z"


def write_page(workspace, name, records):
    data = json.dumps({"schemaVersion": 1, "records": records}, ensure_ascii=False).encode("utf-8")
    path = workspace / name
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)
    return {"number": 1, "path": name, "sha256": hashlib.sha256(data).hexdigest()}


def write_manifest(workspace, sources, families):
    manifest = {"schemaVersion": 1, "baselineAt": BASELINE, "expectedFamilies": families,
                "sources": sources}
    (workspace / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False), encoding="utf-8")


def source(name, pages, expected_pages=1):
    return {"name": name, "sourceUri": "https://example.invalid/" + name,
            "sourceVersion": "2026-09", "observedAt": "2026-09-10T12:00:00Z",
            "effectiveAt": "2026-09-08T15:59:59Z", "expectedPages": expected_pages,
            "pages": pages}


def candidate(element_id, family, design_id=None):
    return {"kind": "candidate", "sourceId": element_id, "designId": design_id or element_id,
            "elementId": element_id, "name": element_id, "family": family, "appearance": {"color": "4"}}


def test_UT_001_CatalogCoveragePolicy_CompleteArtifact_KeepsEvidence(tmp_path):
    page = write_page(tmp_path, "sources/system.json", [candidate("3001-red", "System")])
    write_manifest(tmp_path, [source("catalog", [page])], ["System"])
    with CatalogRepository(tmp_path / "catalog.db") as repo:
        result = import_catalog(repo, tmp_path, "manifest.json", "complete-source")
        artifact = dict(repo.connection.execute("SELECT * FROM source_artifacts").fetchone())
        metadata = json.loads(artifact["manifest_json"])
        assert artifact["digest"] == page["sha256"]
        assert artifact["observed_at"] == "2026-09-10T12:00:00Z"
        assert artifact["effective_at"] == BASELINE
        assert metadata["sourceVersion"] == "2026-09"
        assert metadata["pageNumber"] == 1
        assert metadata["expectedPages"] == 1
        assert result.coverage == {"C": 1, "G": 0}
        entry = repo.entries(result.snapshot_id)[0]
        projection = json.loads(entry["display_projection_json"])
        assert projection["designId"] == "3001-red"
        assert projection["elementId"] == "3001-red"


def test_UT_002_CatalogCoveragePolicy_ExpandedFamilies_KeepsCoverage(tmp_path):
    records = [candidate("sys", "System"), candidate("tech", "Technic"),
               candidate("duplo", "DUPLO"), candidate("head", "Minifigure"),
               candidate("other", "Other"),
               {"kind": "set", "sourceId": "set-1", "setNumber": "10334", "family": "System", "componentElementIds": ["sys", "tech"]},
               {"kind": "minifigure", "sourceId": "figure-1", "family": "Minifigure", "componentElementIds": ["head"]},
               {"kind": "excluded", "sourceId": "sticker-sheet", "family": "Other",
                "reason": "非積木附件，不列入變體分母"}]
    page = write_page(tmp_path, "sources/all.json", records)
    write_manifest(tmp_path, [source("multi", [page])],
                   ["System", "Technic", "DUPLO", "Minifigure", "Other"])
    with CatalogRepository(tmp_path / "catalog.db") as repo:
        result = import_catalog(repo, tmp_path, "manifest.json", "families")
        scope = json.loads(repo.snapshot(result.snapshot_id)["scope_manifest_json"])
        assert result.coverage == {"C": 5, "G": 0}
        assert set(scope["observedFamilies"]) == {"System", "Technic", "DUPLO", "Minifigure", "Other"}
        assert scope["expansions"] == [
            {"source": "multi", "sourceId": "set-1", "kind": "set", "componentElementIds": ["sys", "tech"], "setNumber": "10334"},
            {"source": "multi", "sourceId": "figure-1", "kind": "minifigure", "componentElementIds": ["head"]}]
        assert scope["exclusions"] == [{"source": "multi", "sourceId": "sticker-sheet",
                                         "family": "Other", "reason": "非積木附件，不列入變體分母"}]


def test_UT_003_CatalogCoveragePolicy_MissingPage_ReportsGap(tmp_path):
    page = write_page(tmp_path, "sources/partial.json", [candidate("3001-red", "System")])
    write_manifest(tmp_path, [source("partial", [page], expected_pages=2)], ["System", "Technic"])
    with CatalogRepository(tmp_path / "catalog.db") as repo:
        result = import_catalog(repo, tmp_path, "manifest.json", "partial-source")
        gaps = [dict(row) for row in repo.connection.execute("SELECT * FROM coverage_gaps ORDER BY kind")]
        assert result.coverage == {"C": 1, "G": 2}
        assert {row["kind"] for row in gaps} == {"MissingPage:2", "MissingFamily:Technic"}
        assert all(row["resolution_evidence_id"] is None for row in gaps)
        assert repo.coverage(result.snapshot_id)["release_allowed"] is False
