"""Gate 2 固定 20 件：由 LDraw 標準 stud primitive 產生可追溯 connector candidates。"""

from functools import lru_cache
import json
import math
from pathlib import Path

import pytest

from tools.acceptance.audit_internal_model_set import MODEL_DIRS
from tools.catalog.building import merge_source_reference_metadata
from tools.catalog.policies import CatalogError
from tools.catalog.sources import inspect_ldraw


PROJECT = Path(__file__).resolve().parents[4]
LDRAW_LIBRARY = PROJECT / "artifacts/sources/ldraw-release/ldraw"
REPORT = PROJECT / "artifacts/acceptance/gate2-fixed20-connector-candidates.json"


@lru_cache(maxsize=None)
def source_manifest(folder):
    model_dir = PROJECT / "artifacts/models" / folder
    conversion = json.loads((model_dir / "conversion.json").read_text(encoding="utf-8"))
    source_archive = model_dir / "sources"
    source_root = source_archive if source_archive.is_dir() else LDRAW_LIBRARY
    return inspect_ldraw(source_root, conversion["source"]["filename"])


@lru_cache(maxsize=None)
def connector_evidence(folder):
    model_dir = PROJECT / "artifacts/models" / folder
    conversion = json.loads((model_dir / "conversion.json").read_text(encoding="utf-8"))
    source = source_manifest(folder)
    archived = {(item["path"], item["sha256"]) for item in conversion["source"]["files"]}
    inspected = {(item["path"], item["sha256"]) for item in source["files"]}
    return {
        "folder": folder,
        "sourcePart": conversion["source"]["filename"],
        "modelSha256": conversion["geometry"]["sha256"],
        "dependencyDigest": source["referenceGeometry"]["dependencyDigest"],
        "dependenciesMatchArchivedConversion": inspected == archived,
        "candidates": source["connectorCandidates"],
        "hints": source.get("connectorPrimitiveHints", []),
    }


def _rounded_position(candidate):
    return tuple(round(value, 7) for value in candidate["position"])


def test_gate2_3001_promotes_eight_studs_but_keeps_three_underside_tubes_as_hints():
    evidence = connector_evidence("3001-red-exploratory-v1")
    assert evidence["dependenciesMatchArchivedConversion"]
    candidates = evidence["candidates"]
    studs = [item for item in candidates if item["profile"] == "system-stud-v1"]
    assert len(studs) == 8
    assert not [item for item in candidates if item["profile"] == "system-tube-v1"]

    assert {_rounded_position(item) for item in studs} == {
        (-.012, 0, -.004), (-.004, 0, -.004), (.004, 0, -.004), (.012, 0, -.004),
        (-.012, 0, .004), (-.004, 0, .004), (.004, 0, .004), (.012, 0, .004),
    }
    assert all(item["side"] == "male" and item["normal"] == pytest.approx([0, 1, 0]) for item in studs)
    assert all(item["dependencyDigest"] == evidence["dependencyDigest"] for item in candidates)

    tubes = [item for item in evidence["hints"] if item["primitive"].endswith("/stud4.dat")]
    assert len(tubes) == 3
    assert {_rounded_position(item) for item in tubes} == {
        (-.008, -.0016, 0), (0, -.0016, 0), (.008, -.0016, 0),
    }
    assert all(item["normal"] == pytest.approx([0, -1, 0]) for item in tubes)


def test_gate2_2780_source_has_two_opposed_technic_friction_pin_candidates():
    evidence = connector_evidence("pm-20260923-technic-pin-2780")
    assert evidence["dependenciesMatchArchivedConversion"]
    pins = [item for item in evidence["candidates"] if item["profile"] == "technic-friction-pin-v1"]
    assert len(pins) == 2
    assert {_rounded_position(item) for item in pins} == {(0, 0, 0)}
    assert {tuple(round(value, 6) for value in item["normal"]) for item in pins} == {
        (-1.0, 0.0, 0.0), (1.0, 0.0, 0.0),
    }
    assert all(item["side"] == "male" for item in pins)


def test_gate2_14417_and_14418_promote_source_ball_socket_pair():
    ball_evidence = connector_evidence("pm-20260927-expansion-v1/14417-colour7")
    socket_evidence = connector_evidence("pm-20260927-expansion-v1/14418-colour7")
    assert ball_evidence["dependenciesMatchArchivedConversion"]
    assert socket_evidence["dependenciesMatchArchivedConversion"]

    balls = [item for item in ball_evidence["candidates"] if item["profile"] == "ball-v1"]
    sockets = [item for item in socket_evidence["candidates"] if item["profile"] == "socket-v1"]
    assert len(balls) == 1
    assert len(sockets) == 1
    assert balls[0]["primitive"].endswith("/joint8ball.dat")
    assert sockets[0]["primitive"].endswith("/joint8socket1.dat")
    assert balls[0]["side"] == "male"
    assert sockets[0]["side"] == "female"
    assert balls[0]["dependencyDigest"] == ball_evidence["dependencyDigest"]
    assert sockets[0]["dependencyDigest"] == socket_evidence["dependencyDigest"]


def test_gate2_3437_promotes_duplo_studs_but_keeps_underside_tube_as_hint():
    evidence = connector_evidence("pm-20260923-duplo-3437")
    assert evidence["dependenciesMatchArchivedConversion"]
    profiles = {item["profile"] for item in evidence["candidates"]}
    assert profiles == {"duplo-stud-v1"}
    assert all(not item["profile"].startswith("system-") for item in evidence["candidates"])
    tube = next(item for item in evidence["hints"] if item["primitive"].endswith("/stud8.dat"))
    stud = inspect_ldraw(LDRAW_LIBRARY, "stud7.dat")["referenceGeometry"]
    tube_geometry = inspect_ldraw(LDRAW_LIBRARY, "stud8.dat")["referenceGeometry"]
    assert tube["position"] == pytest.approx([0, -.0016, 0])
    assert tube["normal"] == pytest.approx([0, -1, 0])
    assert tube["tangent"] == pytest.approx([1, 0, 0])
    assert (tube["axisScaleLdu"], tube["tangentScaleLdu"], tube["bitangentScaleLdu"]) == pytest.approx((10, 1, 1))
    assert stud["dimensionsMeters"] == pytest.approx([.0096, .0016, .0096])
    assert tube_geometry["dimensionsMeters"] == pytest.approx([.0128, .0016, .0128])
    # stud8 是中央 clutch tube 幾何 hint，不是 logical socket anchor；四個 socket 必須另由真碰撞證據驗證。


def connector_promotion_status(folder):
    evidence = connector_evidence(folder)
    candidates = evidence["candidates"]
    metadata_path = PROJECT / "artifacts/models" / folder / "metadata.json"
    if not candidates:
        return {"folder": folder, "candidateCount": 0, "promotable": False,
                "reason": "no-supported-source-candidates"}
    if not metadata_path.is_file():
        return {"folder": folder, "candidateCount": len(candidates), "promotable": False,
                "reason": "metadata-missing"}
    metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
    collision_before = metadata.get("collisionProxy")
    try:
        merged = merge_source_reference_metadata(metadata, source_manifest(folder))
    except CatalogError as error:
        return {"folder": folder, "candidateCount": len(candidates), "promotable": False,
                "reason": "metadata-contract-conflict", "error": str(error)}
    source_evidence = merged.get("sourceConnectorEvidence") or {}
    promoted_count = source_evidence.get("promotedCount", 0)
    return {
        "folder": folder,
        "candidateCount": len(candidates),
        "promotable": promoted_count == len(candidates),
        "promotedCount": promoted_count,
        "profiles": source_evidence.get("profiles", []),
        "collisionProxyUnchanged": merged.get("collisionProxy") == collision_before,
        "pairingStillPending": "ConnectorLocationsAndPairing" in merged.get("remainingChecks", []),
        "collisionStillPending": "CollisionCavities" in merged.get("remainingChecks", []),
    }


def test_gate2_fixed20_connector_candidate_report_is_traceable_and_finite():
    items = [connector_evidence(folder) for folder in MODEL_DIRS]
    assert len(items) == 20
    assert all(item["dependenciesMatchArchivedConversion"] for item in items)
    for item in items:
        for candidate in item["candidates"]:
            assert candidate["profile"] in {
                "system-stud-v1", "duplo-stud-v1",
                "technic-friction-pin-v1", "technic-pin-hole-v1", "technic-axle-v1",
                "ball-v1", "socket-v1",
            }
            assert candidate["side"] in {"male", "female"}
            assert all(math.isfinite(value) for key in ("position", "normal", "tangent") for value in candidate[key])
            assert sum(value * value for value in candidate["normal"]) == pytest.approx(1)
            assert sum(value * value for value in candidate["tangent"]) == pytest.approx(1)
            assert sum(a * b for a, b in zip(candidate["normal"], candidate["tangent"])) == pytest.approx(0, abs=1e-9)
            assert candidate["dependencyDigest"] == item["dependencyDigest"]
        for hint in item["hints"]:
            assert hint["primitive"].startswith("p/")
            assert all(math.isfinite(value) for key in ("position", "normal", "tangent") for value in hint[key])
            assert all(math.isfinite(hint[key]) and hint[key] > 0 for key in
                       ("axisScaleLdu", "tangentScaleLdu", "bitangentScaleLdu"))
            assert hint["dependencyDigest"] == item["dependencyDigest"]

    candidate_model_count = sum(bool(item["candidates"]) for item in items)
    candidate_count = sum(len(item["candidates"]) for item in items)
    hint_model_count = sum(bool(item["hints"]) for item in items)
    hint_count = sum(len(item["hints"]) for item in items)
    hint_primitive_counts = {}
    hint_folders_by_primitive = {}
    for item in items:
        for hint in item["hints"]:
            primitive = hint["primitive"]
            hint_primitive_counts[primitive] = hint_primitive_counts.get(primitive, 0) + 1
            hint_folders_by_primitive.setdefault(primitive, [])
            if item["folder"] not in hint_folders_by_primitive[primitive]:
                hint_folders_by_primitive[primitive].append(item["folder"])
    assert candidate_model_count == 17
    assert candidate_count == 69

    promotions = [connector_promotion_status(folder) for folder in MODEL_DIRS]
    promotable = [item for item in promotions if item["promotable"]]
    assert promotable, "固定20件至少應有一件可由已驗證標準 primitive 安全升格 connector metadata。"
    assert all(item["promotedCount"] == item["candidateCount"] for item in promotable)
    assert all(item["collisionProxyUnchanged"] for item in promotable)
    assert all(item["pairingStillPending"] and item["collisionStillPending"] for item in promotable)

    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps({
        "schemaVersion": 1,
        "purpose": "Gate 2 fixed-20 LDraw standard connector primitive candidates",
        "itemCount": len(items),
        "candidateModelCount": candidate_model_count,
        "candidateCount": candidate_count,
        "unsupportedConnectorHintModelCount": hint_model_count,
        "unsupportedConnectorHintCount": hint_count,
        "unsupportedConnectorHintFolders": [item["folder"] for item in items if item["hints"]],
        "unsupportedConnectorHintPrimitiveCounts": dict(sorted(hint_primitive_counts.items())),
        "unsupportedConnectorHintFoldersByPrimitive": {key: hint_folders_by_primitive[key] for key in sorted(hint_folders_by_primitive)},
        "metadataPromotionEligibleCount": len(promotable),
        "metadataPromotionEligibleFolders": [item["folder"] for item in promotable],
        "promotionStatus": promotions,
        "formalConnectorEvidence": False,
        "items": items,
    }, ensure_ascii=False, indent=2), encoding="utf-8")
