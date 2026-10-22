"""Gate 2 固定模型的可重跑 metadata input 提案；只封存可由既有來源證明的欄位。"""

import hashlib
import html
import json
from pathlib import Path

from tools.acceptance.audit_internal_model_set import source_reference_matches_geometry
from tools.catalog.building import merge_source_reference_metadata
from tools.catalog.policies import CatalogError
from tools.catalog.sources import inspect_ldraw


MINIFIG_TORSO_ATTACHMENT_FOLDER = "pm-20260923-printed-torso-973p06-color4"
MINIFIG_TORSO_ATTACHMENT_PARENT = "973"
MINIFIG_TORSO_ATTACHMENT_SLOTS = {
    "right arm attach point": ("right-arm", "character-right-arm"),
    "left arm attach point": ("left-arm", "character-left-arm"),
    "head attach point": ("head", "character-head"),
    "hips attach point": ("hips", "character-hips"),
}


VERIFIED_COLLISION_FIXTURES = {
    "3001-red-exploratory-v1": "gate2-3001-collision.json",
    "pm-20260923-plate-3020": "gate2-3020-collision.json",
    "pm-20260923-transparent-color47": "gate2-3001-transparent-collision.json",
    "pm-20260927-expansion-v1/2456-colour14": "gate2-2456-collision.json",
    "pm-20260927-expansion-v1/3005-colour14": "gate2-3005-collision.json",
    "pm-20260927-expansion-v1/6141-colour4": "gate2-6141-collision.json",
    "pm-20260927-expansion-v1/11211-colour4": "gate2-11211-collision.json",
    "pm-20260927-expansion-v1/3069b-colour14": "gate2-3069b-collision.json",
    "pm-20260923-asymmetric-slope-3298-materials-v2": "gate2-3298-collision.json",
    "pm-20260927-expansion-v1/3700-colour7": "gate2-3700-collision.json",
    "pm-20260927-expansion-v1/6060-colour4": "gate2-6060-collision.json",
    "pm-20260927-expansion-v1/4032a-colour4": "gate2-4032a-collision.json",
    "pm-20260927-expansion-v1/4085c-colour7": "gate2-4085c-collision.json",
    "pm-20260927-expansion-v1/30374-colour4": "gate2-30374-collision.json",
    "pm-20260927-expansion-v1/14417-colour7": "gate2-14417-collision.json",
    "pm-20260927-expansion-v1/14418-colour7": "gate2-14418-collision.json",
    "pm-20260923-technic-pin-2780": "gate2-2780-collision.json",
    "pm-20260923-technic-axle-3705": "gate2-3705-collision.json",
    "pm-20260923-duplo-3437": "gate2-3437-collision.json",
    "pm-20260923-printed-torso-973p06-color4": "gate2-973p06-collision.json",
}


def _read_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def _base_metadata(conversion, source):
    """舊 exploratory artifact 沒 metadata 時建立保守 input；未知事項保持未知。"""
    candidates = source.get("connectorCandidates", [])
    document = {
        "schemaVersion": 1,
        "purpose": "Gate2MetadataInput",
        "readyAsset": False,
        "sourcePart": conversion["source"]["filename"],
        "coordinateProfile": "canonical-rh-metres-v1",
        "boundsMeters": conversion["geometry"]["boundsMeters"],
        "referenceDimensions": None,
        "dimensionEvidence": "待由固定來源 revision 自動封存。",
        "connectors": [],
        "compatibilityProfiles": [],
        "collisionProxy": None,
        "characterAttachments": [],
        "remainingChecks": [
            "IndependentDimensions",
            "ConnectorLocationsAndPairing",
            "CollisionCavities",
            "SourceColourAppearance",
            "LegoIdentity",
            "UnityRuntimeBuild",
        ],
        "worldScale": 1,
    }
    # 有標準 primitive candidate 才能證明此件需要接點；沒有 candidate 不等於沒有接點。
    if candidates:
        document["connectorsRequired"] = True
    return document


def _apply_minifig_torso_attachment_evidence(project, folder, conversion, proposal):
    """只對固定 973p06 torso 套用 pinned ImportLDraw Parent 973 的明確 attachment 座標。"""
    if folder != MINIFIG_TORSO_ATTACHMENT_FOLDER:
        return proposal
    if conversion.get("source", {}).get("filename") != "973p06.dat":
        raise CatalogError("Gate 2 973p06 attachment fixture 與來源零件不一致。")

    parents_path = Path(project) / "artifacts/toolchain/ImportLDraw/loadldraw/parents.txt"
    if not parents_path.is_file():
        raise CatalogError("Gate 2 973p06 缺少 pinned ImportLDraw parent map。")
    data = parents_path.read_bytes()
    parents_sha = hashlib.sha256(data).hexdigest()
    lines = data.decode("utf-8-sig").splitlines()
    header = f"Parent {MINIFIG_TORSO_ATTACHMENT_PARENT}:"
    try:
        start = next(index for index, line in enumerate(lines) if line.strip().startswith(header)) + 1
    except StopIteration as error:
        raise CatalogError("Pinned ImportLDraw parent map 缺少 Parent 973。") from error

    by_comment = {}
    for line in lines[start:]:
        stripped = line.strip()
        if stripped.startswith("Parent ") or stripped.startswith("Group "):
            break
        if "#" not in line:
            continue
        values_text, comment = line.split("#", 1)
        comment = comment.strip().lower()
        if comment not in MINIFIG_TORSO_ATTACHMENT_SLOTS:
            continue
        tokens = values_text.split()
        if len(tokens) != 3:
            raise CatalogError("Pinned ImportLDraw torso attachment 座標格式無效。")
        try:
            ldu = [float(token) for token in tokens]
        except ValueError as error:
            raise CatalogError("Pinned ImportLDraw torso attachment 座標不是數值。") from error
        by_comment[comment] = ldu

    if set(by_comment) != set(MINIFIG_TORSO_ATTACHMENT_SLOTS):
        raise CatalogError("Pinned ImportLDraw Parent 973 未提供完整 head/arms/hips attachment。")

    importer_commit = conversion.get("toolchain", {}).get("importerCommit")
    if not isinstance(importer_commit, str) or not importer_commit.strip():
        raise CatalogError("973p06 conversion 缺少 pinned ImportLDraw commit。")
    evidence = (
        "Pinned ImportLDraw parent map v1; parentPart=973; sourcePart=973p06.dat; "
        f"parentsSha256={parents_sha}; importerCommit={importer_commit}"
    )
    attachments = []
    for comment, (slot, attachment_id) in MINIFIG_TORSO_ATTACHMENT_SLOTS.items():
        x, y, z = by_comment[comment]
        # 與 CoordinatePolicy.FromLDraw 相同：LDraw +Y 向下、+Z 轉 canonical -Z，1 LDU = 0.4 mm。
        position = [x * .0004, -y * .0004, -z * .0004]
        attachments.append({
            "id": attachment_id,
            "slot": slot,
            "position": position,
            "referencePosition": list(position),
            "evidence": evidence + f"; sourceComment={comment}; ldu=({x:g},{y:g},{z:g})",
        })
    attachments.sort(key=lambda item: item["slot"])
    proposal["characterAttachmentsRequired"] = True
    proposal["characterAttachments"] = attachments
    proposal["characterAttachmentEvidence"] = {
        "method": "importldraw-parent-map-v1",
        "sourcePart": "973p06.dat",
        "parentPart": MINIFIG_TORSO_ATTACHMENT_PARENT,
        "parentsFile": "artifacts/toolchain/ImportLDraw/loadldraw/parents.txt",
        "parentsSha256": parents_sha,
        "importerCommit": importer_commit,
        "attachmentCount": len(attachments),
    }
    return proposal


def _apply_verified_collision_fixture(project, folder, conversion, source, proposal):
    """只有通過真 Unity PlayMode 且綁定 exact source/model digest 的 fixture 才能升格。"""
    fixture_name = VERIFIED_COLLISION_FIXTURES.get(folder)
    if not fixture_name:
        return proposal
    fixture_path = Path(project) / "tools/acceptance/fixtures" / fixture_name
    if not fixture_path.is_file():
        return proposal
    fixture = _read_json(fixture_path)
    if fixture.get("validationStatus") != "Verified":
        return proposal

    expected = {
        "folder": folder,
        "sourcePart": conversion["source"]["filename"],
        "sourceDependencyDigest": source["referenceGeometry"]["dependencyDigest"],
        "modelSha256": conversion["geometry"]["sha256"],
        "coordinateProfile": "canonical-rh-metres-v1",
    }
    for key, value in expected.items():
        if fixture.get(key) != value:
            raise CatalogError(f"Gate 2 collision fixture {fixture_name} 的 {key} 與目前 immutable 證據不一致。")

    sockets = fixture.get("sockets", [])
    boxes = fixture.get("proxyBoxes")
    probe = fixture.get("probe")
    special_connectors = fixture.get("specialConnectors", [])
    source_connector_checks = fixture.get("sourceConnectorChecks", [])
    solid_fixtures = fixture.get("solidChecks", [])
    if (not isinstance(sockets, list) or not isinstance(boxes, list) or not boxes
            or (sockets and not isinstance(probe, dict)) or not isinstance(special_connectors, list)
            or not isinstance(source_connector_checks, list) or not isinstance(solid_fixtures, list)
            or (not sockets and not special_connectors and not source_connector_checks)):
        raise CatalogError(f"Gate 2 collision fixture {fixture_name} 結構不完整。")

    # 真 PlayMode fixture 已證明此零件存在可組裝 connector 時，即使來源 primitive scanner 沒辨識到標準 candidate，
    # 也必須顯式宣告 connectorsRequired=True；不能讓 runtime 實證與 metadata contract 互相矛盾。
    proposal["connectorsRequired"] = True

    existing_connectors = {item.get("id"): item for item in proposal.get("connectors", [])
                           if isinstance(item, dict) and isinstance(item.get("id"), str)}
    connector_ids = set(existing_connectors)
    evidence = fixture.get("evidence")
    if not isinstance(evidence, str) or not evidence.strip():
        raise CatalogError(f"Gate 2 collision fixture {fixture_name} 缺少驗證證據。")
    for socket in sockets:
        socket_id = socket.get("id") if isinstance(socket, dict) else None
        position = socket.get("position") if isinstance(socket, dict) else None
        if not isinstance(socket_id, str) or not socket_id.strip() or socket_id in connector_ids:
            raise CatalogError(f"Gate 2 collision fixture {fixture_name} socket ID 無效或重複。")
        if not isinstance(position, list) or len(position) != 3:
            raise CatalogError(f"Gate 2 collision fixture {fixture_name} socket 位置無效。")
        connector_ids.add(socket_id)
        proposal.setdefault("connectors", []).append({
            "id": socket_id,
            "family": fixture.get("socketFamily", "tube"),
            "profile": fixture["femaleProfile"],
            "side": "female",
            "position": position,
            "referencePosition": list(position),
            "normal": [0, -1, 0],
            "tangent": [1, 0, 0],
            "degreesOfFreedom": ["axial-insert"],
            "evidence": evidence,
        })

    passage_ids = {item.get("id") for item in fixture.get("passageChecks", []) if isinstance(item, dict)}
    solid_ids = {item.get("id") for item in solid_fixtures if isinstance(item, dict)}
    checked_source_connectors = []
    for check in source_connector_checks:
        connector_id = check.get("connectorId") if isinstance(check, dict) else None
        profile = check.get("profile") if isinstance(check, dict) else None
        compatible_profile = check.get("compatibleProfile") if isinstance(check, dict) else None
        connector_passages = check.get("passageIds", []) if isinstance(check, dict) else None
        connector_solids = check.get("solidCheckIds", []) if isinstance(check, dict) else None
        source_connector = existing_connectors.get(connector_id)
        base_valid = (isinstance(connector_id, str) and connector_id.strip() and isinstance(source_connector, dict)
                      and source_connector.get("profile") == profile
                      and isinstance(profile, str) and profile.strip()
                      and isinstance(compatible_profile, str) and compatible_profile.strip()
                      and isinstance(connector_passages, list) and isinstance(connector_solids, list))
        female_valid = (base_valid and source_connector.get("side") == "female" and connector_passages and not connector_solids
                        and all(item in passage_ids for item in connector_passages))
        male_valid = (base_valid and source_connector.get("side") == "male" and connector_solids and not connector_passages
                      and all(item in solid_ids for item in connector_solids))
        if not (female_valid or male_valid):
            raise CatalogError(f"Gate 2 collision fixture {fixture_name} source connector check 無效。")
        checked_source_connectors.append({
            "connectorId": connector_id,
            "profile": profile,
            "compatibleProfile": compatible_profile,
            "passageIds": list(connector_passages),
            "solidCheckIds": list(connector_solids),
        })

    for connector in special_connectors:
        if not isinstance(connector, dict):
            raise CatalogError(f"Gate 2 collision fixture {fixture_name} special connector 無效。")
        connector_id = connector.get("id")
        position = connector.get("position")
        normal = connector.get("normal")
        tangent = connector.get("tangent")
        freedoms = connector.get("degreesOfFreedom")
        connector_passages = connector.get("passageIds", [])
        connector_solids = connector.get("solidCheckIds", [])
        side = connector.get("side")
        base_valid = (isinstance(connector_id, str) and connector_id.strip() and connector_id not in connector_ids
                and isinstance(connector.get("family"), str) and connector["family"].strip()
                and isinstance(connector.get("profile"), str) and connector["profile"].strip()
                and isinstance(connector.get("compatibleProfile"), str) and connector["compatibleProfile"].strip()
                and side in {"female", "male"}
                and isinstance(position, list) and len(position) == 3
                and isinstance(normal, list) and len(normal) == 3
                and isinstance(tangent, list) and len(tangent) == 3
                and isinstance(freedoms, list) and freedoms and all(isinstance(item, str) and item.strip() for item in freedoms)
                and isinstance(connector_passages, list) and isinstance(connector_solids, list))
        female_valid = side == "female" and connector_passages and not connector_solids and all(item in passage_ids for item in connector_passages)
        male_valid = side == "male" and connector_solids and not connector_passages and all(item in solid_ids for item in connector_solids)
        if not base_valid or not (female_valid or male_valid):
            raise CatalogError(f"Gate 2 collision fixture {fixture_name} special connector 結構或幾何證據綁定無效。")
        connector_ids.add(connector_id)
        proposal.setdefault("connectors", []).append({
            "id": connector_id,
            "family": connector["family"],
            "profile": connector["profile"],
            "side": connector["side"],
            "position": position,
            "referencePosition": list(position),
            "normal": normal,
            "tangent": tangent,
            "degreesOfFreedom": freedoms,
            "evidence": evidence,
        })

    profiles = proposal.setdefault("compatibilityProfiles", [])
    required_profiles = [fixture["maleProfile"], fixture["femaleProfile"]]
    for connector in special_connectors:
        required_profiles.extend((connector["profile"], connector["compatibleProfile"]))
    for check in checked_source_connectors:
        required_profiles.extend((check["profile"], check["compatibleProfile"]))
    for profile in required_profiles:
        if profile not in profiles:
            profiles.append(profile)
    profiles.sort()

    shapes = []
    for box in boxes:
        if not isinstance(box, dict) or not isinstance(box.get("id"), str):
            raise CatalogError(f"Gate 2 collision fixture {fixture_name} proxy box 無效。")
        shapes.append({"id": box["id"], "type": "box", "center": box.get("center"), "size": box.get("size")})
    cavity_checks = [{
        "id": f"{socket['id']}-clearance",
        "connectorIds": [socket["id"]],
        "result": "Pass",
        "evidence": evidence,
    } for socket in sockets]
    passage_checks = []
    for passage in fixture.get("passageChecks", []):
        if not isinstance(passage, dict) or not isinstance(passage.get("id"), str):
            raise CatalogError(f"Gate 2 collision fixture {fixture_name} passage check 無效。")
        if not isinstance(passage.get("start"), list) or len(passage["start"]) != 3:
            raise CatalogError(f"Gate 2 collision fixture {fixture_name} passage start 無效。")
        if not isinstance(passage.get("end"), list) or len(passage["end"]) != 3:
            raise CatalogError(f"Gate 2 collision fixture {fixture_name} passage end 無效。")
        if not isinstance(passage.get("radiusMeters"), (int, float)) or passage["radiusMeters"] <= 0:
            raise CatalogError(f"Gate 2 collision fixture {fixture_name} passage radius 無效。")
        passage_checks.append({
            "id": passage["id"],
            "start": passage["start"],
            "end": passage["end"],
            "radiusMeters": passage["radiusMeters"],
            "result": "Pass",
            "evidence": evidence,
        })
    for connector in special_connectors:
        if connector["side"] == "female":
            cavity_checks.append({
                "id": f"{connector['id']}-clearance",
                "connectorIds": [connector["id"]],
                "passageCheckIds": list(connector["passageIds"]),
                "result": "Pass",
                "evidence": evidence,
            })
    for check in checked_source_connectors:
        if check["passageIds"]:
            cavity_checks.append({
                "id": f"{check['connectorId']}-clearance",
                "connectorIds": [check["connectorId"]],
                "passageCheckIds": list(check["passageIds"]),
                "result": "Pass",
                "evidence": evidence,
            })
    solid_checks = []
    for solid in solid_fixtures:
        if (not isinstance(solid, dict) or not isinstance(solid.get("id"), str)
                or not isinstance(solid.get("start"), list) or len(solid["start"]) != 3
                or not isinstance(solid.get("end"), list) or len(solid["end"]) != 3
                or not isinstance(solid.get("radiusMeters"), (int, float)) or solid["radiusMeters"] <= 0
                or not isinstance(solid.get("connectorIds"), list) or not solid["connectorIds"]
                or any(item not in connector_ids for item in solid["connectorIds"])):
            raise CatalogError(f"Gate 2 collision fixture {fixture_name} solid check 無效。")
        solid_checks.append({
            "id": solid["id"],
            "connectorIds": list(solid["connectorIds"]),
            "start": solid["start"],
            "end": solid["end"],
            "radiusMeters": solid["radiusMeters"],
            "result": "Pass",
            "evidence": evidence,
        })
    proposal["collisionProxy"] = {
        "schemaVersion": 1,
        "coordinateProfile": fixture["coordinateProfile"],
        "evidence": evidence,
        "shapes": shapes,
        "cavityChecks": cavity_checks,
        "passageChecks": passage_checks,
        "solidChecks": solid_checks,
    }
    proposal["runtimeConnectorEvidence"] = {
        "method": fixture.get("runtimeEvidenceMethod", "unity-playmode-meshcollider-cavity-v1"),
        "fixture": f"tools/acceptance/fixtures/{fixture_name}",
        "sourceDependencyDigest": fixture["sourceDependencyDigest"],
        "modelSha256": fixture["modelSha256"],
        "socketCount": len(sockets),
        "specialConnectorCount": len(special_connectors),
        "sourceConnectorCheckCount": len(checked_source_connectors),
        "connectorCount": len(sockets) + len(special_connectors),
        "passageCheckCount": len(passage_checks),
        "solidCheckCount": len(solid_checks),
    }
    proposal["remainingChecks"] = [item for item in proposal.get("remainingChecks", [])
                                   if item not in {"ConnectorLocationsAndPairing", "CollisionCavities"}]
    return proposal


def build_gate2_metadata_proposal(project, folder):
    """由既有 conversion + 封存 LDraw 來源產生下一 revision 的保守 metadata input。"""
    project = Path(project)
    model_dir = project / "artifacts/models" / folder
    conversion = _read_json(model_dir / "conversion.json")
    source_archive = model_dir / "sources"
    source_root = source_archive if source_archive.is_dir() else project / "artifacts/sources/ldraw-release/ldraw"
    source = inspect_ldraw(source_root, conversion["source"]["filename"])

    metadata_path = model_dir / "metadata.json"
    metadata = _read_json(metadata_path) if metadata_path.is_file() else _base_metadata(conversion, source)
    proposal = merge_source_reference_metadata(metadata, source)
    # 舊 exploratory metadata 可能仍帶有已廢止的 lifecycle 欄位；下一 immutable revision 不再繼承。
    proposal.pop("productionStatus", None)
    proposal.pop("productionReason", None)
    proposal["remainingChecks"] = [
        "LegoIdentity" if item == "ActiveProductionEvidence" else item
        for item in proposal.get("remainingChecks", [])
    ]
    proposal = _apply_minifig_torso_attachment_evidence(project, folder, conversion, proposal)
    proposal = _apply_verified_collision_fixture(project, folder, conversion, source, proposal)
    # Gate 2 僅驗收固定樣本的尺寸與可合理接合的碰撞/接點，不以指定盒組官方身份阻擋。
    # 這個獨立階段指標不會變更 CatalogRepository 的正式 revision.status。
    geometry_ready = source_reference_matches_geometry(source["referenceGeometry"], conversion["geometry"])
    collision_ready = (proposal.get("collisionProxy") is not None
                       and isinstance(proposal.get("runtimeConnectorEvidence"), dict)
                       and not any(item in proposal.get("remainingChecks", []) for item in
                                   ("IndependentDimensions", "ConnectorLocationsAndPairing", "CollisionCavities")))
    proposal["gate2Ready"] = geometry_ready and collision_ready
    return {
        "folder": folder,
        "sourcePart": conversion["source"]["filename"],
        "candidateCount": len(source.get("connectorCandidates", [])),
        "proposal": proposal,
    }


def _character_attachment_svg(document):
    """以前視圖呈現角色 attachment anchor；這是人工 checkpoint，不是 collision 驗證。"""
    bounds = document.get("boundsMeters") or {}
    minimum, maximum = bounds.get("min"), bounds.get("max")
    attachments = document.get("characterAttachments") or []
    if not (isinstance(minimum, list) and isinstance(maximum, list) and len(minimum) == 3 and len(maximum) == 3 and attachments):
        return ""
    min_x, max_x, min_y, max_y = minimum[0], maximum[0], minimum[1], maximum[1]
    attachment_x = [item["position"][0] for item in attachments]
    attachment_y = [item["position"][1] for item in attachments]
    min_x, max_x = min([min_x, *attachment_x]), max([max_x, *attachment_x])
    min_y, max_y = min([min_y, *attachment_y]), max([max_y, *attachment_y])
    span_x, span_y = max(max_x - min_x, 1e-6), max(max_y - min_y, 1e-6)
    width, height, pad = 360.0, 300.0, 30.0
    scale = min((width - 2 * pad) / span_x, (height - 2 * pad) / span_y)

    def sx(value):
        return pad + (value - min_x) * scale

    def sy(value):
        return height - pad - (value - min_y) * scale

    parts = [
        f"<svg viewBox='0 0 {width:.0f} {height:.0f}' role='img' aria-label='character attachment front view'>",
        f"<rect x='{sx(minimum[0]):.2f}' y='{sy(maximum[1]):.2f}' width='{(maximum[0]-minimum[0])*scale:.2f}' height='{(maximum[1]-minimum[1])*scale:.2f}' fill='none' stroke='#a9b8c8' stroke-width='2'/>",
    ]
    for attachment in attachments:
        x, y = attachment["position"][0], attachment["position"][1]
        label = html.escape(attachment["slot"])
        parts.append(f"<circle cx='{sx(x):.2f}' cy='{sy(y):.2f}' r='6' fill='#f6d365' stroke='#101820' stroke-width='1'/>")
        parts.append(f"<text x='{sx(x)+9:.2f}' y='{sy(y)-7:.2f}' fill='#f5f5f5' font-size='12'>{label}</text>")
    parts.append("</svg>")
    return "".join(parts)


def _collision_svg(document):
    """以底視圖呈現已驗證 compound proxy 與 logical sockets，供人工 checkpoint 檢視。"""
    bounds = document.get("boundsMeters") or {}
    minimum, maximum = bounds.get("min"), bounds.get("max")
    proxy = document.get("collisionProxy") or {}
    if not (isinstance(minimum, list) and isinstance(maximum, list) and len(minimum) == 3 and len(maximum) == 3):
        return "<p>缺少可視化 bounds。</p>"
    min_x, max_x, min_z, max_z = minimum[0], maximum[0], minimum[2], maximum[2]
    span_x, span_z = max(max_x - min_x, 1e-6), max(max_z - min_z, 1e-6)
    width, height, pad = 320.0, 220.0, 18.0
    scale = min((width - 2 * pad) / span_x, (height - 2 * pad) / span_z)

    def sx(value):
        return pad + (value - min_x) * scale

    def sy(value):
        return height - pad - (value - min_z) * scale

    parts = [
        f"<svg viewBox='0 0 {width:.0f} {height:.0f}' role='img' aria-label='collision proxy bottom view'>",
        f"<rect x='{sx(min_x):.2f}' y='{sy(max_z):.2f}' width='{span_x * scale:.2f}' height='{span_z * scale:.2f}' fill='none' stroke='#a9b8c8' stroke-width='2'/>",
    ]
    for shape in proxy.get("shapes", []):
        if shape.get("type") != "box" or not isinstance(shape.get("center"), list) or not isinstance(shape.get("size"), list):
            continue
        cx, cz = shape["center"][0], shape["center"][2]
        size_x, size_z = shape["size"][0], shape["size"][2]
        parts.append(
            f"<rect x='{sx(cx - size_x / 2):.2f}' y='{sy(cz + size_z / 2):.2f}' "
            f"width='{size_x * scale:.2f}' height='{size_z * scale:.2f}' fill='none' stroke='#ffb36b' stroke-width='1.5'/>"
        )
    connectors = [connector for connector in document.get("connectors", []) if isinstance(connector.get("position"), list)]
    for connector in connectors:
        x, z = connector["position"][0], connector["position"][2]
        if connector.get("side") == "female" and connector.get("profile") == "system-tube-v1":
            parts.append(f"<circle cx='{sx(x):.2f}' cy='{sy(z):.2f}' r='5' fill='#75e6a4' stroke='#101820' stroke-width='1'/>")
        elif connector.get("side") == "female":
            cx, cy = sx(x), sy(z)
            parts.append(f"<polygon points='{cx:.2f},{cy-6:.2f} {cx+6:.2f},{cy:.2f} {cx:.2f},{cy+6:.2f} {cx-6:.2f},{cy:.2f}' fill='#8fc8ff' stroke='#101820' stroke-width='1'/>")
        elif connector.get("side") == "male" and connector.get("profile") != "system-stud-v1":
            parts.append(f"<rect x='{sx(x)-5:.2f}' y='{sy(z)-5:.2f}' width='10' height='10' fill='#88d7e8' stroke='#101820' stroke-width='1'/>")
    parts.append("</svg>")
    return "".join(parts)


def _write_checkpoint_review(output, summary):
    """輸出 Gate 2 階段人工檢視頁；不把 checkpoint 視為 Ready 核准。"""
    collision_items = [item for item in summary["items"] if item["collisionProxyPresent"]]
    attachment_items = [item for item in summary["items"] if item["characterAttachmentCount"] > 0]
    rows = [
        "<!doctype html><html lang='zh-Hant'><meta charset='utf-8'>",
        "<title>BrickHigh Gate 2 Collision Checkpoint</title>",
        "<style>body{font-family:system-ui;background:#17202c;color:#f5f5f5;max-width:1180px;margin:auto;padding:24px}"
        "a{color:#8fc8ff}.ok{color:#75e6a4}.blocked{color:#ffb36b}table{width:100%;border-collapse:collapse;margin:18px 0}"
        "th,td{border:1px solid #526273;padding:8px;text-align:left;vertical-align:top}th{background:#283749}"
        ".cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:14px}.card{background:#202c3a;padding:14px;border:1px solid #526273;border-radius:8px}"
        "svg{width:100%;background:#111923;border-radius:6px}code{white-space:normal}</style>",
        "<h1>Gate 2 子階段 1：Collision / Cavity Checkpoint</h1>",
        f"<p><strong>固定模型：</strong>{summary['itemCount']}/20；<strong>reference dimensions：</strong>{summary['referenceDimensionCount']}/20；"
        f"<strong>collisionProxy：</strong><span class='ok'>{summary['collisionProxyCount']}/20</span>；"
        f"<strong>角色 attachment：</strong><span class='ok'>{summary['characterAttachmentModelCount']}/20 models, {summary['characterAttachmentCount']} anchors</span>；"
        f"<strong>Gate 2 尺寸與接點 Ready：</strong><span class='ok'>{summary['gate2ReadyCount']}/20</span>；"
        f"<strong>正式 Catalog revision Ready：</strong>{summary['readyCount']}/20。</p>",
        "<p>綠點＝已由 Unity PlayMode 真 MeshCollider 驗證的 System logical socket；藍色菱形＝已綁定 passage 實證的特殊 female connector；青色方塊＝已綁定 solid 實證的特殊 male connector；橘線＝compound collisionProxy box 的底視投影。"
        "此頁確認固定樣本的尺寸與接點/碰撞通過即屬 Gate 2 幾何 Ready；此結論不是正式 Catalog revision 或 Release 發布核准。</p>",
        "<p><a href='../pm-20260928-interactive-20-a/manual-visual-review.html'>開啟 20 件實際 Player 六方向畫面</a></p>",
        "<table><thead><tr><th>#</th><th>模型</th><th>Collision</th><th>Gate 2 Ready</th></tr></thead><tbody>",
    ]
    for index, item in enumerate(summary["items"], start=1):
        collision = "<span class='ok'>Verified</span>" if item["collisionProxyPresent"] else "<span class='blocked'>Pending</span>"
        rows.append(
            f"<tr><td>{index:02d}</td><td>{html.escape(item['sourcePart'])}</td><td>{collision}</td>"
            f"<td>{'Yes' if item['gate2Ready'] else 'No'}</td></tr>"
        )
    rows.append("</tbody></table>")
    if attachment_items:
        rows.append("<h2>角色 Attachment 人工檢視</h2><div class='cards'>")
        for item in attachment_items:
            document = _read_json(output / item["file"])
            evidence = document.get("characterAttachmentEvidence", {})
            rows.extend([
                "<section class='card'>",
                f"<h3>{html.escape(item['sourcePart'])}</h3>",
                f"<p>anchors：{item['characterAttachmentCount']}；evidence：<code>{html.escape(evidence.get('method', ''))}</code></p>",
                _character_attachment_svg(document),
                "<p>黃點只表示已由 pinned parent map 定義的角色組裝原點；請配合實際 Player 六方向畫面確認位置語意。Collision 驗證狀態請以總表與下方 collision 視圖為準。</p>",
                "</section>",
            ])
        rows.append("</div>")
    rows.append(f"<h2>本輪 {summary['collisionProxyCount']} 件已驗證 Collision 視圖</h2><div class='cards'>")
    for item in collision_items:
        document = _read_json(output / item["file"])
        proxy = document["collisionProxy"]
        female_count = len([connector for connector in document.get("connectors", []) if connector.get("side") == "female"])
        male_special_count = len([connector for connector in document.get("connectors", []) if connector.get("side") == "male" and connector.get("profile") != "system-stud-v1"])
        rows.extend([
            "<section class='card'>",
            f"<h3>{html.escape(item['sourcePart'])}</h3>",
            f"<p>female connectors：{female_count}；special male：{male_special_count}；proxy boxes：{len(proxy.get('shapes', []))}；cavity checks：{len(proxy.get('cavityChecks', []))}；passage checks：{len(proxy.get('passageChecks', []))}；solid checks：{len(proxy.get('solidChecks', []))}</p>",
            _collision_svg(document),
            f"<p><code>{html.escape(document.get('runtimeConnectorEvidence', {}).get('method', ''))}</code></p>",
            "</section>",
        ])
    rows.append("</div></html>")
    (output / "checkpoint-review.html").write_text("\n".join(rows), encoding="utf-8")


def write_gate2_metadata_inputs(project, folders, output):
    """輸出可重新產生的 metadata inputs 與摘要；不修改既有模型 artifact。"""
    project, output = Path(project), Path(output)
    output.mkdir(parents=True, exist_ok=True)
    items = []
    for index, folder in enumerate(folders, start=1):
        result = build_gate2_metadata_proposal(project, folder)
        filename = f"{index:02d}-{Path(result['sourcePart']).stem}.json"
        (output / filename).write_text(json.dumps(result["proposal"], ensure_ascii=False, indent=2), encoding="utf-8")
        source_promoted = (result["proposal"].get("sourceConnectorEvidence") or {}).get("promotedCount", 0)
        total_connectors = len(result["proposal"].get("connectors", []))
        character_attachment_count = len(result["proposal"].get("characterAttachments", []))
        items.append({
            "folder": folder,
            "sourcePart": result["sourcePart"],
            "file": filename,
            "candidateCount": result["candidateCount"],
            "promotedConnectorCount": source_promoted,
            "totalConnectorCount": total_connectors,
            "runtimeConnectorCount": max(0, total_connectors - source_promoted),
            "readyAsset": result["proposal"].get("readyAsset"),
            "gate2Ready": result["proposal"]["gate2Ready"],
            "collisionProxyPresent": bool(result["proposal"].get("collisionProxy")),
            "characterAttachmentCount": character_attachment_count,
        })
    summary = {
        "schemaVersion": 1,
        "purpose": "Gate 2 fixed-20 conservative metadata inputs for the next immutable revision",
        "itemCount": len(items),
        "candidateModelCount": sum(item["candidateCount"] > 0 for item in items),
        "candidatePromotionCount": sum(item["candidateCount"] > 0 and item["promotedConnectorCount"] == item["candidateCount"] for item in items),
        "readyCount": sum(item["readyAsset"] is True for item in items),
        "gate2ReadyCount": sum(item["gate2Ready"] is True for item in items),
        "collisionProxyCount": sum(item["collisionProxyPresent"] for item in items),
        "characterAttachmentModelCount": sum(item["characterAttachmentCount"] > 0 for item in items),
        "characterAttachmentCount": sum(item["characterAttachmentCount"] for item in items),
        "referenceDimensionCount": sum(_read_json(output / item["file"]).get("referenceDimensions") is not None for item in items),
        "items": items,
    }
    (output / "summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    _write_checkpoint_review(output, summary)
    return summary
