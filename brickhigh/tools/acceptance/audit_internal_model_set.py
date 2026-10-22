"""Recheck every source model and installed Player capture in an internal F-Catalog.

This report deliberately separates mechanical evidence from Ready and visual approval.
"""

import argparse
import csv
import gzip
import hashlib
import html
import json
from pathlib import Path
import sqlite3
import subprocess

from tools.catalog.building import merge_source_reference_metadata
from tools.catalog.metadata_quality import inspect_metadata
from tools.catalog.policies import CatalogError
from tools.catalog.sources import inspect_ldraw


MODEL_DIRS = (
    "3001-red-exploratory-v1",
    "pm-20260923-plate-3020",
    "pm-20260923-transparent-color47",
    "pm-20260923-printed-torso-973p06-color4",
    "pm-20260923-technic-pin-2780",
    "pm-20260923-technic-axle-3705",
    "pm-20260923-duplo-3437",
    "pm-20260923-asymmetric-slope-3298-materials-v2",
    "pm-20260927-expansion-v1/3700-colour7",
    "pm-20260927-expansion-v1/4032a-colour4",
    "pm-20260927-expansion-v1/3069b-colour14",
    "pm-20260927-expansion-v1/4085c-colour7",
    "pm-20260927-expansion-v1/30374-colour4",
    "pm-20260927-expansion-v1/14417-colour7",
    "pm-20260927-expansion-v1/14418-colour7",
    "pm-20260927-expansion-v1/11211-colour4",
    "pm-20260927-expansion-v1/2456-colour14",
    "pm-20260927-expansion-v1/6060-colour4",
    "pm-20260927-expansion-v1/3005-colour14",
    "pm-20260927-expansion-v1/6141-colour4",
)
SIX_VIEWS = ("front", "right", "back", "left", "top", "bottom")


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load_exact_part_records(project):
    """只核對封存 dataset 的 exact part identity。"""
    root = project / "artifacts/sources/rebrickable-20260927"
    manifest_path = root / "download-manifest.json"
    manifest = read_json(manifest_path)
    dataset = next(item for item in manifest["datasets"] if item["name"] == "parts.csv.gz")
    path = root / dataset["name"]
    if sha(path) != dataset["sha256"]:
        raise ValueError("Pinned Rebrickable identity dataset is not trustworthy for this audit")
    with gzip.open(path, "rt", encoding="utf-8-sig", newline="") as stream:
        return {row["part_num"]: row for row in csv.DictReader(stream)}


def source_reference_matches_geometry(reference, geometry):
    if not reference or not isinstance(geometry, dict):
        return False
    expected = reference.get("dimensionsMeters")
    bounds = geometry.get("boundsMeters")
    if not isinstance(expected, list) or len(expected) != 3 or not isinstance(bounds, dict):
        return False
    try:
        actual = [high - low for low, high in zip(bounds["min"], bounds["max"])]
    except (KeyError, TypeError):
        return False
    tolerances = [max(.0001, .005 * value) + 1e-12 for value in expected]
    return all(abs(source - built) <= tolerance for source, built, tolerance in zip(expected, actual, tolerances))


def audit_one(project, package, evidence, catalog, operations, captures, index, folder, output, part_records):
    model_dir = project / "artifacts/models" / folder
    conversion = read_json(model_dir / "conversion.json")
    model = model_dir / "model.glb"
    digest = sha(model)
    source_evidence = read_json(package / "SourceEvidence" / f"{index}.json")
    issues = []
    if digest != conversion["geometry"]["sha256"] or digest != source_evidence["geometry"]["sha256"]:
        issues.append("model-hash-mismatch")
    if conversion["source"]["filename"] != source_evidence["source"]["filename"]:
        issues.append("source-identity-mismatch")
    geometry = conversion["geometry"]
    if any(geometry.get(key, 0) <= 0 for key in ("meshCount", "triangles", "materialCount")):
        issues.append("empty-geometry-or-material")

    source_archive = model_dir / "sources"
    for source in conversion["source"]["files"]:
        path = ((source_archive if source_archive.is_dir() else project / "artifacts/sources/ldraw-release/ldraw")
                / source["path"])
        if not path.is_file() or sha(path) != source["sha256"] or not source.get("license"):
            issues.append("source-dependency-or-license:" + source["path"])

    validator_output = output / "validator" / f"{index:02d}.json"
    validator = subprocess.run(["node", str(project / "tools/catalog/validate_glb.cjs"), str(model),
                                str(validator_output)], cwd=project, capture_output=True, text=True, check=False)
    if validator.returncode or not validator_output.is_file():
        issues.append("fresh-khronos-validation-failed")
    else:
        report = read_json(validator_output)
        if (report["modelSha256"] != digest or report["issues"]["numErrors"] != 0
                or report["issues"]["numWarnings"] != 0):
            issues.append("fresh-khronos-report-not-clean")

    source_views = model_dir / "views/six-views.json"
    if source_views.is_file():
        view_manifest = read_json(source_views)
        if view_manifest.get("modelSha256") != digest:
            issues.append("source-six-views-model-hash")
        for direction in SIX_VIEWS:
            entry = view_manifest.get("views", {}).get(direction, {})
            path = source_views.parent / entry.get("file", "")
            if not path.is_file() or sha(path) != entry.get("sha256"):
                issues.append("source-six-view:" + direction)

    source_root = source_archive if source_archive.is_dir() else project / "artifacts/sources/ldraw-release/ldraw"
    try:
        source_manifest = inspect_ldraw(source_root, conversion["source"]["filename"])
        source_reference = source_manifest["referenceGeometry"]
        archived_dependencies = {(item["path"], item["sha256"]) for item in conversion["source"]["files"]}
        inspected_dependencies = {(item["path"], item["sha256"]) for item in source_manifest["files"]}
        source_dependencies_match = inspected_dependencies == archived_dependencies
        source_reference_verified = source_dependencies_match and source_reference_matches_geometry(source_reference, geometry)
        connector_candidates = source_manifest.get("connectorCandidates", [])
    except (CatalogError, OSError, UnicodeError, KeyError):
        source_manifest = None
        source_reference = None
        source_dependencies_match = False
        source_reference_verified = False
        connector_candidates = []

    metadata_path = model_dir / "metadata.json"
    reference_matches_source = False
    if metadata_path.is_file():
        metadata = read_json(metadata_path)
        metadata_checks = inspect_metadata(metadata, geometry)
        if metadata.get("readyAsset") is not False:
            issues.append("misleading-source-ready-status")
        if source_manifest is not None:
            try:
                merge_source_reference_metadata(metadata, source_manifest)
                reference_matches_source = metadata.get("referenceDimensions") is not None
            except CatalogError:
                reference_matches_source = False
    else:
        metadata = None
        metadata_checks = {"geometryIssues": ["missing-metadata"], "wheelIssues": [], "massIssues": []}
    source_part_number = Path(conversion["source"]["filename"]).stem
    exact_part_record = part_records.get(source_part_number)
    part_crosswalk_match = exact_part_record is not None
    reference_path = model_dir / "rebrickable-reference.json"
    reference = read_json(reference_path) if reference_path.is_file() else None
    if reference is not None and (not reference.get("exactPartNumberMatch")
                                  or reference["record"]["partNum"] != source_part_number):
        issues.append("part-number-crosswalk-mismatch")
    if reference is not None and part_crosswalk_match and reference["record"]["partNum"] != exact_part_record["part_num"]:
        issues.append("pinned-part-crosswalk-conflict")

    address = "probe/model" + ("-" + str(index) if index else "")
    row = catalog.execute("""SELECT m.variant_id,v.display_json,m.metadata_json
        FROM runtime_models m JOIN runtime_variants v ON v.variant_id=m.variant_id
        WHERE m.address_key=?""", (address,)).fetchone()
    if row is None:
        issues.append("missing-runtime-model")
        variant, display = None, {}
    else:
        variant, display_json, runtime_metadata_json = row
        display = json.loads(display_json)
        runtime_metadata = json.loads(runtime_metadata_json)
        if runtime_metadata.get("readyAsset") is not False:
            issues.append("misleading-runtime-ready-status")
        if display.get("partNumber") != Path(conversion["source"]["filename"]).stem:
            issues.append("runtime-part-number-mismatch")

    operation = operations.get(variant)
    if operation is None or not all(operation.get(key) is True for key in
                                    ("modelLoaded", "sixViews", "orbitZoomReset")):
        issues.append("player-operation-failed")
    images = {}
    for capture in captures.get(variant, []):
        path = evidence / capture["file"]
        if not path.is_file() or path.stat().st_size < 1000 or path.read_bytes()[:8] != b"\x89PNG\r\n\x1a\n":
            issues.append("player-frame-invalid:" + capture["view"])
        images[capture["view"]] = capture["file"]
    for direction in ("initial",) + SIX_VIEWS + tuple("orbit-" + str(i) for i in range(12)):
        if direction not in images:
            issues.append("missing-player-view:" + direction)

    gate2_issues = list(metadata_checks["geometryIssues"])
    if source_reference_verified:
        # 舊 exploratory metadata 的 null reference 不代表來源尺寸仍未知；真正 Ready revision 仍必須封存它。
        gate2_issues = [issue for issue in gate2_issues if issue != "invalid-reference-dimensions"]
    if not source_reference_verified:
        gate2_issues.append("source-reference-dimensions-unverified")
    elif metadata is None or metadata.get("referenceDimensions") is None:
        gate2_issues.append("source-reference-dimensions-not-sealed-in-metadata")
    elif not reference_matches_source:
        gate2_issues.append("source-reference-dimensions-conflict")
    if not part_crosswalk_match:
        gate2_issues.append("source-part-crosswalk-unverified")
    gate2_issues = list(dict.fromkeys(gate2_issues))

    return {
        "index": index, "folder": folder, "partNumber": display.get("partNumber"),
        "sourceFilename": conversion["source"]["filename"], "variantId": variant,
        "modelSha256": digest, "triangles": geometry.get("triangles"),
        "sourceDependencies": len(conversion["source"]["files"]),
        "sourceSixViews": source_views.is_file(), "runtimeSixViews": all(x in images for x in SIX_VIEWS),
        "metadataIssues": metadata_checks["geometryIssues"],
        "sourceReferenceDimensions": source_reference.get("dimensionsMeters") if source_reference else None,
        "sourceReferenceDependencyDigest": source_reference.get("dependencyDigest") if source_reference else None,
        "sourceReferenceDimensionsVerified": source_reference_verified,
        "sourceDependenciesMatchArchivedConversion": source_dependencies_match,
        "referenceDimensionsRecorded": metadata.get("referenceDimensions") if metadata else None,
        "referenceDimensionsMatchSource": reference_matches_source,
        "connectorCandidateCount": len(connector_candidates),
        "connectorCandidateProfiles": sorted({item["profile"] for item in connector_candidates}),
        "formalConnectorEvidence": False,
        "collisionProxyPresent": bool(metadata and metadata.get("collisionProxy")),
        "referencePartMatch": part_crosswalk_match,
        "referencePartRecord": exact_part_record,
        "mechanicalIssues": issues, "mechanicalPass": not issues,
        "gate2Issues": gate2_issues, "gate2Ready": not gate2_issues,
        "readyAsset": False, "visualApproved": False, "playerImages": images,
    }


def write_viewer(output, items):
    rows = ["<!doctype html><html lang='zh-Hant'><meta charset='utf-8'>",
            "<title>BrickHigh 20 件模型 Gate 1 / Gate 2 驗證</title>",
            "<style>body{font-family:system-ui;background:#17202c;color:#f5f5f5;max-width:1100px;margin:auto;padding:24px}"
            "img{max-width:46%;margin:4px;border:1px solid #748499}summary{cursor:pointer;padding:12px;background:#283749}"
            "details{margin:12px 0}p{line-height:1.6}table{width:100%;border-collapse:collapse;margin:18px 0}"
            "th,td{border:1px solid #526273;padding:8px;text-align:left;vertical-align:top}.ok{color:#75e6a4}.blocked{color:#ffb36b}"
            "code{white-space:normal}</style>",
            "<h1>BrickHigh 20 件模型 Gate 1 / Gate 2 驗證</h1>",
            "<p><strong>Gate 1：</strong>使用者已確認本批 20 件的外觀方向，可繼續。這不等於正式 Ready visualBaselineId。"
            "<br><strong>Gate 2：</strong>下表只根據可重跑 metadata／來源契約判定；任一 blocker 存在都不得標 Ready。</p>",
            "<table><thead><tr><th>#</th><th>零件</th><th>Gate 1</th><th>來源尺寸</th><th>貨號</th><th>接點來源候選</th><th>Gate 2</th><th>Gate 2 blockers</th></tr></thead><tbody>"]
    for item in items:
        blockers = ", ".join(item["gate2Issues"]) if item["gate2Issues"] else "—"
        gate2 = "<span class='ok'>Ready</span>" if item["gate2Ready"] else "<span class='blocked'>Blocked</span>"
        source_dimensions = item.get("sourceReferenceDimensions")
        if source_dimensions and item.get("sourceReferenceDimensionsVerified"):
            dimension_label = " × ".join(f"{value * 1000:.2f}" for value in source_dimensions) + " mm"
            if item.get("referenceDimensionsMatchSource"):
                dimension_label += "（已封存）"
            else:
                dimension_label += "（來源已驗證，待新 revision 封存）"
        else:
            dimension_label = "缺來源尺寸證據"
        part_label = "exact" if item.get("referencePartMatch") else "待 alias/crosswalk"
        candidate_count = item.get("connectorCandidateCount", 0)
        candidate_label = (f"{candidate_count} 個：" + ", ".join(item.get("connectorCandidateProfiles", [])) + "（尚非正式）") if candidate_count else "—"
        rows.append("<tr>" +
                    f"<td>{item['index'] + 1:02d}</td>" +
                    f"<td>{html.escape(item['sourceFilename'])}</td>" +
                    "<td><span class='ok'>已確認方向</span></td>" +
                    f"<td>{html.escape(dimension_label)}</td>" +
                    f"<td>{html.escape(part_label)}</td>" +
                    f"<td>{html.escape(candidate_label)}</td>" +
                    f"<td>{gate2}</td><td><code>{html.escape(blockers)}</code></td></tr>")
    rows.append("</tbody></table><h2>實際 Player 畫面</h2>")
    for item in items:
        label = html.escape(f"{item['index'] + 1:02d}. {item['sourceFilename']} — {item['folder']}")
        rows.append(f"<details><summary>{label}</summary>")
        for direction in ("initial",) + SIX_VIEWS:
            path = item["playerImages"].get(direction)
            if path:
                rows.append(f"<figure><figcaption>{html.escape(direction)}</figcaption>"
                            f"<img src='PlayerEvidence/{html.escape(path)}'></figure>")
        rows.append("</details>")
    rows.append("</html>")
    (output / "manual-visual-review.html").write_text("\n".join(rows), encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project", type=Path, default=Path(__file__).resolve().parents[2])
    parser.add_argument("--package", type=Path, required=True)
    parser.add_argument("--evidence", type=Path, required=True)
    args = parser.parse_args()
    project, package, evidence = (x.resolve() for x in (args.project, args.package, args.evidence))
    dbs = list((package / "Player/BrickHighPreview_Data/StreamingAssets/Catalog").glob("*/catalog.db"))
    if len(dbs) != 1 or len(MODEL_DIRS) != 20:
        raise ValueError("Expected exactly one catalog.db and twenty model sources")
    output = evidence
    (output / "validator").mkdir(exist_ok=True)
    run = read_json(evidence / "run.json")
    player = read_json(evidence / "PlayerEvidence/result.json")
    if not player.get("success") or run.get("installExitCode") or run.get("launcherExitCode"):
        raise ValueError("Installed Player acceptance did not pass")
    operations = {x["variantId"]: x for x in player["operations"] if isinstance(x, dict)}
    captures = {}
    for capture in player["captures"]:
        captures.setdefault(capture.get("variantId"), []).append(capture)
    part_records = load_exact_part_records(project)
    with sqlite3.connect(dbs[0]) as catalog:
        coverage = json.loads(catalog.execute("SELECT coverage_json FROM runtime_snapshots").fetchone()[0])
        items = [audit_one(project, dbs[0].parent, evidence / "PlayerEvidence", catalog,
                           operations, captures, index, folder, output, part_records)
                 for index, folder in enumerate(MODEL_DIRS)]
    report = {
        "purpose": "F-Catalog 20-model mechanical audit", "buildId": player["buildId"],
        "installedLauncher": str(Path(run["installRoot"]) / "BrickHighLauncher.exe"),
        "coverage": coverage,
        "mechanicalPassCount": sum(x["mechanicalPass"] for x in items),
        "sourceReferenceDimensionCount": sum(x["sourceReferenceDimensions"] is not None for x in items),
        "sourceReferenceDimensionVerifiedCount": sum(x["sourceReferenceDimensionsVerified"] for x in items),
        "referenceDimensionRecordedCount": sum(x["referenceDimensionsMatchSource"] for x in items),
        "partCrosswalkExactCount": sum(x["referencePartMatch"] for x in items),
        "connectorCandidateModelCount": sum(x["connectorCandidateCount"] > 0 for x in items),
        "connectorCandidateCount": sum(x["connectorCandidateCount"] for x in items),
        "gate2ReadyCount": sum(x["gate2Ready"] for x in items),
        "runtimeModelCount": len(operations), "playerFrameCount": len(player["captures"]),
        "gate1VisualDirectionAccepted": True,
        "readyAsset": False, "visualApproved": False, "items": items,
    }
    (output / "machine-audit.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    write_viewer(output, items)
    print(json.dumps({key: value for key, value in report.items() if key not in ("items", "coverage")}, ensure_ascii=False))
    return 0 if report["mechanicalPassCount"] == 20 and len(operations) == 20 and len(player["captures"]) == 382 else 3


if __name__ == "__main__":
    raise SystemExit(main())
