"""SPEC-001固定來源→合法後繼→相同模型品質重驗；只由固定MCP Job執行正式操作。"""
import argparse
from dataclasses import asdict
import hashlib
import json
from pathlib import Path
import re
import sqlite3

from .content import ContentPathPolicy, ObjectStore
from .importing import import_catalog
from .lego_pick_a_brick import map_pick_a_brick_set_response
from .set_inventory_identity import load_authoritative_element_bindings, SetInventoryIdentityError
from .policies import CatalogError, CatalogConflict, GateNotMet, canonical_json, digest
from .quality import verify_persisted_quality, reuse_approved_revision
from .quality_submission import _save, submission_lock
from .repository import CatalogRepository
from .validation_content import create_request

PLAN_KEY = "build-plans/source-onboarding.json"
OFFICIAL_QUERY = "https://www.lego.com/api/graphql/PickABrickQuery"


class OnboardingInterrupted(RuntimeError):
    """只供隔離故障注入；CLI不接受任何注入參數。"""


def _hash(data):
    return hashlib.sha256(data).hexdigest()


def _read(root, key):
    return ContentPathPolicy.read_bytes(root, key)


def _json(root, key):
    return json.loads(_read(root, key))


def _verified_json(root, key, sha):
    return json.loads(ContentPathPolicy.read_verified(root, key, sha))


def _progress(stage, completed, total):
    print("@@JOB " + canonical_json({"stage": stage, "completed": completed, "total": total,
                                     "timeoutSeconds": 300}), flush=True)


def _checkpoint(fault, point):
    if fault == point:
        raise OnboardingInterrupted(point)


def _verify_query_input(request):
    """只接受單一固定root真正使用$input；拒絕literal篩選、alias、directive或額外operation。"""
    query = request.get("query", "")
    if not isinstance(query, str):
        raise GateNotMet("官方query必須是真正使用已驗input的單一查詢。")
    prefix = re.match(r"^\s*query\s+PickABrickQuery\s*\(\s*\$input\s*:\s*ElementQueryInput!\s*\)\s*\{\s*searchElements\s*\(\s*input\s*:\s*\$input\s*\)\s*\{", query)
    if not prefix:
        raise GateNotMet("官方query未實際使用已驗證的$input。")
    selection = query[prefix.end():]
    if not re.fullmatch(r"[A-Za-z0-9_\s.{}]+", selection):
        raise GateNotMet("官方query包含alias、directive或未允許的selection參數。")
    depth = 1
    for index, char in enumerate(selection):
        if char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                if selection[index+1:].strip() == "}":
                    return
                break
    raise GateNotMet("官方query不是唯一完整searchElements root。")


def read_official_exchange(project, reference, dataset_root, required_element_ids=None):
    """必須是原MCP封存的官方POST；不信任檔名、URL聲明或第三方ID。"""
    key = reference["manifestPath"]
    if not re.fullmatch(r"artifacts/sources/[a-z0-9-]+/exchange-manifest.json", key):
        raise GateNotMet("官方封存路徑無效。")
    m = _verified_json(project, key, reference["manifestSha256"])
    folder = key.rsplit("/", 1)[0]
    source_id = folder.rsplit("/", 1)[1]
    if (m.get("schemaVersion") != 1 or m.get("sourceId") != source_id
            or m.get("method") != "POST" or m.get("requestedUrl") != OFFICIAL_QUERY
            or m.get("finalUrl") != OFFICIAL_QUERY or m.get("httpStatus") != 200
            or m.get("ok") is not True or m.get("redirectChain") != []
            or not m.get("contentType", "").startswith("application/json")):
        raise GateNotMet("來源不是成功、可追溯的LEGO官方封存。")
    paths = {}
    for part in ["request", "response"]:
        key_part = folder + "/" + part + ".bin"
        if m.get("paths", {}).get(part) != "brickhigh/" + key_part:
            raise GateNotMet("封存manifest路徑不一致。")
        data = ContentPathPolicy.read_verified(project, key_part, m[part+"Sha256"])
        if len(data) != m[part+"ByteLength"]:
            raise GateNotMet("封存長度與實際bytes不一致。")
        if part == "request":
            _verify_query_input(json.loads(data))
        paths[part] = ContentPathPolicy.resolve(project, key_part)
    try:
        mapping = map_pick_a_brick_set_response(paths["request"], paths["response"],
                                                dataset_root, reference["setNumber"],
                                                required_element_ids=required_element_ids)
    except SetInventoryIdentityError as error:
        raise GateNotMet(str(error)) from error
    if mapping.request_sha256 != m["requestSha256"] or mapping.response_sha256 != m["responseSha256"]:
        raise GateNotMet("映射讀取的原始bytes與MCP封存SHA不一致。")
    return {"reference": reference, "manifest": m, "mapping": mapping,
            "requestKey": folder+"/request.bin", "responseKey": folder+"/response.bin",
            "rows": _verified_json(project, folder+"/response.bin", m["responseSha256"])["data"]["searchElements"]["results"]}


def _appearance_evidence(project, candidate, item, references):
    """只驗附件身分與bytes；驗證成功不代表外觀、模具或來源資格已核准。"""
    if not isinstance(references, list) or not references:
        return ["OfficialAppearanceEvidenceMissing"]
    supported = False
    for ref in references:
        manifest = _verified_json(project, ref["manifestPath"], ref["manifestSha256"])
        key = ref["path"]
        element = candidate["elementId"]
        fixed_photo = (isinstance(element, str) and re.fullmatch(r"[0-9]{6,8}", element) is not None
            and manifest.get("sourceUri") == "https://www.lego.com/cdn/product-assets/element.img.lod5photo.192x192/"+element+".jpg")
        if (not re.fullmatch(r"artifacts/sources/[a-z0-9-]+/source.bin", key)
                or ref["manifestPath"] != key.rsplit("/", 1)[0]+"/manifest.json"
                or manifest.get("storagePath") != "brickhigh/"+key
                or (manifest.get("sourceUri") != "https://www.lego.com/service/bricks/5/2/"+element and not fixed_photo)
                or manifest.get("httpStatus") != 200 or manifest.get("sha256") != ref["sha256"]):
            raise GateNotMet("外觀附件不是原MCP封存的對應官方Element來源。")
        data = ContentPathPolicy.read_verified(project, key, ref["sha256"])
        if len(data) != manifest["byteLength"]:
            raise GateNotMet("外觀附件長度不符。")
        if fixed_photo and manifest.get("contentType", "").split(";", 1)[0].strip().lower() != "image/jpeg":
            return ["OfficialAppearanceFormatUnsupported"]
        # JSON原始資料可機器核對；影像必須有上述逐件審查且保留真正圖像bytes。
        if manifest.get("contentType", "").startswith("application/json"):
            detail = json.loads(data)
            if (detail.get("elementId") != candidate["elementId"]
                    or detail.get("designId") != candidate["designId"]
                    or detail.get("ldrawColour") != item["ldrawColour"]
                    or detail.get("ldrawPart") != item["ldrawPart"]
                    or detail.get("mouldPart") != item["ldrawPart"][:-4]
                    or type(detail.get("printed")) is not bool or not detail.get("shape")):
                return ["OfficialShapeColourPrintOrMouldMismatch"]
            supported = True
        elif ((manifest.get("contentType", "").startswith("image/png") and data.startswith(bytes([137,80,78,71,13,10,26,10])))
              or (manifest.get("contentType", "").startswith("image/jpeg") and data.startswith(bytes([255,216,255])))):
            try:
                from io import BytesIO
                from PIL import Image
                if len(data) > 8_000_000:
                    raise ValueError("image limit")
                with Image.open(BytesIO(data)) as image:
                    if image.format not in {"PNG", "JPEG"} or image.width * image.height > 16_000_000:
                        raise ValueError("image format or dimensions")
                    if fixed_photo and (image.format != "JPEG" or image.size != (192, 192)
                                        or not data.endswith(bytes([255,217]))):
                        raise ValueError("fixed Element photo must be a complete 192x192 JPEG")
                    image.verify()
                if fixed_photo:
                    # verify不完整解碼JPEG；另以相同SHA bytes實際解碼，拒絕截斷／損毀stream。
                    with Image.open(BytesIO(data)) as decoded:
                        decoded.load()
            except (OSError, ValueError, Image.DecompressionBombError):
                return ["OfficialAppearanceImageInvalid"]
            supported = True
        else:
            return ["OfficialAppearanceFormatUnsupported"]
    if not supported:
        return ["OfficialAppearanceUnverified"]
    return []


def _appearance(project, candidate, item, source, official):
    """核對可追溯的逐件審查；空布林、自述ID或第三方附件都不足以放行。"""
    if not candidate.get("reviewPath") or not candidate.get("reviewSha256"):
        references = candidate.get("officialEvidence")
        if references:
            issues = _appearance_evidence(project, candidate, item, references)
            if issues:
                return None, issues
        return None, ["OfficialAppearanceReviewMissing"]
    review = _verified_json(project, candidate["reviewPath"], candidate["reviewSha256"])
    files = {f["name"]: f for f in json.loads(source["manifest_json"])["files"]}
    expected = {"schemaVersion": 1, "elementId": candidate["elementId"],
                "designId": candidate["designId"], "sourceRevisionId": source["revision_id"],
                "modelSha256": files["model.glb"]["sha256"], "metadataSha256": files["metadata.json"]["sha256"],
                "ldrawPart": item["ldrawPart"], "ldrawColour": item["ldrawColour"]}
    if (any(review.get(k) != v for k, v in expected.items())
            or review.get("decision") != "Approved"
            or not isinstance(review.get("reviewer"), str) or not review["reviewer"].strip()
            or not isinstance(review.get("reason"), str) or not review["reason"].strip()
            or review.get("checks") != {"shape": True, "colour": True, "print": True, "mould": True}):
        raise GateNotMet("外觀審查與Element、revision或實際模型摘要不符。")
    issues = _appearance_evidence(project, candidate, item, review.get("officialEvidence"))
    if issues:
        return None, issues
    # 4032a與4032等尾碼差異只由明確逐件模具審查決定，不做去尾碼猜測。
    if item["ldrawPart"][:-4] != candidate.get("designId") and not review.get("mouldEquivalenceReason"):
        return None, ["MouldEquivalenceEvidenceMissing"]
    return review, []


def _fence(repo, plan):
    current = repo._require(plan["parentSnapshotId"], {"Frozen"})
    if (type(plan["parentVersion"]) is not int or current["version"] != plan["parentVersion"]
            or repo.selection_digest(plan["parentSnapshotId"]) != plan["parentSelectionDigest"]):
        raise CatalogConflict("父Frozen版本／selection digest已變更。")


def _store(project, data):
    saved = ObjectStore(project/"artifacts/catalog").put(data)
    return {"storageKey": "artifacts/catalog/"+saved["storage_key"], "sha256": saved["sha256"],
            "byteLength": saved["byte_length"]}


def _verify_result(project, repo, result):
    snapshot = repo.snapshot(result["snapshotId"])
    if (snapshot["status"] != "Frozen" or snapshot["version"] != result["snapshotVersion"]
            or repo.selection_digest(result["snapshotId"]) != result["sourceSelectionDigest"]):
        raise CatalogConflict("後繼Frozen已改變，不能重用舊結果。")
    proof = _verified_json(project, result["evidenceKey"], result["evidenceSha256"])
    if proof["snapshotId"] != result["snapshotId"] or proof["items"] != result["items"]:
        raise GateNotMet("提交內容庫證據與結果不符。")
    for entry in repo.entries(result["snapshotId"]):
        if not verify_persisted_quality(project, entry):
            raise GateNotMet("後繼Ready證據失效。")


def _arm_validation(project, plan, result):
    """DB已提交後的可恢復CAS；舊plan已封存，其他人改動時拒絕覆寫。"""
    if plan.get("validationPlanSha256") is None:
        return
    key = "build-plans/validation-content.json"
    project_version = _read(project, "game/ProjectSettings/ProjectVersion.txt").decode()
    match = re.search(r"^m_EditorVersion: (.+)$", project_version, re.M)
    if not match:
        raise GateNotMet("無法取得實際Unity Editor版本。")
    request = create_request(project, plan["database"], result["snapshotId"], match[1].strip())
    data = canonical_json(request).encode("utf-8")
    existing = _read(project, key)
    if existing == data:
        return
    if _hash(existing) != plan["validationPlanSha256"]:
        raise CatalogConflict("正式匯入已提交，但build plan CAS衝突；保留結果供安全恢復。")
    _store(project, existing)
    from .content import ContentPathPolicy
    import os, tempfile
    target = ContentPathPolicy.resolve(project, key)
    fd, temporary = tempfile.mkstemp(prefix=".source-plan-", dir=target.parent)
    try:
        with os.fdopen(fd, "wb") as stream:
            stream.write(data); stream.flush(); os.fsync(stream.fileno())
        if _hash(_read(project, key)) != plan["validationPlanSha256"]:
            raise CatalogConflict("build plan在提交前已改變。")
        os.replace(temporary, target)
    finally:
        Path(temporary).unlink(missing_ok=True)


def onboard_sources(project, plan, *, expected_count=20, fault=None):
    """固定cohort的完整預驗、原子後繼與可重試提交；不修改原QA。"""
    project = Path(project).resolve()
    if (plan.get("schemaVersion") != 1 or not isinstance(plan.get("cohort"), list)
            or len(plan["cohort"]) != expected_count):
        raise GateNotMet("來源計畫必須保留固定20件範圍。")
    cohort = {i["sourceVariantId"]: i for i in plan["cohort"]}
    if len(cohort) != expected_count:
        raise GateNotMet("來源cohort變體重複。")
    dataset = plan["pinnedElements"]
    ContentPathPolicy.read_verified(project, dataset["path"], dataset["sha256"])
    dataset_root = ContentPathPolicy.resolve(project, dataset["path"]).parent
    run_key = digest(plan)
    output = "artifacts/source-onboarding/"+run_key+"/v2"
    _progress("source_verify", 0, expected_count)
    official = {}
    source_records = []
    required_ids = frozenset(c["elementId"] for c in plan["candidates"])
    source_conflicts = {}
    for reference in plan["sources"]:
        source = read_official_exchange(project, reference, dataset_root, required_ids)
        for conflict in source["mapping"].mapping.mapping_conflicts:
            source_conflicts[canonical_json(conflict)] = conflict
        source_records.append(source)
        for binding in source["mapping"].mapping.bindings:
            old = official.get(binding.element_id)
            if old and old["binding"] != binding:
                raise CatalogConflict("不同官方來源對同一Element的Design／part／色碼互相衝突。")
            official[binding.element_id] = {"binding": binding, "source": source}
    candidates = {}
    for candidate in plan["candidates"]:
        key = candidate["sourceVariantId"]
        if key not in cohort or key in candidates:
            raise GateNotMet("官方候選不在原cohort或重複。")
        candidates[key] = candidate
    audit, accepted, templates = [], [], []
    with submission_lock(project):
        with CatalogRepository(ContentPathPolicy.resolve(project, plan["database"]), workspace=project, read_only=True) as repo:
            _fence(repo, plan)
            entries = {e["variant_id"]: e for e in repo.entries(plan["parentSnapshotId"])}
            if set(entries) != set(cohort):
                raise GateNotMet("來源cohort與父Frozen範圍不一致。")
            for index, item in enumerate(plan["cohort"], 1):
                entry = entries[item["sourceVariantId"]]
                if (entry["selected_revision_id"] != item["sourceRevisionId"]
                        or not verify_persisted_quality(project, entry)):
                    raise GateNotMet("QA選件或原核准品質失效。")
                candidate = candidates.get(item["sourceVariantId"])
                issues = []
                bound = None
                review = None
                if not candidate or candidate["elementId"] not in official:
                    issues.append("OfficialElementNotLocatedInVerifiedSources")
                else:
                    bound = official[candidate["elementId"]]
                    binding = bound["binding"]
                    if (binding.design_id != candidate["designId"]
                            or binding.part_num != item.get("pinnedPartNumber", item["ldrawPart"][:-4])
                            or binding.color_id != item.get("pinnedColourId", item["ldrawColour"])):
                        issues.append("OfficialBindingDoesNotMatchExactPartColour")
                    else:
                        review, issues = _appearance(project, candidate, item, entry, bound["source"])
                row = {"sourceVariantId": item["sourceVariantId"], "sourceRevisionId": item["sourceRevisionId"],
                       "ldrawPart": item["ldrawPart"], "ldrawColour": item["ldrawColour"],
                       "elementId": candidate["elementId"] if candidate else None,
                       "designId": candidate["designId"] if candidate else None,
                       "status": "Verified" if not issues else "Blocked", "issues": issues}
                if candidate and issues and bound:
                    files = {f["name"]: f for f in json.loads(entry["manifest_json"])["files"]}
                    template = {"schemaVersion": 1, "elementId": candidate["elementId"],
                        "designId": candidate["designId"], "sourceRevisionId": entry["selected_revision_id"],
                        "modelSha256": files["model.glb"]["sha256"], "metadataSha256": files["metadata.json"]["sha256"],
                        "ldrawPart": item["ldrawPart"], "ldrawColour": item["ldrawColour"],
                        "decision": "Pending", "reviewer": "", "reason": "",
                        "officialEvidence": candidate.get("officialEvidence", []),
                        "checks": {"shape": False, "colour": False, "print": False, "mould": False},
                        "mouldEquivalenceReason": ""}
                    key = output+"/review-templates/"+candidate["elementId"]+".json"
                    templates.append({"path": key, "sha256": _hash(canonical_json(template).encode())})
                    _save(project, key, template)
                audit.append(row)
                if not issues:
                    accepted.append({"item": item, "candidate": candidate, "source": bound["source"],
                                     "binding": binding, "review": review, "entry": entry})
                _progress("source_verify", index, expected_count)
            previous = repo.source_onboarding_run(run_key)
            if previous:
                if previous["input_digest"] != digest({"plan": plan, "audit": audit}):
                    raise CatalogConflict("來源工作鍵內容已改變。")
                result = json.loads(previous["result_json"])
                _verify_result(project, repo, result)
                _arm_validation(project, plan, result)
                _save(project, output+"/result.json", result)
                return result
        _save(project, output+"/inputs.json", plan)
        _save(project, output+"/audit.json", audit)
        mapping_conflicts = [source_conflicts[key] for key in sorted(source_conflicts)]
        _save(project, output+"/source-mapping-conflicts.json", mapping_conflicts)
        if not accepted:
            result = {"status": "Blocked", "importedCount": 0, "verifiedCandidateCount": 0,
                      "candidateCount": len(candidates), "cohortCount": expected_count,
                      "sourceMappingConflicts": mapping_conflicts, "reviewTemplates": templates,
                      "auditKey": output+"/audit.json", "items": audit, "published": False}
            _save(project, output+"/result.json", result)
            return result
        # 所有可驗證來源、審查及模型摘要先封存；失敗最多留下未引用物件。
        raw_refs = []
        for source in source_records:
            for key in [source["reference"]["manifestPath"], source["requestKey"], source["responseKey"]]:
                saved = _store(project, _read(project, key))
                raw_refs.append({"path": key, "sha256": saved["sha256"]})
        records = []
        for item in accepted:
            binding = item["binding"]
            candidate = item["candidate"]
            # 再用既有authoritative binding loader綁定真正完整response。
            binding_doc = {"schemaVersion": 2, "setNumber": item["source"]["mapping"].set_number,
                           "sourceId": item["source"]["manifest"]["sourceId"],
                           "sourceSha256": item["source"]["mapping"].response_sha256,
                           "bindings": [{"partNum": binding.part_num, "colorId": binding.color_id,
                                         "elementId": binding.element_id, "designId": binding.design_id}]}
            key = output+"/bindings/"+binding.element_id+".json"
            _save(project, key, binding_doc)
            actual = load_authoritative_element_bindings(ContentPathPolicy.resolve(project, key),
                ContentPathPolicy.resolve(project, item["source"]["responseKey"]), binding_doc["setNumber"])
            if actual != (binding,):
                raise GateNotMet("authoritative binding重載不一致。")
            records.append({"kind": "candidate", "sourceId": binding.element_id, "family": item["item"]["family"],
                            "designId": binding.design_id, "elementId": binding.element_id,
                            "name": next(r.get("name", item["item"]["ldrawPart"]) for r in item["source"]["rows"]
                                         if str(r["id"]) == binding.element_id),
                            "appearance": {"ldrawPart": item["item"]["ldrawPart"], "colour": item["item"]["ldrawColour"]}})
        page_key = output+"/catalog-page.json"
        _save(project, page_key, {"schemaVersion": 1, "records": records})
        manifest = {"schemaVersion": 1, "baselineAt": max(s["manifest"]["observedAt"] for s in source_records),
                    "expectedFamilies": sorted({r["family"] for r in records}),
                    "parentSnapshot": {"snapshotId": plan["parentSnapshotId"], "version": plan["parentVersion"],
                                       "selectionDigest": plan["parentSelectionDigest"]},
                    "cohort": {"sourceSnapshotId": plan["parentSnapshotId"], "total": expected_count,
                               "blocked": [a for a in audit if a["status"] == "Blocked"]},
                    "sources": [{"name": "Gate3Official-"+run_key[:16], "sourceUri": OFFICIAL_QUERY,
                        "sourceVersion": run_key, "observedAt": max(s["manifest"]["observedAt"] for s in source_records),
                        "effectiveAt": None, "expectedPages": 1, "provenance": raw_refs,
                        "pages": [{"number": 1, "path": page_key, "sha256": _hash(_read(project, page_key))}]}]}
        manifest_key = output+"/catalog-import.json"
        _save(project, manifest_key, manifest)
        with CatalogRepository(ContentPathPolicy.resolve(project, plan["database"]), workspace=project) as repo:
            with repo.transaction():
                _fence(repo, plan)
                imported = import_catalog(repo, project, manifest_key, "source-"+run_key)
                snapshot_id = imported.snapshot_id
                _checkpoint(fault, "after_import")
                new_entries = repo.entries(snapshot_id)
                if repo.coverage(snapshot_id)["G"]:
                    raise CatalogConflict("來源匯入產生身份映射衝突或涵蓋缺口。")
                selected = []
                for candidate in accepted:
                    binding = candidate["binding"]
                    entry = next(e for e in new_entries if json.loads(e["display_projection_json"])["elementId"] == binding.element_id)
                    row = dict(candidate["entry"])
                    proof = {"schemaVersion": 1, "sourceRevisionId": row["selected_revision_id"],
                             "modelSha256": next(f["sha256"] for f in json.loads(row["manifest_json"])["files"] if f["name"]=="model.glb"),
                             "metadataSha256": next(f["sha256"] for f in json.loads(row["manifest_json"])["files"] if f["name"]=="metadata.json"),
                             "officialBinding": asdict(binding), "review": candidate["review"],
                             "officialRequestSha256": candidate["source"]["mapping"].request_sha256,
                             "officialResponseSha256": candidate["source"]["mapping"].response_sha256}
                    saved = _store(project, canonical_json(proof).encode())
                    repo.put_entry(snapshot_id, entry["variant_id"], json.loads(entry["evidence_ids_json"]),
                                   json.loads(row["classification_json"]), json.loads(entry["display_projection_json"]))
                    rid = reuse_approved_revision(repo, project, row["selected_revision_id"], entry["variant_id"],
                                                  saved, lambda point: _checkpoint(fault, point))
                    _checkpoint(fault, "after_quality")
                    selected.append((entry["variant_id"], rid))
                repo.freeze(snapshot_id, repo.snapshot(snapshot_id)["version"])
                for variant, rid in selected:
                    repo.select_revision(snapshot_id, variant, rid, expected_version=repo.snapshot(snapshot_id)["version"])
                _checkpoint(fault, "after_freeze")
                evidence = {"schemaVersion": 1, "snapshotId": snapshot_id, "items": audit,
                            "rawSources": raw_refs, "qualityApprovalReuse": "same-model-and-metadata-sha256", "published": False}
                saved = _store(project, canonical_json(evidence).encode())
                result = {"status": "Passed", "importedCount": len(accepted), "cohortCount": expected_count,
                          "candidateCount": len(candidates), "snapshotId": snapshot_id,
                          "sourceMappingConflicts": mapping_conflicts, "reviewTemplates": templates,
                          "snapshotVersion": repo.snapshot(snapshot_id)["version"],
                          "sourceSelectionDigest": repo.selection_digest(snapshot_id), "items": audit,
                          "evidenceKey": saved["storageKey"], "evidenceSha256": saved["sha256"],
                          "auditKey": output+"/audit.json", "published": False}
                repo.record_source_onboarding(run_key, digest({"plan": plan, "audit": audit}), result)
            _checkpoint(fault, "after_commit")
        _arm_validation(project, plan, result)
        _save(project, output+"/result.json", result)
        _progress("source_complete", len(accepted), expected_count)
        return result


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args(argv)
    project = Path.cwd()
    try:
        result = onboard_sources(project, _json(project, PLAN_KEY))
        print(canonical_json(result), flush=True)
        return 3 if result["status"] == "Blocked" else 0
    except (CatalogError, SetInventoryIdentityError, OSError, ValueError, KeyError, TypeError, sqlite3.Error) as error:
        print(canonical_json({"status": "Failed", "reason": str(error)}), flush=True)
        return 4


if __name__ == "__main__":
    raise SystemExit(main())
