"""Gate 2 固定 20 件：以已驗證真 MeshCollider 證據閉環 logical sockets 與 compound collision proxy。"""

import json
from pathlib import Path

from tools.acceptance.audit_internal_model_set import MODEL_DIRS
from tools.acceptance.gate2_metadata_inputs import write_gate2_metadata_inputs
from tools.catalog.metadata_quality import inspect_metadata


PROJECT = Path(__file__).resolve().parents[4]
OUTPUT = PROJECT / "artifacts/acceptance/gate2-fixed20-metadata-inputs"


def test_gate2_verified_collision_fixtures_promote_logical_sockets_without_marking_ready():
    summary = write_gate2_metadata_inputs(PROJECT, MODEL_DIRS, OUTPUT)
    assert summary["collisionProxyCount"] == 20
    assert summary["referenceDimensionCount"] == 20
    assert summary["readyCount"] == 0
    checkpoint = (OUTPUT / "checkpoint-review.html").read_text(encoding="utf-8")
    assert "collisionProxy：</strong><span class='ok'>20/20" in checkpoint
    assert "本輪 20 件已驗證 Collision 視圖" in checkpoint
    assert "reference dimensions：</strong>20/20" in checkpoint
    assert "3005.dat" in checkpoint
    assert "3020.dat" in checkpoint
    assert "6141.dat" in checkpoint
    assert "11211.dat" in checkpoint
    assert "3069b.dat" in checkpoint
    assert "3298.dat" in checkpoint
    assert "3700.dat" in checkpoint
    assert "6060.dat" in checkpoint
    assert "4032a.dat" in checkpoint
    assert "4085c.dat" in checkpoint
    assert "30374.dat" in checkpoint
    assert "14417.dat" in checkpoint
    assert "14418.dat" in checkpoint
    assert "2780.dat" in checkpoint
    assert "3705.dat" in checkpoint
    assert "3437.dat" in checkpoint
    assert "973p06.dat" in checkpoint
    assert "藍色菱形" in checkpoint
    assert "青色方塊" in checkpoint
    assert "unity-playmode-meshcollider-cavity-v1" in checkpoint

    item = next(row for row in summary["items"] if row["folder"] == "3001-red-exploratory-v1")
    document = json.loads((OUTPUT / item["file"]).read_text(encoding="utf-8"))
    assert document["readyAsset"] is False
    assert "productionStatus" not in document
    assert len(document["connectors"]) == 16
    assert set(document["compatibilityProfiles"]) == {"system-stud-v1", "system-tube-v1"}

    sockets = [connector for connector in document["connectors"] if connector["profile"] == "system-tube-v1"]
    assert len(sockets) == 8
    assert {tuple(connector["position"]) for connector in sockets} == {
        (-.012, -.0096, -.004), (-.004, -.0096, -.004), (.004, -.0096, -.004), (.012, -.0096, -.004),
        (-.012, -.0096, .004), (-.004, -.0096, .004), (.004, -.0096, .004), (.012, -.0096, .004),
    }
    assert all(connector["side"] == "female" and connector["normal"] == [0, -1, 0] for connector in sockets)
    assert document["runtimeConnectorEvidence"]["method"] == "unity-playmode-meshcollider-cavity-v1"

    proxy = document["collisionProxy"]
    assert proxy["schemaVersion"] == 1
    assert proxy["coordinateProfile"] == "canonical-rh-metres-v1"
    assert len(proxy["shapes"]) == 9
    assert len(proxy["cavityChecks"]) == 8
    assert {connector_id for check in proxy["cavityChecks"] for connector_id in check["connectorIds"]} == {
        connector["id"] for connector in sockets
    }
    assert all(check["result"] == "Pass" for check in proxy["cavityChecks"])
    assert "ConnectorLocationsAndPairing" not in document["remainingChecks"]
    assert "CollisionCavities" not in document["remainingChecks"]

    result = inspect_metadata(document, {"boundsMeters": document["boundsMeters"]})
    assert result["geometryIssues"] == []

    plate_2x4 = next(row for row in summary["items"] if row["folder"] == "pm-20260923-plate-3020")
    plate_2x4_document = json.loads((OUTPUT / plate_2x4["file"]).read_text(encoding="utf-8"))
    plate_2x4_sockets = [connector for connector in plate_2x4_document["connectors"] if connector["profile"] == "system-tube-v1"]
    assert len(plate_2x4_sockets) == 8
    assert len(plate_2x4_document["collisionProxy"]["shapes"]) == 9
    assert len(plate_2x4_document["collisionProxy"]["cavityChecks"]) == 8
    assert plate_2x4_document["runtimeConnectorEvidence"]["modelSha256"] == "6d56c7aad41c7f7e45c6908eb62182c9f2adc1b53bc88ade0acf8e4c5f0ad868"
    assert plate_2x4_document["readyAsset"] is False
    assert "productionStatus" not in plate_2x4_document
    assert inspect_metadata(plate_2x4_document, {"boundsMeters": plate_2x4_document["boundsMeters"]})["geometryIssues"] == []

    brick_2x6 = next(row for row in summary["items"] if row["folder"] == "pm-20260927-expansion-v1/2456-colour14")
    brick_2x6_document = json.loads((OUTPUT / brick_2x6["file"]).read_text(encoding="utf-8"))
    brick_2x6_sockets = [connector for connector in brick_2x6_document["connectors"] if connector["profile"] == "system-tube-v1"]
    assert len(brick_2x6_sockets) == 12
    assert len(brick_2x6_document["collisionProxy"]["shapes"]) == 11
    assert len(brick_2x6_document["collisionProxy"]["cavityChecks"]) == 12
    assert brick_2x6_document["readyAsset"] is False
    assert "productionStatus" not in brick_2x6_document
    assert inspect_metadata(brick_2x6_document, {"boundsMeters": brick_2x6_document["boundsMeters"]})["geometryIssues"] == []

    transparent = next(row for row in summary["items"] if row["folder"] == "pm-20260923-transparent-color47")
    transparent_document = json.loads((OUTPUT / transparent["file"]).read_text(encoding="utf-8"))
    transparent_sockets = [connector for connector in transparent_document["connectors"] if connector["profile"] == "system-tube-v1"]
    assert len(transparent_sockets) == 8
    assert len(transparent_document["collisionProxy"]["shapes"]) == 9
    assert len(transparent_document["collisionProxy"]["cavityChecks"]) == 8
    assert transparent_document["runtimeConnectorEvidence"]["modelSha256"] == "16519b1afcff52322eea30e0aa8f5fbb3885abbba2a0e96726f3025014152475"
    assert transparent_document["readyAsset"] is False
    assert "productionStatus" not in transparent_document
    assert inspect_metadata(transparent_document, {"boundsMeters": transparent_document["boundsMeters"]})["geometryIssues"] == []

    brick_1x1 = next(row for row in summary["items"] if row["folder"] == "pm-20260927-expansion-v1/3005-colour14")
    brick_1x1_document = json.loads((OUTPUT / brick_1x1["file"]).read_text(encoding="utf-8"))
    brick_1x1_sockets = [connector for connector in brick_1x1_document["connectors"] if connector["profile"] == "system-tube-v1"]
    assert len(brick_1x1_sockets) == 1
    assert brick_1x1_sockets[0]["position"] == [0.0, -0.0096, 0.0]
    assert len(brick_1x1_document["collisionProxy"]["shapes"]) == 5
    assert len(brick_1x1_document["collisionProxy"]["cavityChecks"]) == 1
    assert brick_1x1_document["runtimeConnectorEvidence"]["modelSha256"] == "0c2bba4a76e6446c9d34db1fd0eb1c9940057fe5a749062c48e5f8ccd28cd185"
    assert brick_1x1_document["readyAsset"] is False
    assert "productionStatus" not in brick_1x1_document
    assert inspect_metadata(brick_1x1_document, {"boundsMeters": brick_1x1_document["boundsMeters"]})["geometryIssues"] == []

    round_plate = next(row for row in summary["items"] if row["folder"] == "pm-20260927-expansion-v1/6141-colour4")
    round_plate_document = json.loads((OUTPUT / round_plate["file"]).read_text(encoding="utf-8"))
    round_plate_sockets = [connector for connector in round_plate_document["connectors"] if connector["profile"] == "system-tube-v1"]
    assert len(round_plate_sockets) == 1
    assert round_plate_sockets[0]["position"] == [0.0, -0.0032, 0.0]
    assert len(round_plate_document["collisionProxy"]["shapes"]) == 5
    assert len(round_plate_document["collisionProxy"]["cavityChecks"]) == 1
    assert round_plate_document["runtimeConnectorEvidence"]["modelSha256"] == "8cdd826e3b98c546147b4be3d00e311350477e89c0de3658095c8244501fdc94"
    assert round_plate_document["readyAsset"] is False
    assert "productionStatus" not in round_plate_document
    assert inspect_metadata(round_plate_document, {"boundsMeters": round_plate_document["boundsMeters"]})["geometryIssues"] == []

    side_stud_brick = next(row for row in summary["items"] if row["folder"] == "pm-20260927-expansion-v1/11211-colour4")
    side_stud_document = json.loads((OUTPUT / side_stud_brick["file"]).read_text(encoding="utf-8"))
    side_stud_sockets = [connector for connector in side_stud_document["connectors"] if connector["profile"] == "system-tube-v1"]
    side_stud_male = [connector for connector in side_stud_document["connectors"] if connector["profile"] == "system-stud-v1" and connector["side"] == "male"]
    assert len(side_stud_male) == 4
    assert len(side_stud_sockets) == 2
    assert {tuple(connector["position"]) for connector in side_stud_sockets} == {
        (-.004, -.0096, 0.0), (.004, -.0096, 0.0),
    }
    assert len(side_stud_document["collisionProxy"]["shapes"]) == 6
    assert len(side_stud_document["collisionProxy"]["cavityChecks"]) == 2
    assert side_stud_document["runtimeConnectorEvidence"]["modelSha256"] == "d1536d0fc2299b7ce220e282e7934b95d8f8cd99d2ccc9b0b5da693869db3699"
    assert side_stud_document["sourceConnectorEvidence"]["promotedCount"] == 4
    assert side_stud_document["readyAsset"] is False
    assert "productionStatus" not in side_stud_document
    assert inspect_metadata(side_stud_document, {"boundsMeters": side_stud_document["boundsMeters"]})["geometryIssues"] == []

    tile_1x2 = next(row for row in summary["items"] if row["folder"] == "pm-20260927-expansion-v1/3069b-colour14")
    tile_document = json.loads((OUTPUT / tile_1x2["file"]).read_text(encoding="utf-8"))
    tile_sockets = [connector for connector in tile_document["connectors"] if connector["profile"] == "system-tube-v1"]
    tile_male = [connector for connector in tile_document["connectors"] if connector["side"] == "male"]
    assert tile_male == []
    assert len(tile_sockets) == 2
    assert {tuple(connector["position"]) for connector in tile_sockets} == {
        (-.004, -.0032, 0.0), (.004, -.0032, 0.0),
    }
    assert len(tile_document["collisionProxy"]["shapes"]) == 6
    assert len(tile_document["collisionProxy"]["cavityChecks"]) == 2
    assert tile_document["runtimeConnectorEvidence"]["modelSha256"] == "4c5c68d59b1fbc7b7a6492d9132a8848bd76c9b76e2d9a0ae0bb7b9e322ea321"
    assert not tile_document.get("sourceConnectorEvidence")
    assert tile_document["readyAsset"] is False
    assert "productionStatus" not in tile_document
    assert inspect_metadata(tile_document, {"boundsMeters": tile_document["boundsMeters"]})["geometryIssues"] == []

    asymmetric_slope = next(row for row in summary["items"] if row["folder"] == "pm-20260923-asymmetric-slope-3298-materials-v2")
    slope_document = json.loads((OUTPUT / asymmetric_slope["file"]).read_text(encoding="utf-8"))
    slope_sockets = [connector for connector in slope_document["connectors"] if connector["profile"] == "system-tube-v1"]
    slope_male = [connector for connector in slope_document["connectors"] if connector["profile"] == "system-stud-v1" and connector["side"] == "male"]
    assert len(slope_male) == 2
    assert len(slope_sockets) == 6
    assert {tuple(connector["position"]) for connector in slope_sockets} == {
        (-.004, -.0096, 0.0), (.004, -.0096, 0.0),
        (-.004, -.0096, .008), (.004, -.0096, .008),
        (-.004, -.0096, .016), (.004, -.0096, .016),
    }
    assert len(slope_document["collisionProxy"]["shapes"]) == 8
    assert len(slope_document["collisionProxy"]["cavityChecks"]) == 6
    assert slope_document["runtimeConnectorEvidence"]["modelSha256"] == "ce1a16e98492945427e45bb5df4b7590b7b04a7f90f044de94843396e3a986e1"
    assert slope_document["sourceConnectorEvidence"]["promotedCount"] == 2
    assert slope_document["readyAsset"] is False
    assert "productionStatus" not in slope_document
    assert inspect_metadata(slope_document, {"boundsMeters": slope_document["boundsMeters"]})["geometryIssues"] == []

    technic_brick = next(row for row in summary["items"] if row["folder"] == "pm-20260927-expansion-v1/3700-colour7")
    technic_document = json.loads((OUTPUT / technic_brick["file"]).read_text(encoding="utf-8"))
    technic_male = [connector for connector in technic_document["connectors"] if connector["profile"] == "system-stud-v1" and connector["side"] == "male"]
    technic_holes = [connector for connector in technic_document["connectors"] if connector["profile"] == "technic-pin-hole-v1" and connector["side"] == "female"]
    technic_system_sockets = [connector for connector in technic_document["connectors"] if connector["profile"] == "system-tube-v1"]
    assert len(technic_male) == 2
    assert len(technic_holes) == 2
    assert {connector["id"] for connector in technic_holes} == {"source-technic-pin-hole-003", "source-technic-pin-hole-004"}
    assert {tuple(connector["position"]) for connector in technic_holes} == {(0.0, -.004, -.004), (0.0, -.004, .004)}
    assert len(technic_system_sockets) == 2
    assert {tuple(connector["position"]) for connector in technic_system_sockets} == {(-.004, -.0096, 0.0), (.004, -.0096, 0.0)}
    assert len(technic_document["connectors"]) == 6
    assert set(technic_document["compatibilityProfiles"]) == {
        "system-stud-v1", "system-tube-v1", "technic-friction-pin-v1", "technic-pin-hole-v1",
    }
    technic_proxy = technic_document["collisionProxy"]
    assert len(technic_proxy["shapes"]) == 8
    assert len(technic_proxy["cavityChecks"]) == 4
    technic_passage = technic_proxy["passageChecks"][0]
    assert technic_passage["id"] == "technic-pin-hole-through"
    assert technic_passage["start"] == [0.0, -.004, -.00385]
    assert technic_passage["end"] == [0.0, -.004, .00385]
    assert technic_passage["radiusMeters"] == .0022
    assert technic_passage["result"] == "Pass"
    source_hole_checks = [check for check in technic_proxy["cavityChecks"] if check["connectorIds"][0].startswith("source-technic-pin-hole-")]
    assert len(source_hole_checks) == 2
    assert all(check["passageCheckIds"] == ["technic-pin-hole-through"] and check["result"] == "Pass" for check in source_hole_checks)
    assert technic_document["runtimeConnectorEvidence"]["modelSha256"] == "91878df24b3e7c1792df875ad017c5aa0aed2c1e37e6573937e1174f8681f024"
    assert technic_document["runtimeConnectorEvidence"]["socketCount"] == 2
    assert technic_document["runtimeConnectorEvidence"]["specialConnectorCount"] == 0
    assert technic_document["runtimeConnectorEvidence"]["sourceConnectorCheckCount"] == 2
    assert technic_document["runtimeConnectorEvidence"]["connectorCount"] == 2
    assert technic_document["runtimeConnectorEvidence"]["passageCheckCount"] == 1
    assert technic_document["sourceConnectorEvidence"]["promotedCount"] == 4
    assert technic_brick["runtimeConnectorCount"] == 2
    assert technic_document["readyAsset"] is False
    assert "productionStatus" not in technic_document
    assert inspect_metadata(technic_document, {"boundsMeters": technic_document["boundsMeters"]})["geometryIssues"] == []

    mixed_round_plate = next(row for row in summary["items"] if row["folder"] == "pm-20260927-expansion-v1/4032a-colour4")
    mixed_document = json.loads((OUTPUT / mixed_round_plate["file"]).read_text(encoding="utf-8"))
    mixed_male = [connector for connector in mixed_document["connectors"] if connector["profile"] == "system-stud-v1" and connector["side"] == "male"]
    mixed_system_sockets = [connector for connector in mixed_document["connectors"] if connector["profile"] == "system-tube-v1"]
    mixed_axle_holes = [connector for connector in mixed_document["connectors"] if connector["profile"] == "technic-axle-hole-v1"]
    assert len(mixed_male) == 4
    assert len(mixed_system_sockets) == 4
    assert {tuple(connector["position"]) for connector in mixed_system_sockets} == {
        (-.004, -.0032, -.004), (-.004, -.0032, .004),
        (.004, -.0032, -.004), (.004, -.0032, .004),
    }
    assert len(mixed_axle_holes) == 1
    assert mixed_axle_holes[0]["id"] == "runtime-axle-hole-001"
    assert mixed_axle_holes[0]["family"] == "axle-hole"
    assert mixed_axle_holes[0]["side"] == "female"
    assert mixed_axle_holes[0]["position"] == [0.0, -.0032, 0.0]
    assert mixed_axle_holes[0]["degreesOfFreedom"] == ["axial-insert"]
    assert set(mixed_document["compatibilityProfiles"]) == {
        "system-stud-v1", "system-tube-v1", "technic-axle-v1", "technic-axle-hole-v1",
    }
    mixed_proxy = mixed_document["collisionProxy"]
    assert len(mixed_proxy["shapes"]) == 12
    assert len(mixed_proxy["cavityChecks"]) == 5
    special_check = next(check for check in mixed_proxy["cavityChecks"] if check["connectorIds"] == ["runtime-axle-hole-001"])
    assert special_check["passageCheckIds"] == [
        "axle-center", "axle-arm-x-negative", "axle-arm-x-positive", "axle-arm-z-negative", "axle-arm-z-positive",
    ]
    assert special_check["result"] == "Pass"
    assert len(mixed_proxy["passageChecks"]) == 5
    assert {check["id"] for check in mixed_proxy["passageChecks"]} == {
        "axle-center", "axle-arm-x-negative", "axle-arm-x-positive", "axle-arm-z-negative", "axle-arm-z-positive",
    }
    assert all(check["result"] == "Pass" for check in mixed_proxy["passageChecks"])
    assert mixed_document["runtimeConnectorEvidence"]["modelSha256"] == "903f712e65ee35f56505e9155100f354c588a5f08d2717f340ed6a394a004a26"
    assert mixed_document["runtimeConnectorEvidence"]["socketCount"] == 4
    assert mixed_document["runtimeConnectorEvidence"]["specialConnectorCount"] == 1
    assert mixed_document["runtimeConnectorEvidence"]["connectorCount"] == 5
    assert mixed_document["runtimeConnectorEvidence"]["passageCheckCount"] == 5
    assert mixed_document["sourceConnectorEvidence"]["promotedCount"] == 4
    assert mixed_document["readyAsset"] is False
    assert "productionStatus" not in mixed_document
    assert inspect_metadata(mixed_document, {"boundsMeters": mixed_document["boundsMeters"]})["geometryIssues"] == []

    curved_arch = next(row for row in summary["items"] if row["folder"] == "pm-20260927-expansion-v1/6060-colour4")
    arch_document = json.loads((OUTPUT / curved_arch["file"]).read_text(encoding="utf-8"))
    arch_sockets = [connector for connector in arch_document["connectors"] if connector["profile"] == "system-tube-v1"]
    arch_male = [connector for connector in arch_document["connectors"] if connector["profile"] == "system-stud-v1" and connector["side"] == "male"]
    assert len(arch_male) == 2
    assert len(arch_sockets) == 3
    assert {tuple(connector["position"]) for connector in arch_sockets} == {
        (0.0, -.0096, -.004), (0.0, -.0096, .004), (0.0, -.032, .036),
    }
    arch_proxy = arch_document["collisionProxy"]
    assert len(arch_proxy["shapes"]) == 15
    assert len(arch_proxy["cavityChecks"]) == 3
    assert len(arch_proxy["passageChecks"]) == 1
    passage = arch_proxy["passageChecks"][0]
    assert passage["id"] == "arch-opening-width"
    assert passage["start"] == [-.0055, -.020, .020]
    assert passage["end"] == [.0055, -.020, .020]
    assert passage["radiusMeters"] == .001
    assert passage["result"] == "Pass"
    assert arch_document["runtimeConnectorEvidence"]["modelSha256"] == "94540a235c8aff26377b13c975623b24b658c925082d6f285a4ca747989f7069"
    assert arch_document["runtimeConnectorEvidence"]["socketCount"] == 3
    assert arch_document["runtimeConnectorEvidence"]["passageCheckCount"] == 1
    assert arch_document["sourceConnectorEvidence"]["promotedCount"] == 2
    assert arch_document["readyAsset"] is False
    assert "productionStatus" not in arch_document
    assert inspect_metadata(arch_document, {"boundsMeters": arch_document["boundsMeters"]})["geometryIssues"] == []

    clip_plate = next(row for row in summary["items"] if row["folder"] == "pm-20260927-expansion-v1/4085c-colour7")
    clip_document = json.loads((OUTPUT / clip_plate["file"]).read_text(encoding="utf-8"))
    clip_system_sockets = [connector for connector in clip_document["connectors"] if connector["profile"] == "system-tube-v1"]
    clip_connectors = [connector for connector in clip_document["connectors"] if connector["profile"] == "clip-v1"]
    assert len(clip_system_sockets) == 1
    assert clip_system_sockets[0]["position"] == [0.0, -.0032, 0.0]
    assert len(clip_connectors) == 1
    assert clip_connectors[0]["side"] == "female"
    assert clip_connectors[0]["position"] == [0.0, -.0016, .008]
    assert clip_connectors[0]["degreesOfFreedom"] == ["axial-insert", "axial-rotate"]
    assert set(clip_document["compatibilityProfiles"]) == {"system-stud-v1", "system-tube-v1", "clip-v1", "bar-v1"}
    clip_proxy = clip_document["collisionProxy"]
    assert len(clip_proxy["shapes"]) == 7
    assert len(clip_proxy["cavityChecks"]) == 2
    assert len(clip_proxy["passageChecks"]) == 1
    assert clip_proxy["passageChecks"][0]["id"] == "clip-bar-opening"
    assert clip_proxy["passageChecks"][0]["result"] == "Pass"
    assert clip_document["runtimeConnectorEvidence"]["method"] == "unity-playmode-meshcollider-connector-v1"
    assert clip_document["runtimeConnectorEvidence"]["modelSha256"] == "3fae779da4cc9b71ffe23b0e809ebde870972e7fcdf350854565d85bc45538a4"
    assert clip_document["runtimeConnectorEvidence"]["socketCount"] == 1
    assert clip_document["runtimeConnectorEvidence"]["specialConnectorCount"] == 1
    assert clip_document["runtimeConnectorEvidence"]["passageCheckCount"] == 1
    assert clip_document["runtimeConnectorEvidence"]["solidCheckCount"] == 0
    assert clip_document["sourceConnectorEvidence"]["promotedCount"] == 1
    assert clip_document["readyAsset"] is False
    assert "productionStatus" not in clip_document
    assert inspect_metadata(clip_document, {"boundsMeters": clip_document["boundsMeters"]})["geometryIssues"] == []

    bar = next(row for row in summary["items"] if row["folder"] == "pm-20260927-expansion-v1/30374-colour4")
    bar_document = json.loads((OUTPUT / bar["file"]).read_text(encoding="utf-8"))
    bar_connectors = [connector for connector in bar_document["connectors"] if connector["profile"] == "bar-v1"]
    assert len(bar_connectors) == 1
    assert bar_connectors[0]["side"] == "male"
    assert bar_connectors[0]["position"] == [0.0, -.016, 0.0]
    assert bar_connectors[0]["degreesOfFreedom"] == ["axial-insert", "axial-rotate", "axial-slide"]
    assert set(bar_document["compatibilityProfiles"]) == {"bar-v1", "clip-v1"}
    bar_proxy = bar_document["collisionProxy"]
    assert len(bar_proxy["shapes"]) == 1
    assert bar_proxy["cavityChecks"] == []
    assert bar_proxy["passageChecks"] == []
    assert len(bar_proxy["solidChecks"]) == 2
    assert {check["id"] for check in bar_proxy["solidChecks"]} == {"bar-surface-x-positive", "bar-surface-z-positive"}
    assert all(check["connectorIds"] == ["runtime-bar-001"] and check["result"] == "Pass" for check in bar_proxy["solidChecks"])
    assert bar_document["runtimeConnectorEvidence"]["method"] == "unity-playmode-meshcollider-connector-v1"
    assert bar_document["runtimeConnectorEvidence"]["modelSha256"] == "d39fc37a85882044d12e56e39cb1e8cee3dc25f72b153be8914b4bbc2df6711a"
    assert bar_document["runtimeConnectorEvidence"]["socketCount"] == 0
    assert bar_document["runtimeConnectorEvidence"]["specialConnectorCount"] == 1
    assert bar_document["runtimeConnectorEvidence"]["passageCheckCount"] == 0
    assert bar_document["runtimeConnectorEvidence"]["solidCheckCount"] == 2
    assert bar_document["readyAsset"] is False
    assert "productionStatus" not in bar_document
    assert inspect_metadata(bar_document, {"boundsMeters": bar_document["boundsMeters"]})["geometryIssues"] == []

    ball_plate = next(row for row in summary["items"] if row["folder"] == "pm-20260927-expansion-v1/14417-colour7")
    ball_document = json.loads((OUTPUT / ball_plate["file"]).read_text(encoding="utf-8"))
    ball_connector = next(connector for connector in ball_document["connectors"] if connector["profile"] == "ball-v1")
    ball_system_sockets = [connector for connector in ball_document["connectors"] if connector["profile"] == "system-tube-v1"]
    assert ball_connector["id"] == "source-ball-001"
    assert ball_connector["side"] == "male"
    assert ball_connector["position"] == [0.0, -.0016, .008]
    assert ball_connector["normal"] == [0.0, 0.0, 1.0]
    assert ball_connector["tangent"] == [1.0, 0.0, 0.0]
    assert ball_connector["degreesOfFreedom"] == ["spherical-rotate"]
    assert len(ball_system_sockets) == 2
    assert {tuple(connector["position"]) for connector in ball_system_sockets} == {(-.004, -.0032, 0.0), (.004, -.0032, 0.0)}
    assert set(ball_document["compatibilityProfiles"]) == {"ball-v1", "socket-v1", "system-stud-v1", "system-tube-v1"}
    ball_proxy = ball_document["collisionProxy"]
    assert len(ball_proxy["shapes"]) == 8
    assert len(ball_proxy["cavityChecks"]) == 2
    assert ball_proxy["passageChecks"] == []
    assert {check["id"] for check in ball_proxy["solidChecks"]} == {"ball-solid-x", "ball-solid-y", "ball-solid-z"}
    assert all(check["connectorIds"] == ["source-ball-001"] and check["result"] == "Pass" for check in ball_proxy["solidChecks"])
    assert ball_document["runtimeConnectorEvidence"]["method"] == "unity-playmode-meshcollider-ball-socket-v1"
    assert ball_document["runtimeConnectorEvidence"]["modelSha256"] == "511beabe69f2bde2585c40f64fb1649bcc09a2b6b74d87542d9425e4450dc7a3"
    assert ball_document["runtimeConnectorEvidence"]["socketCount"] == 2
    assert ball_document["runtimeConnectorEvidence"]["sourceConnectorCheckCount"] == 1
    assert ball_document["runtimeConnectorEvidence"]["solidCheckCount"] == 3
    assert ball_document["sourceConnectorEvidence"]["promotedCount"] == 3
    assert ball_document["readyAsset"] is False
    assert "productionStatus" not in ball_document
    assert inspect_metadata(ball_document, {"boundsMeters": ball_document["boundsMeters"]})["geometryIssues"] == []

    socket_plate = next(row for row in summary["items"] if row["folder"] == "pm-20260927-expansion-v1/14418-colour7")
    socket_document = json.loads((OUTPUT / socket_plate["file"]).read_text(encoding="utf-8"))
    socket_connector = next(connector for connector in socket_document["connectors"] if connector["profile"] == "socket-v1")
    socket_system_sockets = [connector for connector in socket_document["connectors"] if connector["profile"] == "system-tube-v1"]
    assert socket_connector["id"] == "source-socket-001"
    assert socket_connector["side"] == "female"
    assert socket_connector["position"] == [.012, -.0016, 0.0]
    assert socket_connector["normal"] == [1.0, 0.0, 0.0]
    assert socket_connector["tangent"] == [0.0, 0.0, -1.0]
    assert socket_connector["degreesOfFreedom"] == ["spherical-rotate"]
    assert len(socket_system_sockets) == 2
    assert {tuple(connector["position"]) for connector in socket_system_sockets} == {(-.004, -.0032, 0.0), (.004, -.0032, 0.0)}
    assert set(socket_document["compatibilityProfiles"]) == {"ball-v1", "socket-v1", "system-stud-v1", "system-tube-v1"}
    socket_proxy = socket_document["collisionProxy"]
    assert len(socket_proxy["shapes"]) == 10
    assert len(socket_proxy["cavityChecks"]) == 3
    assert len(socket_proxy["passageChecks"]) == 1
    assert socket_proxy["passageChecks"][0]["id"] == "socket-center-opening"
    assert socket_proxy["passageChecks"][0]["start"] == [.0138, -.0016, 0.0]
    assert socket_proxy["passageChecks"][0]["end"] == [.0092, -.0016, 0.0]
    assert socket_proxy["passageChecks"][0]["radiusMeters"] == .0007
    assert socket_proxy["passageChecks"][0]["result"] == "Pass"
    source_socket_check = next(check for check in socket_proxy["cavityChecks"] if check["connectorIds"] == ["source-socket-001"])
    assert source_socket_check["passageCheckIds"] == ["socket-center-opening"]
    assert source_socket_check["result"] == "Pass"
    assert socket_proxy["solidChecks"] == []
    assert socket_document["runtimeConnectorEvidence"]["method"] == "unity-playmode-meshcollider-ball-socket-v1"
    assert socket_document["runtimeConnectorEvidence"]["modelSha256"] == "328944e9c53164d7b7c8d5c46625f3c1d4c88ae3ebaf7ef0dc247e9b883aa415"
    assert socket_document["runtimeConnectorEvidence"]["socketCount"] == 2
    assert socket_document["runtimeConnectorEvidence"]["sourceConnectorCheckCount"] == 1
    assert socket_document["runtimeConnectorEvidence"]["passageCheckCount"] == 1
    assert socket_document["sourceConnectorEvidence"]["promotedCount"] == 3
    assert socket_document["readyAsset"] is False
    assert "productionStatus" not in socket_document
    assert inspect_metadata(socket_document, {"boundsMeters": socket_document["boundsMeters"]})["geometryIssues"] == []

    friction_pin = next(row for row in summary["items"] if row["folder"] == "pm-20260923-technic-pin-2780")
    pin_document = json.loads((OUTPUT / friction_pin["file"]).read_text(encoding="utf-8"))
    pin_connectors = [connector for connector in pin_document["connectors"] if connector["profile"] == "technic-friction-pin-v1"]
    assert {connector["id"] for connector in pin_connectors} == {"source-technic-pin-001", "source-technic-pin-002"}
    assert {tuple(connector["normal"]) for connector in pin_connectors} == {(-1.0, 0.0, 0.0), (1.0, 0.0, 0.0)}
    assert all(connector["position"] == [0.0, 0.0, 0.0] for connector in pin_connectors)
    assert all(connector["degreesOfFreedom"] == ["axial-insert", "axial-rotate"] for connector in pin_connectors)
    assert set(pin_document["compatibilityProfiles"]) == {"technic-friction-pin-v1", "technic-pin-hole-v1"}
    pin_proxy = pin_document["collisionProxy"]
    assert len(pin_proxy["shapes"]) == 1
    assert pin_proxy["cavityChecks"] == []
    assert pin_proxy["passageChecks"] == []
    assert {check["id"] for check in pin_proxy["solidChecks"]} == {"pin-solid-y", "pin-solid-z"}
    assert all(set(check["connectorIds"]) == {"source-technic-pin-001", "source-technic-pin-002"} and check["result"] == "Pass" for check in pin_proxy["solidChecks"])
    assert pin_document["runtimeConnectorEvidence"]["method"] == "unity-playmode-meshcollider-connector-v1"
    assert pin_document["runtimeConnectorEvidence"]["modelSha256"] == "2e8dd470e90093ec7974494d5661153e22e7114d00544a6ff8d80209a8ed4ac1"
    assert pin_document["runtimeConnectorEvidence"]["sourceConnectorCheckCount"] == 2
    assert pin_document["runtimeConnectorEvidence"]["solidCheckCount"] == 2
    assert pin_document["sourceConnectorEvidence"]["promotedCount"] == 2
    assert pin_document["readyAsset"] is False
    assert "productionStatus" not in pin_document
    assert inspect_metadata(pin_document, {"boundsMeters": pin_document["boundsMeters"]})["geometryIssues"] == []

    technic_axle = next(row for row in summary["items"] if row["folder"] == "pm-20260923-technic-axle-3705")
    axle_document = json.loads((OUTPUT / technic_axle["file"]).read_text(encoding="utf-8"))
    axle_connectors = [connector for connector in axle_document["connectors"] if connector["profile"] == "technic-axle-v1"]
    assert {connector["id"] for connector in axle_connectors} == {"source-technic-axle-001", "source-technic-axle-002"}
    assert {tuple(connector["position"]) for connector in axle_connectors} == {(-.016, 0.0, 0.0), (.016, 0.0, 0.0)}
    assert {tuple(connector["normal"]) for connector in axle_connectors} == {(-1.0, 0.0, 0.0), (1.0, 0.0, 0.0)}
    assert all(connector["degreesOfFreedom"] == ["axial-insert"] for connector in axle_connectors)
    assert set(axle_document["compatibilityProfiles"]) == {"technic-axle-v1", "technic-axle-hole-v1"}
    axle_proxy = axle_document["collisionProxy"]
    assert {shape["id"] for shape in axle_proxy["shapes"]} == {"axle-cross-y", "axle-cross-z"}
    assert axle_proxy["cavityChecks"] == []
    assert axle_proxy["passageChecks"] == []
    assert {check["id"] for check in axle_proxy["solidChecks"]} == {"axle-solid-x", "axle-solid-y", "axle-solid-z"}
    assert all(set(check["connectorIds"]) == {"source-technic-axle-001", "source-technic-axle-002"} and check["result"] == "Pass" for check in axle_proxy["solidChecks"])
    assert axle_document["runtimeConnectorEvidence"]["method"] == "unity-playmode-meshcollider-connector-v1"
    assert axle_document["runtimeConnectorEvidence"]["modelSha256"] == "0fe5c10db2552ba6f14afb6bd2e5f22c394050ff64acbfee3ec519802544d213"
    assert axle_document["runtimeConnectorEvidence"]["sourceConnectorCheckCount"] == 2
    assert axle_document["runtimeConnectorEvidence"]["solidCheckCount"] == 3
    assert axle_document["sourceConnectorEvidence"]["promotedCount"] == 2
    assert axle_document["readyAsset"] is False
    assert "productionStatus" not in axle_document
    assert inspect_metadata(axle_document, {"boundsMeters": axle_document["boundsMeters"]})["geometryIssues"] == []

    duplo = next(row for row in summary["items"] if row["folder"] == "pm-20260923-duplo-3437")
    duplo_document = json.loads((OUTPUT / duplo["file"]).read_text(encoding="utf-8"))
    duplo_studs = [connector for connector in duplo_document["connectors"] if connector["profile"] == "duplo-stud-v1"]
    duplo_sockets = [connector for connector in duplo_document["connectors"] if connector["profile"] == "duplo-tube-v1"]
    assert len(duplo_studs) == 4
    assert len(duplo_sockets) == 4
    assert {tuple(connector["position"]) for connector in duplo_sockets} == {
        (-.008, -.0192, -.008), (-.008, -.0192, .008),
        (.008, -.0192, -.008), (.008, -.0192, .008),
    }
    assert all(connector["family"] == "duplo-tube" and connector["side"] == "female" for connector in duplo_sockets)
    assert set(duplo_document["compatibilityProfiles"]) == {"duplo-stud-v1", "duplo-tube-v1"}
    duplo_proxy = duplo_document["collisionProxy"]
    assert len(duplo_proxy["shapes"]) == 9
    assert len(duplo_proxy["cavityChecks"]) == 4
    assert duplo_proxy["passageChecks"] == []
    assert duplo_proxy["solidChecks"] == []
    assert duplo_document["runtimeConnectorEvidence"]["method"] == "unity-playmode-meshcollider-duplo-v1"
    assert duplo_document["runtimeConnectorEvidence"]["modelSha256"] == "b2543e0d86404d473834bcabe70fda4cd3575998d379f3177af502ea300ef607"
    assert duplo_document["runtimeConnectorEvidence"]["socketCount"] == 4
    assert duplo_document["runtimeConnectorEvidence"]["connectorCount"] == 4
    assert duplo_document["sourceConnectorEvidence"]["promotedCount"] == 4
    assert "ConnectorLocationsAndPairing" not in duplo_document["remainingChecks"]
    assert "CollisionCavities" not in duplo_document["remainingChecks"]
    assert duplo_document["readyAsset"] is False
    assert "productionStatus" not in duplo_document
    assert inspect_metadata(duplo_document, {"boundsMeters": duplo_document["boundsMeters"]})["geometryIssues"] == []

    torso = next(row for row in summary["items"] if row["folder"] == "pm-20260923-printed-torso-973p06-color4")
    torso_document = json.loads((OUTPUT / torso["file"]).read_text(encoding="utf-8"))
    torso_connectors = torso_document["connectors"]
    assert len(torso_connectors) == 4
    assert {connector["id"] for connector in torso_connectors} == {
        "runtime-minifig-right-arm-socket",
        "runtime-minifig-left-arm-socket",
        "runtime-minifig-neck-post",
        "runtime-minifig-hips-socket",
    }
    assert set(torso_document["compatibilityProfiles"]) == {
        "minifig-arm-pin-v1",
        "minifig-torso-arm-socket-v1",
        "minifig-neck-post-v1",
        "minifig-head-socket-v1",
        "minifig-hips-post-v1",
        "minifig-torso-hips-socket-v1",
    }
    torso_proxy = torso_document["collisionProxy"]
    assert len(torso_proxy["shapes"]) == 6
    assert len(torso_proxy["cavityChecks"]) == 3
    assert {check["id"] for check in torso_proxy["passageChecks"]} == {
        "right-arm-socket-passage",
        "left-arm-socket-passage",
        "hips-socket-passage",
    }
    assert len(torso_proxy["solidChecks"]) == 1
    assert torso_proxy["solidChecks"][0]["id"] == "neck-post-solid"
    assert torso_proxy["solidChecks"][0]["connectorIds"] == ["runtime-minifig-neck-post"]
    assert torso_document["runtimeConnectorEvidence"]["method"] == "unity-playmode-meshcollider-minifig-torso-v1"
    assert torso_document["runtimeConnectorEvidence"]["modelSha256"] == "652080b9c5690db5a96bf8783b3eca1cc65dcf819d8f021b0ecbcf7b3467af74"
    assert torso_document["runtimeConnectorEvidence"]["specialConnectorCount"] == 4
    assert torso_document["runtimeConnectorEvidence"]["passageCheckCount"] == 3
    assert torso_document["runtimeConnectorEvidence"]["solidCheckCount"] == 1
    assert "ConnectorLocationsAndPairing" not in torso_document["remainingChecks"]
    assert "CollisionCavities" not in torso_document["remainingChecks"]
    assert torso_document["readyAsset"] is False
    assert "productionStatus" not in torso_document
    assert inspect_metadata(torso_document, {"boundsMeters": torso_document["boundsMeters"]})["geometryIssues"] == []
