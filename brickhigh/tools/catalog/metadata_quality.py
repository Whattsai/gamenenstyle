"""來源metadata的可計算品質；不把資料自述當成配對、外觀或Player驗收。"""

import math


def _finite(value):
    return type(value) in (int, float) and math.isfinite(value)


def _positive(value):
    return _finite(value) and value > 0


def _vector(value):
    return isinstance(value, list) and len(value) == 3 and all(_finite(item) for item in value)


def _unit(value):
    return _vector(value) and abs(sum(item * item for item in value) - 1) <= 1e-6


def _text(value):
    return isinstance(value, str) and bool(value.strip())


def _bounds(value):
    return (isinstance(value, dict) and _vector(value.get("min")) and _vector(value.get("max"))
            and all(high > low for low, high in zip(value["min"], value["max"])))


def inspect_metadata(metadata, geometry):
    """按公尺及SPEC容差回傳明確缺口；輪組資格與純外觀幾何分開。"""
    geometry_issues, wheel_issues, mass_issues = [], [], []
    result = {"geometryIssues": geometry_issues, "wheelIssues": wheel_issues,
              "massIssues": mass_issues, "wheelEligible": False}
    if not isinstance(metadata, dict) or type(metadata.get("schemaVersion")) is not int or metadata["schemaVersion"] != 1:
        geometry_issues.append("invalid-metadata-schema")
        return result
    if metadata.get("coordinateProfile") != "canonical-rh-metres-v1":
        geometry_issues.append("missing-canonical-coordinate-profile")
    reference = metadata.get("referenceDimensions")
    valid_reference = _vector(reference) and all(_positive(item) for item in reference)
    if not valid_reference:
        geometry_issues.append("invalid-reference-dimensions")
    actual = geometry.get("boundsMeters") if isinstance(geometry, dict) else None
    declared = metadata.get("boundsMeters")
    if not _bounds(actual) or not _bounds(declared):
        geometry_issues.append("invalid-bounds")
    elif valid_reference:
        tolerances = [max(.0001, .005 * size) + 1e-12 for size in reference]
        dimensions = [high - low for low, high in zip(actual["min"], actual["max"])]
        if any(abs(a - b) > tolerance for a, b, tolerance in zip(reference, dimensions, tolerances)):
            geometry_issues.append("reference-dimensions-mismatch")
        if any(abs(a - b) > tolerances[i] for key in ("min", "max")
               for i, (a, b) in enumerate(zip(actual[key], declared[key]))):
            geometry_issues.append("declared-bounds-mismatch")

    connectors = metadata.get("connectors")
    required = metadata.get("connectorsRequired")
    if type(required) is not bool or not isinstance(connectors, list):
        geometry_issues.append("missing-connector-contract")
    elif not connectors:
        if required:
            geometry_issues.append("missing-required-connectors")
        elif not _text(metadata.get("noConnectorsReason")):
            geometry_issues.append("missing-no-connectors-reason")
    else:
        seen = set()
        for connector in connectors:
            if not isinstance(connector, dict) or any(not _text(connector.get(key)) for key in
                    ("id", "family", "profile", "side", "evidence")):
                geometry_issues.append("invalid-connector-definition")
                continue
            if connector["id"] in seen:
                geometry_issues.append("duplicate-connector-id")
            seen.add(connector["id"])
            freedoms = connector.get("degreesOfFreedom")
            if not isinstance(freedoms, list) or any(not _text(item) for item in freedoms):
                geometry_issues.append("missing-connector-degrees-of-freedom")
            normal, tangent = connector.get("normal"), connector.get("tangent")
            if (not _unit(normal) or not _unit(tangent)
                    or abs(sum(a * b for a, b in zip(normal, tangent))) > 1e-6):
                geometry_issues.append("invalid-connector-frame")
            position, measured = connector.get("position"), connector.get("referencePosition")
            if not _vector(position) or not _vector(measured):
                geometry_issues.append("invalid-connector-position")
            elif math.sqrt(sum((a - b) ** 2 for a, b in zip(position, measured))) > .00005 + 1e-12:
                geometry_issues.append("connector-position-mismatch")

    vehicle = metadata.get("vehicleMetadata")
    if vehicle is not None:
        if not isinstance(vehicle, dict):
            wheel_issues.append("invalid-vehicle-metadata")
            mass_issues.append("invalid-vehicle-metadata")
        else:
            fields = ("radiusMeters", "widthMeters", "axleDirection")
            if any(field in vehicle for field in fields):
                if not _positive(vehicle.get("radiusMeters")) or not _positive(vehicle.get("widthMeters")):
                    wheel_issues.append("invalid-wheel-dimensions")
                if not _unit(vehicle.get("axleDirection")):
                    wheel_issues.append("invalid-wheel-axis")
                result["wheelEligible"] = not wheel_issues
            evidence = vehicle.get("massEvidence")
            if evidence == "Unknown":
                if "massKg" not in vehicle or vehicle["massKg"] is not None or not _text(vehicle.get("massReason")):
                    mass_issues.append("invalid-unknown-mass")
            elif evidence in ("Measured", "Estimated"):
                if (not _positive(vehicle.get("massKg")) or not _text(vehicle.get("massReason"))
                        or not _text(vehicle.get("massSource"))):
                    mass_issues.append("missing-mass-evidence")
            else:
                mass_issues.append("invalid-mass-state")
    for issues in (geometry_issues, wheel_issues, mass_issues):
        issues[:] = list(dict.fromkeys(issues))
    return result
