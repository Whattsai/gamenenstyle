"""來源公尺尺寸、接點及輪組metadata的品質規則。"""

from copy import deepcopy

import pytest

from tools.catalog.metadata_quality import inspect_metadata


def geometry():
    return {"boundsMeters": {"min": [0, 0, 0], "max": [.032, .0096, .016]}}


def metadata():
    return {"schemaVersion": 1, "coordinateProfile": "canonical-rh-metres-v1",
            "referenceDimensions": [.032, .0096, .016], "boundsMeters": geometry()["boundsMeters"],
            "connectorsRequired": False, "connectors": [], "noConnectorsReason": "人工無接點裝飾件",
            "vehicleMetadata": {"massKg": None, "massEvidence": "Unknown", "massReason": "沒有量測來源"}}


def test_geometry_reference_and_bounds_use_metres_and_inclusive_tolerance():
    value = metadata()
    assert inspect_metadata(value, geometry())["geometryIssues"] == []
    value["referenceDimensions"][0] += .00016
    assert inspect_metadata(value, geometry())["geometryIssues"] == []
    value["referenceDimensions"][0] += .00001
    assert "reference-dimensions-mismatch" in inspect_metadata(value, geometry())["geometryIssues"]


@pytest.mark.parametrize("bad", [0, -1, float("nan"), float("inf"), True, "0.032"])
def test_nonpositive_nonfinite_or_non_numeric_dimensions_are_rejected(bad):
    value = metadata()
    value["referenceDimensions"][0] = bad
    assert "invalid-reference-dimensions" in inspect_metadata(value, geometry())["geometryIssues"]


def test_UT_024_required_connector_cannot_be_replaced_with_an_empty_array():
    value = metadata()
    value["connectorsRequired"] = True
    assert "missing-required-connectors" in inspect_metadata(value, geometry())["geometryIssues"]
    value["connectorsRequired"] = False
    value["noConnectorsReason"] = ""
    assert "missing-no-connectors-reason" in inspect_metadata(value, geometry())["geometryIssues"]


def test_connector_frame_and_reference_position_must_be_valid():
    value = metadata()
    value["connectorsRequired"] = True
    value["connectors"] = [{"id": "stud-1", "family": "stud", "profile": "system-stud-v1",
        "position": [0, 0, 0], "referencePosition": [0, 0, 0], "normal": [0, 1, 0], "tangent": [1, 0, 0],
        "side": "male", "degreesOfFreedom": [], "evidence": "fixture-measurement"}]
    assert inspect_metadata(value, geometry())["geometryIssues"] == []
    broken = deepcopy(value)
    broken["connectors"][0]["normal"] = [0, 2, 0]
    assert "invalid-connector-frame" in inspect_metadata(broken, geometry())["geometryIssues"]
    broken = deepcopy(value)
    broken["connectors"][0]["position"][0] = .000051
    assert "connector-position-mismatch" in inspect_metadata(broken, geometry())["geometryIssues"]


def test_UT_166_invalid_wheel_dimensions_exclude_wheel_candidate_without_erasing_visual():
    value = metadata()
    wheel = value["vehicleMetadata"]
    wheel.update(radiusMeters=.01, widthMeters=.005, axleDirection=[1, 0, 0])
    assert inspect_metadata(value, geometry())["wheelEligible"] is True
    for field, bad in [("radiusMeters", 0), ("widthMeters", None), ("axleDirection", [2, 0, 0])]:
        broken = deepcopy(value)
        broken["vehicleMetadata"][field] = bad
        result = inspect_metadata(broken, geometry())
        assert result["wheelEligible"] is False
        assert result["wheelIssues"]
        assert result["geometryIssues"] == []


def test_UT_167_unknown_mass_requires_null_and_reason_and_known_mass_requires_evidence():
    value = metadata()
    assert inspect_metadata(value, geometry())["massIssues"] == []
    for fields in ({"massKg": 0}, {"massReason": ""}, {"massEvidence": "Measured", "massKg": .002},
                   {"massEvidence": "Estimated", "massKg": float("inf"), "massSource": "fixture"}):
        broken = deepcopy(value)
        broken["vehicleMetadata"].update(fields)
        assert inspect_metadata(broken, geometry())["massIssues"]
    value["vehicleMetadata"].update(massEvidence="Measured", massKg=.002, massSource="fixture-measurement")
    assert inspect_metadata(value, geometry())["massIssues"] == []
