"""以實際封存bytes與人工覆核附件核對revision品質報告。"""

import hashlib
import json
import re
import struct
import zlib

from .content import ContentPathPolicy, ObjectStore
from .glb import inspect_glb, verify_validator_report
from .materials import verify_exported_materials, verify_printed_source_surfaces, verify_printed_source_geometry
from .metadata_quality import inspect_metadata
from .policies import CatalogError, GateNotMet, canonical_json, digest


_SHA = re.compile(r"^[0-9a-f]{64}$")
_VIEWS = {"front", "back", "left", "right", "top", "bottom"}
_PNG = b"\x89PNG\r\n\x1a\n"
_REVIEW_NAMES = {
    "geometry": "review:geometry-evidence",
    "appearance": "review:appearance-evidence",
    "attribution": "review:attribution-evidence",
}
_QUALITY_NAMES = {"quality-review.json", "quality-report.json", *_REVIEW_NAMES.values()}
_CANVAS_FABRIC_WARNING = re.compile(
    r"(?:^|\[importldraw\]\s+)Unsupported material finish: FABRIC for \[colour: Canvas_[^\]]+ code: \d+\](?:\s+in line:.*)?$"
)


def _fail(message="品質報告或封存產物無效。"):
    raise GateNotMet(message)


def _sha(value):
    return isinstance(value, str) and _SHA.fullmatch(value) is not None


def _actionable_importer_warnings(warnings):
    """只忽略 ImportLDraw 載入全域色表時、與目前零件無關的 Canvas FABRIC 能力提示。"""
    if not isinstance(warnings, list):
        return None
    return [item for item in warnings
            if not (isinstance(item, str) and _CANVAS_FABRIC_WARNING.search(item.strip()))]


def _json(data):
    try:
        value = json.loads(data.decode("utf-8"))
    except (UnicodeError, json.JSONDecodeError) as error:
        raise GateNotMet("品質報告引用的JSON無效。") from error
    if not isinstance(value, dict):
        _fail()
    return value


def _files(manifest):
    if not isinstance(manifest, dict) or not isinstance(manifest.get("files"), list):
        _fail("revision manifest缺少封存產物清單。")
    found = {}
    for record in manifest["files"]:
        if (not isinstance(record, dict) or not isinstance(record.get("name"), str)
                or not _sha(record.get("sha256")) or type(record.get("byteLength")) is not int
                or record["byteLength"] <= 0 or not isinstance(record.get("storageKey"), str)
                or record["name"] in found):
            _fail("revision manifest含無效或重複產物。")
        found[record["name"]] = record
    return found


def _read(workspace, files, name):
    record = files.get(name)
    if record is None:
        _fail("品質報告缺少必要封存產物：" + name)
    try:
        data = ContentPathPolicy.read_verified(workspace, record["storageKey"], record["sha256"])
    except (OSError, CatalogError, ValueError) as error:
        raise GateNotMet("封存產物無法通過hash核對：" + name) from error
    if len(data) != record["byteLength"]:
        _fail("封存產物長度不符：" + name)
    return data


def _base_files(files):
    return {name: item for name, item in files.items() if name not in _QUALITY_NAMES}


def _source_provenance_valid(item):
    if not isinstance(item, dict):
        return False
    path = item.get("path")
    source = item.get("source")
    license_text = item.get("license")
    return (
        isinstance(path, str) and bool(path.strip())
        and isinstance(item.get("author"), str) and bool(item["author"].strip())
        and isinstance(license_text, str) and bool(license_text.strip())
        and any(term in license_text for term in ("CC BY 4.0", "CC0", "CCAL version 2.0"))
        and _sha(item.get("sha256"))
        and type(item.get("bytes")) is int and item["bytes"] > 0
        and isinstance(source, str)
        and source == "https://library.ldraw.org/library/official/" + path
    )


def _validate_provenance(conversion, attribution, base):
    source = conversion.get("source")
    toolchain = conversion.get("toolchain")
    if not isinstance(source, dict) or not isinstance(source.get("files"), list) or not source["files"]:
        _fail("轉換報告缺少可追溯來源清單。")
    if not all(_source_provenance_valid(item) for item in source["files"]):
        _fail("來源 provenance 缺少作者、授權、hash、大小或正式來源位置。")

    colour = source.get("colourConfig")
    if (
        not isinstance(colour, dict)
        or colour.get("path") != "LDConfig.ldr"
        or not _sha(colour.get("sha256"))
        or colour.get("source") != "https://library.ldraw.org/library/official/LDConfig.ldr"
        or base.get("sources/LDConfig.ldr", {}).get("sha256") != colour.get("sha256")
    ):
        _fail("LDraw 色彩設定來源版本或hash不完整。")

    if (
        not isinstance(toolchain, dict)
        or not isinstance(toolchain.get("blenderVersion"), str)
        or not toolchain["blenderVersion"].strip()
        or not isinstance(toolchain.get("importerCommit"), str)
        or re.fullmatch(r"[0-9a-f]{40}", toolchain["importerCommit"]) is None
        or toolchain.get("coordinateProfile") != "ldraw-canonical-metres-v1"
        or not _sha(toolchain.get("scriptSha256"))
    ):
        _fail("製作工具版本、ImportLDraw commit、座標契約或腳本hash不完整。")

    if (
        attribution.get("colourConfig") != colour
        or not isinstance(attribution.get("modifications"), str)
        or not attribution["modifications"].strip()
    ):
        _fail("署名報告缺少色彩來源版本或製作修改紀錄。")


def _manifest_identity(revision, files):
    return {"schemaVersion": 1, "revisionId": revision["revision_id"],
            "variantId": revision["variant_id"], "inputDigest": revision["input_digest"],
            "files": list(files.values())}


def _artifact_digest(files):
    return digest([files[name] for name in sorted(files)])


def _png_dimensions(data):
    if len(data) < 8 or not data.startswith(_PNG):
        _fail("六視圖不是有效PNG影像。")
    offset, width, height = 8, None, None
    compressed, saw_end = bytearray(), False
    while offset < len(data):
        if offset + 12 > len(data):
            _fail("六視圖PNG區塊遭截斷。")
        size = struct.unpack_from(">I", data, offset)[0]
        kind_start, body_start = offset + 4, offset + 8
        end = body_start + size
        if end + 4 > len(data):
            _fail("六視圖PNG區塊長度不符。")
        kind, body = data[kind_start:body_start], data[body_start:end]
        checksum = struct.unpack_from(">I", data, end)[0]
        if zlib.crc32(kind + body) & 0xFFFFFFFF != checksum:
            _fail("六視圖PNG區塊CRC不符。")
        if width is None:
            if kind != b"IHDR" or size != 13:
                _fail("六視圖PNG缺少標準IHDR。")
            width, height, depth, colour, compression, filtering, interlace = struct.unpack(">IIBBBBB", body)
            if (not 1 <= width <= 4096 or not 1 <= height <= 4096 or depth != 8 or colour != 6
                    or compression != 0 or filtering != 0 or interlace != 0):
                _fail("六視圖PNG必須是受控8-bit RGBA非交錯影像。")
        elif kind == b"IDAT":
            compressed.extend(body)
        elif kind == b"IEND":
            if size != 0 or end + 4 != len(data):
                _fail("六視圖PNG尾端無效或包含尾隨資料。")
            saw_end = True
            break
        elif kind == b"IHDR":
            _fail("六視圖PNG重複IHDR。")
        offset = end + 4
    if width is None or not saw_end or not compressed:
        _fail("六視圖PNG缺少影像資料或結尾。")
    try:
        pixels = zlib.decompress(bytes(compressed))
    except zlib.error as error:
        raise GateNotMet("六視圖PNG像素資料損毀。") from error
    if len(pixels) != height * (1 + width * 4) or any(
            pixels[row * (1 + width * 4)] > 4 for row in range(height)):
        _fail("六視圖PNG像素資料長度或filter無效。")
    return width, height


def _review_template(workspace, revision, files):
    base = _base_files(files)
    model = _read(workspace, base, "model.glb")
    geometry = inspect_glb(model)
    metadata = _json(_read(workspace, base, "metadata.json"))
    conversion = _json(_read(workspace, base, "conversion.json"))
    attribution = _json(_read(workspace, base, "attribution.json"))
    source_files = [item for item in base if item.startswith("sources/")]
    source_digests = sorted(base[name]["sha256"] for name in source_files)
    if not source_files or len(source_digests) != len(set(source_digests)):
        _fail("製作來源封存缺失或重複。")
    actionable_warnings = _actionable_importer_warnings(conversion.get("importerWarnings"))
    if (conversion.get("geometry", {}).get("sha256") != geometry["sha256"]
            or not isinstance(conversion.get("source"), dict)
            or not isinstance(conversion["source"].get("files"), list)
            or actionable_warnings is None
            or actionable_warnings):
        _fail("轉換報告與實際模型或來源不符，或仍有可採取行動的 importer warning。")
    _validate_provenance(conversion, attribution, base)
    try:
        verify_exported_materials(model, conversion.get("materialComparisons"))
        root_name = conversion["source"]["filename"]
        if (not isinstance(root_name, str) or not root_name.endswith(".dat")
                or "/" in root_name or chr(92) in root_name or root_name in (".dat", "..dat")):
            raise CatalogError("來源分色面缺少安全的根零件檔名。")
        source_bytes = _read(workspace, base, "sources/parts/" + root_name)
        evidence = verify_printed_source_surfaces(model, source_bytes)
        if conversion.get("sourceSurfaceEvidence") != evidence:
            raise CatalogError("來源分色面證據與實際 GLB 或封存來源不一致。")
        shape = verify_printed_source_geometry(model, source_bytes)
        if conversion.get("sourceGeometryEvidence") != shape:
            raise CatalogError("印刷幾何形狀與位置證據與封存來源不一致。")
    except (CatalogError, KeyError, OSError) as error:
        raise GateNotMet("GLB 材質／來源分色面／印刷幾何核對不一致，不得進行 Ready 品質覆核。") from error
    converted = conversion["source"]["files"]
    converted_hashes = sorted(item.get("sha256") for item in converted if isinstance(item, dict))
    archived_source_hashes = sorted(base[name]["sha256"] for name in source_files if name != "sources/LDConfig.ldr")
    if converted_hashes != archived_source_hashes or attribution.get("sources") != converted:
        _fail("來源署名與封存依賴不一致。")
    if (attribution.get("modelSha256") != geometry["sha256"]
            or attribution.get("reviewed") is not False):
        _fail("署名報告未綁定模型或已被改寫。")

    validator = _json(_read(workspace, base, "khronos-report.json"))
    verify_validator_report(validator, geometry)
    metadata_checks = inspect_metadata(metadata, geometry)
    if metadata_checks["geometryIssues"]:
        _fail("模型尺寸、座標或接點metadata尚未通過可計算檢查。")

    views = _json(_read(workspace, base, "six-views.json"))
    profile = views.get("profile")
    if (views.get("schemaVersion") != 1 or type(views.get("schemaVersion")) is not int
            or views.get("modelSha256") != geometry["sha256"] or views.get("visualApproved") is not False
            or not isinstance(profile, dict)
            or profile.get("id") != "catalog-six-views-v1" or profile.get("coordinateProfile") != "canonical-rh-metres-v1"
            or profile.get("engine") != "CYCLES" or profile.get("device") != "CPU"
            or profile.get("samples") != 16 or type(profile.get("samples")) is not int
            or profile.get("seed") != 0 or type(profile.get("seed")) is not int
            or profile.get("denoising") is not True or profile.get("resolution") != [384, 384]
            or profile.get("viewTransform") != "Standard" or profile.get("worldStrength") != .65
            or not _sha(profile.get("scriptSha256"))):
        _fail("六視圖報告缺少固定profile或模型身分不符。")
    if not isinstance(views.get("views"), dict) or set(views["views"]) != _VIEWS:
        _fail("六視圖方向不完整。")
    image_hashes = {}
    for name, record in dict(views["views"], preview=views.get("preview")).items():
        expected_name = name + ".png"
        expected_direction = {"front": [0, 0, 1], "back": [0, 0, -1], "left": [-1, 0, 0],
                              "right": [1, 0, 0], "top": [0, 1, 0], "bottom": [0, -1, 0],
                              "preview": [1, .8, 1]}[name]
        if (not isinstance(record, dict) or record.get("file") != expected_name
                or (name != "preview" and record.get("canonicalDirection") != expected_direction)):
            _fail("六視圖檔案對照無效。")
        data = _read(workspace, base, expected_name)
        if (hashlib.sha256(data).hexdigest() != record.get("sha256")
                or len(data) != record.get("byteLength")):
            _fail("六視圖bytes與報告不符。")
        _png_dimensions(data)
        image_hashes[expected_name] = record["sha256"]

    required = {"model.glb", "metadata.json", "conversion.json", "khronos-report.json",
                "attribution.json", "six-views.json", "preview.png",
                *(name + ".png" for name in _VIEWS)}
    if not required.issubset(base):
        _fail("品質報告缺少GLB、metadata、validator或六視圖產物。")
    return {
        "schemaVersion": 1,
        "revisionId": revision["revision_id"],
        "variantId": revision["variant_id"],
        "inputDigest": revision["input_digest"],
        "artifactDigest": _artifact_digest(base),
        "modelSha256": geometry["sha256"],
        "metadataSha256": base["metadata.json"]["sha256"],
        "attributionSha256": base["attribution.json"]["sha256"],
        "sixViewsSha256": base["six-views.json"]["sha256"],
        "sourceSha256s": source_digests,
        "artifactSha256s": {name: base[name]["sha256"] for name in sorted(base)},
        "checks": {
            "selfContainedGlb": True,
            "khronosValidator": True,
            "metadataGeometry": True,
            "sourceArchiveMatchesAttribution": True,
            "sixViewsMatchModel": True,
            "appearanceReviewRequired": True,
            "geometryReviewRequired": True,
            "attributionReviewRequired": True,
        },
        "reviewEvidence": None,
        "_internal": {"geometry": geometry, "metadataChecks": metadata_checks,
                      "imageSha256s": image_hashes, "sourceNames": source_files},
    }


def quality_review_template(workspace, revision, manifest):
    """產生待人工填寫模板；預設Pending，不能直接提升revision。"""
    files = _files(manifest)
    summary = _review_template(workspace, revision, files)
    summary.pop("_internal")
    common = {"decision": "Pending", "reviewer": "", "reason": "",
              "evidencePath": "", "evidenceSha256": ""}
    reviews = {
        "geometry": dict(common, modelSha256=summary["modelSha256"],
                          metadataSha256=summary["metadataSha256"],
                          sourceSha256s=summary["sourceSha256s"]),
        "appearance": dict(common, modelSha256=summary["modelSha256"],
                            sixViewsSha256=summary["sixViewsSha256"],
                            sourceSha256s=summary["sourceSha256s"]),
        "attribution": dict(common, attributionSha256=summary["attributionSha256"],
                            sourceSha256s=summary["sourceSha256s"]),
    }
    return ({key: summary[key] for key in (
        "schemaVersion", "revisionId", "variantId", "inputDigest", "artifactDigest",
        "modelSha256", "metadataSha256", "attributionSha256", "sixViewsSha256", "sourceSha256s")}
        | {"reviews": reviews})


def _normalize_review(workspace, revision, files, submitted):
    template = quality_review_template(workspace, revision, _manifest_identity(revision, files))
    identity_keys = set(template) - {"reviews"}
    if (not isinstance(submitted, dict) or set(submitted) != set(template)
            or any(submitted.get(key) != template[key] for key in identity_keys)):
        _fail("品質報告revision、來源或產物摘要已過期。")
    if not isinstance(submitted["reviews"], dict) or set(submitted["reviews"]) != set(_REVIEW_NAMES):
        _fail("品質報告必須包含幾何、外觀及署名覆核。")
    normalized = {key: submitted[key] for key in identity_keys}
    normalized["reviews"] = {}
    for name, expected in template["reviews"].items():
        review = submitted["reviews"][name]
        required = set(expected)
        if (not isinstance(review, dict) or set(review) != required
                or any(review.get(key) != value for key, value in expected.items()
                       if key not in {"decision", "reviewer", "reason", "evidencePath", "evidenceSha256"})
                or review.get("decision") != "Approved"
                or not isinstance(review.get("reviewer"), str) or not review["reviewer"].strip()
                or not isinstance(review.get("reason"), str) or not review["reason"].strip()
                or not isinstance(review.get("evidencePath"), str)
                or not _sha(review.get("evidenceSha256"))):
            _fail("每項品質覆核都需有明確核准者與附件。")
        try:
            data = ContentPathPolicy.read_verified(workspace, review["evidencePath"], review["evidenceSha256"])
        except (OSError, CatalogError, ValueError) as error:
            raise GateNotMet("品質覆核附件無法通過hash核對。") from error
        if not data:
            _fail("品質覆核附件不可為空。")
        normalized["reviews"][name] = {key: value for key, value in review.items()
                                       if key != "evidencePath"}
    return normalized


def _quality_summary(workspace, revision, files, review):
    summary = _review_template(workspace, revision, files)
    summary.pop("_internal")
    template = quality_review_template(workspace, revision, _manifest_identity(revision, files))
    if (not isinstance(review, dict) or set(review) != set(template)
            or any(review.get(key) != template[key] for key in set(template) - {"reviews"})
            or not isinstance(review.get("reviews"), dict)
            or set(review["reviews"]) != set(_REVIEW_NAMES)):
        _fail("封存品質覆核與revision摘要不符。")
    evidence_records = {item["name"]: item for item in files.values() if item["name"] in _REVIEW_NAMES.values()}
    reviewers = {}
    for kind, name in _REVIEW_NAMES.items():
        item = review["reviews"][kind]
        expected_review = template["reviews"][kind]
        evidence = evidence_records.get(name)
        if (not isinstance(item, dict) or set(item) != set(expected_review) - {"evidencePath"}
                or any(item.get(key) != value for key, value in expected_review.items()
                       if key not in {"decision", "reviewer", "reason", "evidencePath", "evidenceSha256"})
                or item.get("decision") != "Approved"
                or not isinstance(item.get("reviewer"), str) or not item["reviewer"].strip()
                or not isinstance(item.get("reason"), str) or not item["reason"].strip()
                or not _sha(item.get("evidenceSha256")) or evidence is None
                or item["evidenceSha256"] != evidence["sha256"]):
            _fail("品質覆核附件缺失或摘要不符。")
        evidence_data = _read(workspace, {name: evidence}, name)
        if not evidence_data:
            _fail("品質覆核附件為空。")
        reviewers[kind] = {"decision": "Approved", "reviewer": item["reviewer"],
                           "reason": item["reason"],
                           "evidenceSha256": evidence["sha256"]}
    summary["reviewEvidence"] = reviewers
    summary["sourceManifestDigest"] = summary["artifactDigest"]
    del summary["artifactDigest"]
    summary["checks"].update({"geometryReview": True, "appearanceReview": True,
                              "attributionReview": True})
    return summary


def verify_quality_bundle(workspace, revision, manifest, validation):
    """驗證即將提交Ready的完整报告，拒絕一般boolean及自述digest。"""
    if not isinstance(revision, dict) or not isinstance(validation, dict):
        _fail("Ready revision缺少結構化品質報告。")
    quality_review_template(workspace, revision, manifest)
    files = _files(manifest)
    required_quality = {"quality-review.json", "quality-report.json", *_REVIEW_NAMES.values()}
    if not required_quality.issubset(files):
        _fail("Ready revision缺少持久化品質報告及人工覆核附件。")
    review = _json(_read(workspace, files, "quality-review.json"))
    expected = _quality_summary(workspace, revision, files, review)
    report_bytes = _read(workspace, files, "quality-report.json")
    report = _json(report_bytes)
    report_digest = hashlib.sha256(report_bytes).hexdigest()
    if (canonical_json(report) != canonical_json(expected)
            or validation.get("quality_passed") is not True
            or validation.get("provenance_passed") is not True
            or validation.get("qualityReportSha256") != report_digest
            or validation.get("evidence_digest") != digest(expected)):
        _fail("持久化品質報告與實際revision、產物或覆核附件不一致。")
    return expected


def verify_persisted_quality(workspace, revision):
    """重讀Ready revision完整證據；可供coverage、validate及選件前共用。"""
    if revision.get("status") != "Ready":
        return False
    try:
        manifest = json.loads(revision.get("manifest_json") or "{}")
        validation = json.loads(revision.get("validation_json") or "{}")
        verify_quality_bundle(workspace, revision, manifest, validation)
        return True
    except (CatalogError, OSError, TypeError, ValueError, KeyError, AttributeError, json.JSONDecodeError):
        return False


def complete_revision_quality(repo, workspace, revision_id, report_key):
    """封存人工核准附件及可重算品質報告，再提交Validating→Ready。"""
    row = repo.connection.execute("SELECT * FROM model_revisions WHERE revision_id=?", (revision_id,)).fetchone()
    if row is None or row["status"] != "Validating":
        raise GateNotMet("只有Validating revision可提交品質覆核。")
    revision = dict(row)
    manifest = json.loads(row["manifest_json"])
    files = _files(manifest)
    if set(files) & _QUALITY_NAMES:
        _fail("品質覆核已提交；請建立新revision重新驗證。")
    raw = _read_review_file(workspace, report_key)
    submitted = _json(raw)
    normalized = _normalize_review(workspace, revision, files, submitted)

    store = ObjectStore(workspace / "artifacts" / "catalog")
    additions = []
    for kind, name in _REVIEW_NAMES.items():
        source = submitted["reviews"][kind]
        data = ContentPathPolicy.read_verified(workspace, source["evidencePath"], source["evidenceSha256"])
        saved = store.put(data)
        additions.append({"name": name, "sha256": saved["sha256"], "byteLength": saved["byte_length"],
                          "storageKey": "artifacts/catalog/" + saved["storage_key"]})
    normalized_bytes = canonical_json(normalized).encode("utf-8")
    saved_review = store.put(normalized_bytes)
    additions.append({"name": "quality-review.json", "sha256": saved_review["sha256"],
                      "byteLength": saved_review["byte_length"],
                      "storageKey": "artifacts/catalog/" + saved_review["storage_key"]})
    updated = dict(manifest)
    updated["files"] = [*manifest["files"], *additions]
    files = _files(updated)
    summary = _quality_summary(workspace, revision, files, normalized)
    report_bytes = canonical_json(summary).encode("utf-8")
    saved_report = store.put(report_bytes)
    report_file = {"name": "quality-report.json", "sha256": saved_report["sha256"],
                   "byteLength": saved_report["byte_length"],
                   "storageKey": "artifacts/catalog/" + saved_report["storage_key"]}
    updated["files"].append(report_file)
    validation = {"quality_passed": True, "provenance_passed": True,
                  "qualityReportSha256": report_file["sha256"], "evidence_digest": digest(summary)}
    repo.transition_revision(revision_id, "Ready", report=validation, manifest=updated)
    return {"revisionId": revision_id, "status": "Ready", "qualityReportSha256": report_file["sha256"]}


def _read_review_file(workspace, report_key):
    try:
        return ContentPathPolicy.read_bytes(workspace, report_key)
    except (OSError, CatalogError, ValueError) as error:
        raise CatalogError("品質覆核報告檔案無法安全讀取。") from error

def reuse_approved_revision(repo, workspace, source_revision_id, variant_id, binding_reference, checkpoint=None):
    """只重用已Ready且相同GLB／metadata的核准；新revision仍走完整品質API。"""
    row = repo.connection.execute("SELECT * FROM model_revisions WHERE revision_id=?", (source_revision_id,)).fetchone()
    source = dict(row) if row else {}
    if not verify_persisted_quality(workspace, source):
        raise GateNotMet("來源修訂沒有可重算的既有核准。")
    manifest = json.loads(source["manifest_json"])
    previous = _files(manifest)
    binding = ContentPathPolicy.read_verified(workspace, binding_reference["storageKey"], binding_reference["sha256"])
    proof = json.loads(binding)
    if (proof.get("sourceRevisionId") != source_revision_id
            or proof.get("modelSha256") != previous["model.glb"]["sha256"]
            or proof.get("metadataSha256") != previous["metadata.json"]["sha256"]):
        raise GateNotMet("來源綁定未引用相同模型及metadata。")
    inputs = digest({"sourceRevisionId": source_revision_id, "variantId": variant_id,
                     "bindingSha256": binding_reference["sha256"]})
    revision = repo.start_revision(variant_id, inputs,
                                   {"reuseFromRevision": source_revision_id, "sourceBindingSha256": binding_reference["sha256"]})
    existing = dict(repo.connection.execute("SELECT * FROM model_revisions WHERE revision_id=?", (revision,)).fetchone())
    if existing["status"] == "Ready":
        if not verify_persisted_quality(workspace, existing):
            raise GateNotMet("後繼修訂品質封存失效。")
        return revision
    if existing["status"] != "Pending":
        raise GateNotMet("後繼修訂不是可恢復的原子提交狀態。")
    repo.transition_revision(revision, "Building")
    changed = {"schemaVersion": 1, "revisionId": revision, "variantId": variant_id, "inputDigest": inputs,
               "files": [*list(_base_files(previous).values()), dict(binding_reference, name="source-onboarding.json")]}
    repo.transition_revision(revision, "Validating", manifest=changed)
    if checkpoint:
        checkpoint("after_revision")
    current = dict(repo.connection.execute("SELECT * FROM model_revisions WHERE revision_id=?", (revision,)).fetchone())
    review = quality_review_template(workspace, current, changed)
    old = json.loads(_read(workspace, previous, "quality-review.json"))
    for kind, name in _REVIEW_NAMES.items():
        approval = old["reviews"][kind]
        if approval.get("decision") != "Approved":
            raise GateNotMet("原始審查不是明確核准。")
        # 清楚保存原核准者與原SHA附件；不是宣稱人類重新審查新來源身份。
        review["reviews"][kind].update(decision="Approved", reviewer=approval["reviewer"],
            reason=approval["reason"] + "；沿用同模型SHA的既有核准：" + source_revision_id,
            evidencePath=previous[name]["storageKey"], evidenceSha256=previous[name]["sha256"])
    store = ObjectStore(workspace/"artifacts/catalog")
    saved = store.put(canonical_json(review).encode("utf-8"))
    complete_revision_quality(repo, workspace, revision, "artifacts/catalog/" + saved["storage_key"])
    return revision
