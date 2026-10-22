"""來源幾何尺寸必須能安全併入 build metadata，且衝突時 fail-closed。"""

import pytest

from tools.catalog import building
from tools.catalog.policies import CatalogError


def source_reference():
    return {
        "filename": "3001.dat",
        "referenceGeometry": {
            "method": "ldraw-source-vertices-v1",
            "coordinateProfile": "ldraw-canonical-metres-v1",
            "boundsLdu": {"min": [-40, -24, -20], "max": [40, 0, 20]},
            "dimensionsMeters": [.032, .0096, .016],
            "dependencyDigest": "a" * 64,
        },
    }


def metadata(reference=None):
    return {
        "schemaVersion": 1,
        "coordinateProfile": "canonical-rh-metres-v1",
        "referenceDimensions": reference,
        "dimensionEvidence": "尚未套用獨立來源尺寸",
        "remainingChecks": ["IndependentDimensions", "ConnectorLocationsAndPairing"],
    }


def test_build_metadata_fills_missing_reference_dimensions_from_ldraw_source_evidence():
    result = building.merge_source_reference_metadata(metadata(), source_reference())

    assert result["referenceDimensions"] == pytest.approx([.032, .0096, .016])
    assert result["referenceDimensionSource"] == {
        "method": "ldraw-source-vertices-v1",
        "sourcePart": "3001.dat",
        "dependencyDigest": "a" * 64,
    }
    assert "IndependentDimensions" not in result["remainingChecks"]
    assert "ConnectorLocationsAndPairing" in result["remainingChecks"]
    assert "dependencyDigest=" + "a" * 64 in result["dimensionEvidence"]


def test_build_metadata_rejects_declared_reference_dimensions_that_conflict_with_source_geometry():
    with pytest.raises(CatalogError, match="referenceDimensions"):
        building.merge_source_reference_metadata(metadata([.04, .0096, .016]), source_reference())


def test_build_metadata_preserves_declared_reference_within_spec_tolerance():
    declared = [.0321, .0096, .016]
    result = building.merge_source_reference_metadata(metadata(declared), source_reference())
    assert result["referenceDimensions"] == declared
    assert result["referenceDimensionSource"]["dependencyDigest"] == "a" * 64


def source_with_connectors():
    source = source_reference()
    source["connectorCandidates"] = [
        {
            "id": "source-stud-001",
            "primitive": "p/stud.dat",
            "sourceFile": "parts/s/3001s01.dat",
            "family": "stud",
            "profile": "system-stud-v1",
            "side": "male",
            "position": [-.012, 0, -.004],
            "normal": [0, 1, 0],
            "tangent": [1, 0, 0],
            "dependencyDigest": "a" * 64,
        },
        {
            "id": "source-tube-001",
            "primitive": "p/stud4.dat",
            "sourceFile": "parts/s/3001s01.dat",
            "family": "tube",
            "profile": "system-tube-v1",
            "side": "female",
            "position": [-.008, -.0016, 0],
            "normal": [0, -1, 0],
            "tangent": [1, 0, 0],
            "dependencyDigest": "a" * 64,
        },
    ]
    return source


def test_build_metadata_promotes_traceable_standard_connector_candidates_without_claiming_collision_ready():
    document = metadata()
    document.update({
        "connectorsRequired": True,
        "connectors": [],
        "compatibilityProfiles": [],
        "collisionProxy": None,
    })
    result = building.merge_source_reference_metadata(document, source_with_connectors())

    assert result["connectorsRequired"] is True
    assert [item["profile"] for item in result["connectors"]] == ["system-stud-v1", "system-tube-v1"]
    assert result["connectors"][0]["referencePosition"] == result["connectors"][0]["position"]
    assert result["connectors"][0]["degreesOfFreedom"] == ["axial-insert"]
    assert "dependencyDigest=" + "a" * 64 in result["connectors"][0]["evidence"]
    assert result["compatibilityProfiles"] == ["system-stud-v1", "system-tube-v1"]
    assert result["sourceConnectorEvidence"]["candidateCount"] == 2
    assert result["sourceConnectorEvidence"]["dependencyDigest"] == "a" * 64
    assert "ConnectorLocationsAndPairing" in result["remainingChecks"]
    assert result["collisionProxy"] is None


def test_build_metadata_promotes_ball_socket_source_profiles_with_spherical_freedom():
    source = source_reference()
    source["connectorCandidates"] = [
        {
            "id": "source-ball-001", "primitive": "p/joint8ball.dat", "sourceFile": "parts/14417.dat",
            "family": "ball", "profile": "ball-v1", "side": "male",
            "position": [0, -.0016, .008], "normal": [0, 0, 1], "tangent": [1, 0, 0], "dependencyDigest": "a" * 64,
        },
        {
            "id": "source-socket-002", "primitive": "p/joint8socket1.dat", "sourceFile": "parts/14418.dat",
            "family": "socket", "profile": "socket-v1", "side": "female",
            "position": [.01, -.0016, 0], "normal": [1, 0, 0], "tangent": [0, 0, 1], "dependencyDigest": "a" * 64,
        },
    ]
    document = metadata()
    document.update({"connectorsRequired": True, "connectors": [], "compatibilityProfiles": [], "collisionProxy": None})

    result = building.merge_source_reference_metadata(document, source)

    assert [item["profile"] for item in result["connectors"]] == ["ball-v1", "socket-v1"]
    assert result["connectors"][0]["degreesOfFreedom"] == ["spherical-rotate"]
    assert result["connectors"][1]["degreesOfFreedom"] == ["spherical-rotate"]
    assert result["compatibilityProfiles"] == ["ball-v1", "socket-v1"]


def test_build_metadata_keeps_collocated_opposed_connector_frames_as_distinct_ends():
    source = source_reference()
    source["connectorCandidates"] = [
        {
            "id": "source-technic-pin-001", "primitive": "p/confric5.dat", "sourceFile": "parts/2780.dat",
            "family": "technic-pin", "profile": "technic-friction-pin-v1", "side": "male",
            "position": [0, 0, 0], "normal": [-1, 0, 0], "tangent": [0, 1, 0], "dependencyDigest": "a" * 64,
        },
        {
            "id": "source-technic-pin-002", "primitive": "p/confric5.dat", "sourceFile": "parts/2780.dat",
            "family": "technic-pin", "profile": "technic-friction-pin-v1", "side": "male",
            "position": [0, 0, 0], "normal": [1, 0, 0], "tangent": [0, 1, 0], "dependencyDigest": "a" * 64,
        },
    ]
    document = metadata()
    document.update({"connectorsRequired": True, "connectors": [], "compatibilityProfiles": [], "collisionProxy": None})

    result = building.merge_source_reference_metadata(document, source)

    assert len(result["connectors"]) == 2
    assert {tuple(item["normal"]) for item in result["connectors"]} == {(-1, 0, 0), (1, 0, 0)}


def test_build_metadata_rejects_source_connectors_when_metadata_explicitly_declares_no_connectors_required():
    document = metadata()
    document.update({
        "connectorsRequired": False,
        "connectors": [],
        "compatibilityProfiles": [],
    })
    with pytest.raises(CatalogError, match="connectorsRequired"):
        building.merge_source_reference_metadata(document, source_with_connectors())


def test_build_metadata_rejects_unrecognized_source_connector_profile_instead_of_guessing_semantics():
    source = source_with_connectors()
    source["connectorCandidates"][0]["profile"] = "unknown-profile-v1"
    document = metadata()
    document.update({
        "connectorsRequired": True,
        "connectors": [],
        "compatibilityProfiles": [],
    })
    with pytest.raises(CatalogError, match="connector candidate"):
        building.merge_source_reference_metadata(document, source)
