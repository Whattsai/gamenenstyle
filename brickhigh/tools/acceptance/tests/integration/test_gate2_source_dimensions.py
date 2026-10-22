"""Gate 2 固定 20 件：以原始 LDraw 幾何獨立核對既有 GLB 尺寸。"""

from functools import lru_cache
import json
from pathlib import Path

import pytest

from tools.acceptance.audit_internal_model_set import MODEL_DIRS
from tools.catalog.sources import inspect_ldraw


PROJECT = Path(__file__).resolve().parents[4]
LDRAW_LIBRARY = PROJECT / "artifacts/sources/ldraw-release/ldraw"
REPORT = PROJECT / "artifacts/acceptance/gate2-fixed20-source-dimensions.json"


@lru_cache(maxsize=None)
def source_dimension_evidence(folder):
    model_dir = PROJECT / "artifacts/models" / folder
    conversion = json.loads((model_dir / "conversion.json").read_text(encoding="utf-8"))
    source_archive = model_dir / "sources"
    source_root = source_archive if source_archive.is_dir() else LDRAW_LIBRARY
    source = inspect_ldraw(source_root, conversion["source"]["filename"])
    reference = source["referenceGeometry"]
    archived_dependencies = {(item["path"], item["sha256"]) for item in conversion["source"]["files"]}
    inspected_dependencies = {(item["path"], item["sha256"]) for item in source["files"]}
    bounds = conversion["geometry"]["boundsMeters"]
    actual = [high - low for low, high in zip(bounds["min"], bounds["max"])]
    expected = reference["dimensionsMeters"]
    tolerances = [max(.0001, .005 * value) + 1e-12 for value in expected]
    return {
        "folder": folder,
        "sourcePart": conversion["source"]["filename"],
        "modelSha256": conversion["geometry"]["sha256"],
        "referenceDimensions": expected,
        "glbDimensions": actual,
        "tolerances": tolerances,
        "referenceMethod": reference["method"],
        "referenceCoordinateProfile": reference["coordinateProfile"],
        "dependencyDigest": reference["dependencyDigest"],
        "dependenciesMatchArchivedConversion": inspected_dependencies == archived_dependencies,
    }


@pytest.mark.parametrize("folder", MODEL_DIRS, ids=lambda value: value.replace("/", "-"))
def test_gate2_fixed_model_source_reference_dimensions_match_generated_glb(folder):
    evidence = source_dimension_evidence(folder)
    assert evidence["referenceMethod"] == "ldraw-source-vertices-v1"
    assert evidence["referenceCoordinateProfile"] == "ldraw-canonical-metres-v1"
    assert len(evidence["dependencyDigest"]) == 64
    assert evidence["dependenciesMatchArchivedConversion"], "尺寸證據必須綁定製作當時同一批 LDraw 依賴。"
    for axis, (source_dimension, glb_dimension, tolerance) in enumerate(zip(
            evidence["referenceDimensions"], evidence["glbDimensions"], evidence["tolerances"])):
        assert abs(source_dimension - glb_dimension) <= tolerance, (
            f"{folder} axis={axis} LDraw={source_dimension!r} GLB={glb_dimension!r} "
            f"tolerance={tolerance!r}"
        )


def test_gate2_fixed_model_source_reference_report_is_written_from_verified_evidence():
    items = [source_dimension_evidence(folder) for folder in MODEL_DIRS]
    assert len(items) == 20
    assert all(item["dependenciesMatchArchivedConversion"] for item in items)
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps({
        "schemaVersion": 1,
        "purpose": "Gate 2 fixed-20 independent LDraw source dimensions",
        "itemCount": len(items),
        "items": items,
    }, ensure_ascii=False, indent=2), encoding="utf-8")
