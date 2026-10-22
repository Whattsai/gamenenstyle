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


def _character_attachment_issues(metadata):
    """角色組裝 anchor 與一般積木 connector 分開驗證；只採信具來源證據的明確座標。"""
    required = metadata.get("characterAttachmentsRequired")
    attachments = metadata.get("characterAttachments")
    if required is None and attachments in (None, []):
        return []
    if type(required) is not bool or not isinstance(attachments, list):
        return ["missing-character-attachment-contract"]
    if required and not attachments:
        return ["missing-required-character-attachments"]
    if not required and attachments:
        return ["unexpected-character-attachments"]

    issues, ids, slots = [], set(), set()
    for attachment in attachments:
        if (not isinstance(attachment, dict)
                or any(not _text(attachment.get(key)) for key in ("id", "slot", "evidence"))):
            issues.append("invalid-character-attachment")
            continue
        if attachment["id"] in ids:
            issues.append("duplicate-character-attachment-id")
        ids.add(attachment["id"])
        if attachment["slot"] in slots:
            issues.append("duplicate-character-attachment-slot")
        slots.add(attachment["slot"])
        position, reference = attachment.get("position"), attachment.get("referencePosition")
        if not _vector(position) or not _vector(reference):
            issues.append("invalid-character-attachment-position")
        elif math.sqrt(sum((a - b) ** 2 for a, b in zip(position, reference))) > .00005 + 1e-12:
            issues.append("character-attachment-position-mismatch")
    return list(dict.fromkeys(issues))


def _collision_issues(value, connectors, connectors_required):
    issues = []
    if (not isinstance(value, dict) or type(value.get("schemaVersion")) is not int
            or value.get("schemaVersion") != 1):
        return ["invalid-collision-proxy"]
    if value.get("coordinateProfile") != "canonical-rh-metres-v1":
        issues.append("invalid-collision-coordinate-profile")
    if not _text(value.get("evidence")):
        issues.append("missing-collision-evidence")

    shapes = value.get("shapes")
    if not isinstance(shapes, list) or not shapes:
        issues.append("missing-collision-shapes")
    else:
        seen = set()
        for shape in shapes:
            if not isinstance(shape, dict) or not _text(shape.get("id")):
                issues.append("invalid-collision-shape")
                continue
            if shape["id"] in seen:
                issues.append("duplicate-collision-shape-id")
            seen.add(shape["id"])
            kind = shape.get("type")
            if kind == "box":
                size = shape.get("size")
                if not _vector(shape.get("center")) or not _vector(size) or any(not _positive(item) for item in size):
                    issues.append("invalid-collision-box")
            elif kind == "convexHull":
                vertices = shape.get("vertices")
                if (not isinstance(vertices, list) or len(vertices) < 4 or not all(_vector(vertex) for vertex in vertices)
                        or len({tuple(vertex) for vertex in vertices}) < 4):
                    issues.append("invalid-collision-convex-hull")
            else:
                issues.append("unsupported-collision-shape")

    cavity_checks = value.get("cavityChecks")
    solid_checks = value.get("solidChecks", [])
    connector_ids = {item.get("id") for item in connectors if isinstance(item, dict) and _text(item.get("id"))}
    if not isinstance(cavity_checks, list):
        issues.append("missing-cavity-check-contract")
    elif connectors_required is True:
        # 接收端需要 cavity/passage 實證；只有 male connector 的實體件可用 solidChecks，不能硬造不存在的 cavity。
        if not cavity_checks and not solid_checks:
            issues.append("missing-cavity-checks")
        seen = set()
        for check in cavity_checks:
            if (not isinstance(check, dict) or not _text(check.get("id")) or not _text(check.get("evidence"))
                    or check.get("result") != "Pass" or not isinstance(check.get("connectorIds"), list)
                    or not check["connectorIds"] or any(item not in connector_ids for item in check["connectorIds"])):
                issues.append("invalid-cavity-check")
                continue
            if check["id"] in seen:
                issues.append("duplicate-cavity-check-id")
            seen.add(check["id"])
    elif connectors_required is False and not cavity_checks and not _text(value.get("noCavityReason")):
        issues.append("missing-no-cavity-reason")

    if not isinstance(solid_checks, list):
        issues.append("invalid-solid-check-contract")
    else:
        seen = set()
        for check in solid_checks:
            if (not isinstance(check, dict) or not _text(check.get("id")) or not _text(check.get("evidence"))
                    or check.get("result") != "Pass" or not isinstance(check.get("connectorIds"), list)
                    or not check["connectorIds"] or any(item not in connector_ids for item in check["connectorIds"])
                    or not _vector(check.get("start")) or not _vector(check.get("end"))
                    or not _positive(check.get("radiusMeters"))):
                issues.append("invalid-solid-check")
                continue
            if check["id"] in seen:
                issues.append("duplicate-solid-check-id")
            seen.add(check["id"])
    return list(dict.fromkeys(issues))


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

    profiles = metadata.get("compatibilityProfiles")
    if not isinstance(profiles, list) or any(not _text(item) for item in profiles) or len(set(profiles)) != len(profiles):
        geometry_issues.append("invalid-compatibility-profiles")
    elif isinstance(connectors, list) and connectors:
        connector_profiles = {item.get("profile") for item in connectors if isinstance(item, dict) and _text(item.get("profile"))}
        if not connector_profiles.issubset(set(profiles)):
            geometry_issues.append("missing-connector-compatibility-profile")

    geometry_issues.extend(_collision_issues(metadata.get("collisionProxy"),
                                             connectors if isinstance(connectors, list) else [], required))
    geometry_issues.extend(_character_attachment_issues(metadata))

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
