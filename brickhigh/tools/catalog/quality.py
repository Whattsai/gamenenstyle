"""以實際封存bytes與人工覆核附件核對revision品質報告。"""

import hashlib
import json
import re
import struct
import zlib

from .content import ContentPathPolicy, ObjectStore
from .glb import inspect_glb, verify_validator_report
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


def _fail(message="品質報告或封存產物無效。"):
    raise GateNotMet(message)


def _sha(value):
    return isinstance(value, str) and _SHA.fullmatch(value) is not None


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
    if (conversion.get("geometry", {}).get("sha256") != geometry["sha256"]
            or not isinstance(conversion.get("source"), dict)
            or not isinstance(conversion["source"].get("files"), list)
            or not isinstance(conversion.get("importerWarnings"), list)
            or conversion["importerWarnings"]):
        _fail("轉換報告與實際模型或來源不符。")
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
