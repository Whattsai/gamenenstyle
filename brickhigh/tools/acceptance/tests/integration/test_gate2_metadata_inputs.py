"""Gate 2 固定 20 件：下一 immutable revision 的 metadata input 必須可由既有證據重建。"""

import json
from pathlib import Path

import pytest

from tools.acceptance.audit_internal_model_set import MODEL_DIRS
from tools.acceptance.gate2_metadata_inputs import write_gate2_metadata_inputs


PROJECT = Path(__file__).resolve().parents[4]
OUTPUT = PROJECT / "artifacts/acceptance/gate2-fixed20-metadata-inputs"


def test_gate2_fixed20_metadata_inputs_promote_only_traceable_source_connectors():
    summary = write_gate2_metadata_inputs(PROJECT, MODEL_DIRS, OUTPUT)

    assert summary["itemCount"] == 20
    assert summary["candidateModelCount"] == 17
    assert summary["candidatePromotionCount"] == 17
    assert summary["readyCount"] == 0  # 正式 Catalog revision 尚未提交；不冒充 Published Ready。
    assert summary["gate2ReadyCount"] == 20  # 使用者確認的固定20件幾何／接合驗收。
    assert summary["collisionProxyCount"] == 20
    assert summary["characterAttachmentModelCount"] == 1
    assert summary["characterAttachmentCount"] == 4
    promoted_collision_folders = {item["folder"] for item in summary["items"] if item["collisionProxyPresent"]}
    assert "pm-20260923-plate-3020" in promoted_collision_folders
    assert "pm-20260927-expansion-v1/6141-colour4" in promoted_collision_folders
    assert "pm-20260927-expansion-v1/11211-colour4" in promoted_collision_folders
    assert "pm-20260927-expansion-v1/3069b-colour14" in promoted_collision_folders
    assert "pm-20260923-asymmetric-slope-3298-materials-v2" in promoted_collision_folders
    assert "pm-20260927-expansion-v1/3700-colour7" in promoted_collision_folders
    assert "pm-20260927-expansion-v1/6060-colour4" in promoted_collision_folders
    assert "pm-20260927-expansion-v1/4032a-colour4" in promoted_collision_folders
    assert "pm-20260927-expansion-v1/4085c-colour7" in promoted_collision_folders
    assert "pm-20260927-expansion-v1/30374-colour4" in promoted_collision_folders
    assert "pm-20260927-expansion-v1/14417-colour7" in promoted_collision_folders
    assert "pm-20260927-expansion-v1/14418-colour7" in promoted_collision_folders
    assert "pm-20260923-technic-pin-2780" in promoted_collision_folders
    assert "pm-20260923-technic-axle-3705" in promoted_collision_folders
    assert "pm-20260923-duplo-3437" in promoted_collision_folders
    assert "pm-20260923-printed-torso-973p06-color4" in promoted_collision_folders
    assert {item["folder"] for item in summary["items"] if not item["collisionProxyPresent"]} == set()
    torso_item = next(item for item in summary["items"] if item["folder"] == "pm-20260923-printed-torso-973p06-color4")
    assert torso_item["characterAttachmentCount"] == 4
    torso = json.loads((OUTPUT / torso_item["file"]).read_text(encoding="utf-8"))
    assert torso["characterAttachmentsRequired"] is True
    assert torso["characterAttachmentEvidence"]["method"] == "importldraw-parent-map-v1"
    assert torso["characterAttachmentEvidence"]["parentPart"] == "973"
    assert torso["characterAttachmentEvidence"]["attachmentCount"] == 4
    assert {item["slot"] for item in torso["characterAttachments"]} == {"head", "hips", "left-arm", "right-arm"}
    positions = {item["slot"]: item["position"] for item in torso["characterAttachments"]}
    assert positions["head"] == pytest.approx([0.0, 0.0096, 0.0])
    assert positions["hips"] == pytest.approx([0.0, -0.0128, 0.0])
    assert positions["right-arm"] == pytest.approx([-0.00616, -0.0032, 0.0])
    assert positions["left-arm"] == pytest.approx([0.00616, -0.0032, 0.0])
    assert torso["collisionProxy"] is not None
    assert torso["runtimeConnectorEvidence"]["method"] == "unity-playmode-meshcollider-minifig-torso-v1"
    assert torso["runtimeConnectorEvidence"]["specialConnectorCount"] == 4
    assert torso["runtimeConnectorEvidence"]["passageCheckCount"] == 3
    assert torso["runtimeConnectorEvidence"]["solidCheckCount"] == 1
    assert {connector["profile"] for connector in torso["connectors"]} == {
        "minifig-torso-arm-socket-v1",
        "minifig-neck-post-v1",
        "minifig-torso-hips-socket-v1",
    }

    for item in summary["items"]:
        document = json.loads((OUTPUT / item["file"]).read_text(encoding="utf-8"))
        assert document["readyAsset"] is False
        assert document["gate2Ready"] is True
        assert item["gate2Ready"] is True
        assert "productionStatus" not in document
        assert "productionReason" not in document
        assert "ActiveProductionEvidence" not in document.get("remainingChecks", [])
        if item["collisionProxyPresent"]:
            assert document["collisionProxy"] is not None
        else:
            assert document["collisionProxy"] is None
        assert document["referenceDimensions"] is not None
        assert document["referenceDimensionSource"]["dependencyDigest"]
        if item["folder"] != "pm-20260923-printed-torso-973p06-color4":
            assert item["characterAttachmentCount"] == 0
        if item["candidateCount"]:
            assert document["connectorsRequired"] is True
            assert item["promotedConnectorCount"] == item["candidateCount"]
            assert item["totalConnectorCount"] == len(document["connectors"])
            assert item["totalConnectorCount"] >= item["candidateCount"]
            assert item["runtimeConnectorCount"] == item["totalConnectorCount"] - item["candidateCount"]
            assert document["sourceConnectorEvidence"]["promotedCount"] == item["candidateCount"]
            assert document["compatibilityProfiles"]
        else:
            # 沒辨識到標準 primitive 不代表沒有接點，不可自動補成 connectorsRequired=false。
            assert document.get("connectorsRequired") is not False
            assert not document.get("sourceConnectorEvidence")
