"""真實 Blender／官方 LDraw 來源探針；不視為 Unity 或全量品質驗收。"""

import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import pytest

from tools.catalog.building import build_catalog
from tools.catalog.glb import inspect_glb
from tools.catalog.quality import quality_review_template
from tools.catalog.repository import CatalogRepository


def test_real_ldraw_brick_exports_nonempty_self_contained_model(tmp_path):
    workspace = Path(__file__).resolve().parents[4]
    library = workspace / 'artifacts/sources/ldraw-release/ldraw'
    importer = workspace / 'artifacts/toolchain/ImportLDraw'
    blender = shutil.which('blender')
    if not blender or not library.is_dir() or not importer.is_dir():
        pytest.skip('此整合探針需另外取得 Blender、固定 ImportLDraw 與官方來源。')
    result = subprocess.run([blender, '--background', '--factory-startup', '--python-exit-code', '4',
                             '--python', str(workspace / 'tools/catalog/blender_convert.py'), '--',
                             '--library', str(library), '--importer', str(importer), '--part', '3001.dat',
                             '--colour', '4', '--output', str(tmp_path / 'converted')],
                            capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=180)
    assert result.returncode == 0, result.stdout + result.stderr
    report = inspect_glb((tmp_path / 'converted/model.glb').read_bytes())
    assert report['triangles'] > 100
    assert report['boundsMeters']['max'][0] - report['boundsMeters']['min'][0] == pytest.approx(.032, abs=.0001)
    provenance = json.loads((tmp_path / 'converted/conversion.json').read_text(encoding='utf-8'))
    assert 'productionStatus' not in provenance
    assert provenance['qualityPassed'] is False
    assert provenance['source']['files']
    reference = provenance['source']['referenceGeometry']
    assert reference['dimensionsMeters'] == pytest.approx([.032, .0112, .016], abs=1e-9)
    assert len(reference['dependencyDigest']) == 64
    candidates = provenance['source']['connectorCandidates']
    assert len([item for item in candidates if item['profile'] == 'system-stud-v1']) == 8
    assert not [item for item in candidates if item['profile'] == 'system-tube-v1']
    tube_hints = [item for item in provenance['source']['connectorPrimitiveHints'] if item['primitive'].endswith('/stud4.dat')]
    assert len(tube_hints) == 3
    assert all(item['dependencyDigest'] == reference['dependencyDigest'] for item in [*candidates, *tube_hints])
    assert provenance['toolchain']['importerCommit'] == 'c306fb777a4e0da85492f09d65daf458767a0aa1'

@pytest.mark.parametrize("part_name,colour,metadata_file,family", [
    ("3001.dat", "4", "01-3001.json", "System"),
    ("3020.dat", "4", "02-3020.json", "System"),
    ("3001.dat", "47", "03-3001.json", "System"),
    ("973p06.dat", "4", "04-973p06.json", "Minifigure"),
    ("2780.dat", "4", "05-2780.json", "Technic"),
    ("3705.dat", "4", "06-3705.json", "Technic"),
    ("3437.dat", "4", "07-3437.json", "DUPLO"),
    ("3298.dat", "4", "08-3298.json", "System"),
    ("3700.dat", "7", "09-3700.json", "Technic"),
    ("4032a.dat", "4", "10-4032a.json", "System"),
    ("3069b.dat", "14", "11-3069b.json", "System"),
    ("4085c.dat", "7", "12-4085c.json", "System"),
    ("30374.dat", "4", "13-30374.json", "Technic"),
    ("14417.dat", "7", "14-14417.json", "Technic"),
    ("14418.dat", "7", "15-14418.json", "Technic"),
    ("11211.dat", "4", "16-11211.json", "System"),
    ("2456.dat", "14", "17-2456.json", "System"),
    ("6060.dat", "4", "18-6060.json", "System"),
    ("3005.dat", "14", "19-3005.json", "System"),
    ("6141.dat", "4", "20-6141.json", "System"),
], ids=["01-3001-color4","02-3020-color4","03-3001-color47","04-973p06-color4","05-2780-color4","06-3705-color4","07-3437-color4","08-3298-color4","09-3700-color7","10-4032a-color4","11-3069b-color14","12-4085c-color7","13-30374-color4","14-14417-color7","15-14418-color7","16-11211-color4","17-2456-color14","18-6060-color4","19-3005-color14","20-6141-color4"])
def test_gate3_real_3001_build_reuses_gate2_metadata_and_reaches_quality_review(
        part_name, colour, metadata_file, family):
    """固定20件以既有Gate2資料建立真 Catalog 版本；未經覆核維持 Validating。"""
    workspace = Path(__file__).resolve().parents[4]
    library = workspace / "artifacts/sources/ldraw-release/ldraw"
    importer = workspace / "artifacts/toolchain/ImportLDraw"
    metadata = workspace / "artifacts/acceptance/gate2-fixed20-metadata-inputs" / metadata_file
    if not shutil.which("blender") or not library.is_dir() or not importer.is_dir():
        pytest.skip("真實 Gate 3 測試需要固定 Blender、LDraw 與 ImportLDraw。")
    gate2 = json.loads(metadata.read_text(encoding="utf-8"))
    assert gate2["gate2Ready"] is True
    assert gate2["sourcePart"] == part_name

    with tempfile.TemporaryDirectory(prefix="gate3-fixed20-", dir=workspace / "artifacts/acceptance") as temp:
        temp_dir = Path(temp)
        database = temp_dir / "catalog.sqlite"
        with CatalogRepository(database, workspace=workspace) as repo:
            snapshot = repo.create_snapshot("2026-10-19T00:00:00Z", {"purpose": "InternalGate3Quality"})
            part = repo.add_part("Gate 3內部品質驗證", family, "InternalGate3:" + part_name)
            variant = repo.add_variant(part, {"color": colour})
            repo.put_entry(snapshot, variant, [], {"purpose": "InternalGate3"},
                           {"sourcePart": part_name, "notFormalSetMembership": True})
            repo.freeze(snapshot, repo.snapshot(snapshot)["version"])
            version = repo.snapshot(snapshot)["version"]
        plan_path = temp_dir / "plan.json"
        plan_path.write_text(json.dumps({
            "schemaVersion": 1, "snapshotId": snapshot, "snapshotVersion": version,
            "library": "artifacts/sources/ldraw-release/ldraw", "importer": "artifacts/toolchain/ImportLDraw",
            "items": [{"variantId": variant, "part": part_name, "colour": colour,
                       "metadata": {"path": metadata.relative_to(workspace).as_posix(),
                                    "sha256": hashlib.sha256(metadata.read_bytes()).hexdigest()}}],
        }, ensure_ascii=False), encoding="utf-8")
        result = build_catalog(workspace, database, snapshot, "gate3-fixed20-" + metadata_file,
                               plan_path.relative_to(workspace).as_posix())
        assert result["jobStatus"] == "Completed"
        with CatalogRepository(database, workspace=workspace) as repo:
            revision = repo.connection.execute(
                "SELECT * FROM model_revisions WHERE variant_id=?", (variant,)).fetchone()
            assert revision is not None and revision["status"] == "Validating"
            quality = quality_review_template(workspace, dict(revision),
                                              json.loads(revision["manifest_json"]))
            assert set(quality["reviews"]) == {"geometry", "appearance", "attribution"}
            assert all(item["decision"] == "Pending" for item in quality["reviews"].values())
            assert repo.entries(snapshot)[0]["selected_revision_id"] is None
            assert repo.head()["snapshot_id"] is None
