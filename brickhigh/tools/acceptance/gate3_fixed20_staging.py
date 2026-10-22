"""Gate 3 固定20件品質分段資料：保存真 Catalog Validating 修訂與待核准模板。

本模組只建立不會成為正式 Published 來源的 QA staging。任何核准與 Ready
均交由既有 quality-review/verify_quality_bundle 流程處理，不代填人工決策。
"""
import hashlib
import json
from pathlib import Path

from tools.catalog.building import build_catalog
from tools.catalog.quality import quality_review_template, verify_persisted_quality
from tools.catalog.repository import CatalogRepository

_STAGE = "artifacts/acceptance/gate3-fixed20-staging"
_GATE2 = "artifacts/acceptance/gate2-fixed20-metadata-inputs"


def _json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def _input_rows(project):
    summary = _json(project / _GATE2 / "summary.json")
    rows = summary.get("items")
    if (summary.get("itemCount") != 20 or summary.get("gate2ReadyCount") != 20
            or not isinstance(rows, list) or len(rows) != 20):
        raise ValueError("固定20件來源清單未完整通過Gate2，不可建立Gate3。")
    items = []
    seen = set()
    for row in rows:
        source = row.get("sourcePart")
        metadata_file = row.get("file")
        folder = row.get("folder")
        if (not isinstance(source, str) or not source.endswith(".dat")
                or "/" in source or "\\" in source or source in seen and source != "3001.dat"
                or not isinstance(metadata_file, str) or "/" in metadata_file or "\\" in metadata_file
                or not isinstance(folder, str) or folder.startswith("/") or ".." in Path(folder).parts):
            raise ValueError("Gate2來源清單含不安全或衝突的零件路徑。")
        seen.add(source)
        metadata_path = project / _GATE2 / metadata_file
        metadata = _json(metadata_path)
        if (metadata.get("gate2Ready") is not True or metadata.get("sourcePart") != source
                or row.get("gate2Ready") is not True):
            raise ValueError("模型來源與Gate2尺寸／接點證據不一致。")
        conversion = _json(project / "artifacts/models" / folder / "conversion.json")
        if conversion["source"]["filename"] != source:
            raise ValueError("先前模型來源與Gate2來源不一致。")
        colours = conversion.get("materialComparisons")
        if not isinstance(colours, list) or not colours:
            raise ValueError("缺少原始外觀色碼，不得推測建模顏色。")
        colour = colours[0].get("ldrawColour")
        if not isinstance(colour, str) or not colour.isdigit():
            raise ValueError("原始模型色碼無效。")
        family = ("DUPLO" if source == "3437.dat" else "Minifigure" if source == "973p06.dat"
                  else "Technic" if source in {"2780.dat", "3705.dat", "3700.dat", "30374.dat",
                                              "14417.dat", "14418.dat"} else "System")
        items.append({"sourcePart": source, "colour": colour, "family": family,
                      "metadataFile": metadata_file,
                      "metadataPath": metadata_path.relative_to(project).as_posix(),
                      "metadataSha256": hashlib.sha256(metadata_path.read_bytes()).hexdigest()})
    if len({(row["sourcePart"], row["colour"]) for row in items}) != 20:
        raise ValueError("固定20件外觀版本有重複，不可混淆revision。")
    return items


def stage_fixed20(project):
    """首次建立或重用QA快照；保留全部20個revision與Pending覆核模板。"""
    project = Path(project).resolve()
    rows = _input_rows(project)
    staging = project / _STAGE
    staging.mkdir(parents=True, exist_ok=True)
    state_path = staging / "stage.json"
    database = staging / "catalog.sqlite"
    plan_path = staging / "plan.json"
    if state_path.exists():
        state = _json(state_path)
        plan = _json(plan_path)
        if (state.get("schemaVersion") != 1 or state.get("itemCount") != 20
                or state.get("snapshotId") != plan.get("snapshotId") or not database.is_file()):
            raise ValueError("現有Gate3 staging不完整，禁止覆蓋。")
        if [(i["part"], i["colour"], i["metadata"]["sha256"]) for i in plan["items"]] != [
                (r["sourcePart"], r["colour"], r["metadataSha256"]) for r in rows]:
            raise ValueError("Gate2來源改變，必須經審核後建立合法後繼版本。")
    else:
        if database.exists() or plan_path.exists():
            raise ValueError("發現沒有交接索引的資料庫，禁止重新建立或覆寫。")
        with CatalogRepository(database, workspace=project) as repo:
            snapshot = repo.create_snapshot("2026-10-19T00:00:00Z",
                                            {"fixture": True, "purpose": "Gate3Fixed20QAOnly"})
            plan_items = []
            for row in rows:
                part = repo.add_part("內部QA " + row["sourcePart"], row["family"],
                                     "Gate3Internal:" + row["sourcePart"])
                variant = repo.add_variant(part, {"color": row["colour"]})
                repo.put_entry(snapshot, variant, [],
                               {"tier": "Basic", "reason": "InternalQualityStaging"},
                               {"fixture": True, "sourcePart": row["sourcePart"], "colour": row["colour"]})
                plan_items.append({"variantId": variant, "part": row["sourcePart"],
                                   "colour": row["colour"],
                                   "metadata": {"path": row["metadataPath"],
                                                "sha256": row["metadataSha256"]}})
            repo.freeze(snapshot, repo.snapshot(snapshot)["version"])
            version = repo.snapshot(snapshot)["version"]
        plan = {"schemaVersion": 1, "snapshotId": snapshot, "snapshotVersion": version,
                "library": "artifacts/sources/ldraw-release/ldraw",
                "importer": "artifacts/toolchain/ImportLDraw", "items": plan_items}
        plan_path.write_text(json.dumps(plan, indent=2, ensure_ascii=False), encoding="utf-8")
        state_path.write_text(json.dumps({"schemaVersion": 1, "snapshotId": snapshot,
                                          "itemCount": 20}, indent=2), encoding="utf-8")

    # 已建立的QA直接重驗原revision；不因品質提交後選件版本增加而重新製作模型。
    baseline_summary = staging / "summary.json"
    if baseline_summary.is_file():
        original = _json(baseline_summary)
        if original.get("snapshotId") != plan["snapshotId"] or len(original.get("items", [])) != 20:
            raise ValueError("既有QA摘要不完整，禁止覆寫。")
        reused = []
        with CatalogRepository(database, workspace=project, read_only=True) as repo:
            for subject, planned in zip(original["items"], plan["items"]):
                row = repo.connection.execute("SELECT * FROM model_revisions WHERE revision_id=?",
                                              (subject["revisionId"],)).fetchone()
                if row is None or row["variant_id"] != planned["variantId"]:
                    raise ValueError("原QA摘要與實際revision不符。")
                reused.append({"variantId": row["variant_id"], "revisionId": row["revision_id"], "status": row["status"]})
        built = {"jobStatus": "Completed", "revisions": reused}
    else:
        built = build_catalog(project, database, plan["snapshotId"],
                              "gate3-fixed20-catalog-v1", plan_path.relative_to(project).as_posix())
    if built.get("jobStatus") != "Completed" or len(built.get("revisions", [])) != 20:
        raise ValueError("固定20件Catalog建置未完成，保留staging供後續恢復。")
    review_dir = staging / "reviews"
    review_dir.mkdir(exist_ok=True)
    inventory = []
    with CatalogRepository(database, workspace=project) as repo:
        for index, (source, result) in enumerate(zip(rows, built["revisions"]), start=1):
            if result["status"] not in {"Validating", "Ready"} or result["variantId"] != plan["items"][index - 1]["variantId"]:
                raise ValueError("Catalog結果不符合QA修訂狀態。")
            revision = repo.connection.execute(
                "SELECT * FROM model_revisions WHERE revision_id=?", (result["revisionId"],)).fetchone()
            if revision is None:
                raise ValueError("品質覆核無法取得真實修訂紀錄。")
            if result["status"] == "Ready" and not verify_persisted_quality(project, dict(revision)):
                raise ValueError("已核准QA的封存品質報告失效。")
            review = quality_review_template(project, dict(revision),
                                             json.loads(revision["manifest_json"]))
            name = f"{index:02d}-{Path(source['sourcePart']).stem}.json"
            path = review_dir / name
            if path.is_file():
                saved = _json(path)
                for key in ("revisionId", "variantId", "modelSha256", "sourceSha256s"):
                    if saved.get(key) != review[key]:
                        raise ValueError("既有覆核模板與修訂版本不符，不得覆寫核准紀錄。")
            else:
                with path.open("x", encoding="utf-8") as file:
                    json.dump(review, file, ensure_ascii=False, indent=2)
            inventory.append({"sourcePart": source["sourcePart"], "colour": source["colour"],
                              "revisionId": result["revisionId"], "status": result["status"],
                              "reviewFile": (_STAGE + "/reviews/" + name)})
        if repo.head()["snapshot_id"] is not None:
            raise ValueError("內部QA資料不得改變正式Published head。")
    summary = {"schemaVersion": 1, "purpose": "Gate3 fixed20 QA-only, not a formal release",
               "snapshotId": plan["snapshotId"], "itemCount": 20, "gate2ReadyCount": 20,
               "validatingCount": sum(i["status"] == "Validating" for i in inventory),
               "readyCount": sum(i["status"] == "Ready" for i in inventory),
               "pendingReviewCount": sum(item["status"] == "Validating" and all(v["decision"] == "Pending" for v in
                     _json(project / item["reviewFile"])["reviews"].values()) for item in inventory),
               "items": inventory}
    # summary是人工核准聲明所綁定的原始基線，永久保留；當前狀態另存。
    if not baseline_summary.exists():
        with baseline_summary.open("x", encoding="utf-8") as stream:
            json.dump(summary, stream, ensure_ascii=False, indent=2)
    (staging / "current-status.json").write_text(json.dumps(summary, indent=2, ensure_ascii=False),
                                               encoding="utf-8")
    return summary
