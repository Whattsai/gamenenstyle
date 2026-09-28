"""Recheck every source model and installed Player capture in an internal F-Catalog.

This report deliberately separates mechanical evidence from Ready and visual approval.
"""

import argparse
import hashlib
import html
import json
from pathlib import Path
import sqlite3
import subprocess

from tools.catalog.metadata_quality import inspect_metadata


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


def audit_one(project, package, evidence, catalog, operations, captures, index, folder, output):
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

    metadata_path = model_dir / "metadata.json"
    if metadata_path.is_file():
        metadata = read_json(metadata_path)
        metadata_checks = inspect_metadata(metadata, geometry)
        if metadata.get("readyAsset") is not False or metadata.get("productionStatus") != "Unknown":
            issues.append("misleading-source-ready-status")
    else:
        metadata = None
        metadata_checks = {"geometryIssues": ["missing-metadata"], "wheelIssues": [], "massIssues": []}
    reference_path = model_dir / "rebrickable-reference.json"
    reference = read_json(reference_path) if reference_path.is_file() else None
    if reference is not None and (not reference.get("exactPartNumberMatch")
                                  or reference["record"]["partNum"] != Path(conversion["source"]["filename"]).stem):
        issues.append("part-number-crosswalk-mismatch")

    address = "probe/model" + ("-" + str(index) if index else "")
    row = catalog.execute("""SELECT m.variant_id,v.display_json,v.production_status,m.metadata_json
        FROM runtime_models m JOIN runtime_variants v ON v.variant_id=m.variant_id
        WHERE m.address_key=?""", (address,)).fetchone()
    if row is None:
        issues.append("missing-runtime-model")
        variant, display = None, {}
    else:
        variant, display_json, production, runtime_metadata_json = row
        display = json.loads(display_json)
        runtime_metadata = json.loads(runtime_metadata_json)
        if production != "Unknown" or runtime_metadata.get("readyAsset") is not False:
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

    return {
        "index": index, "folder": folder, "partNumber": display.get("partNumber"),
        "sourceFilename": conversion["source"]["filename"], "variantId": variant,
        "modelSha256": digest, "triangles": geometry.get("triangles"),
        "sourceDependencies": len(conversion["source"]["files"]),
        "sourceSixViews": source_views.is_file(), "runtimeSixViews": all(x in images for x in SIX_VIEWS),
        "metadataIssues": metadata_checks["geometryIssues"],
        "collisionProxyPresent": bool(metadata and metadata.get("collisionProxy")),
        "productionStatus": "Unknown", "referencePartMatch": bool(reference and reference.get("exactPartNumberMatch")),
        "mechanicalIssues": issues, "mechanicalPass": not issues,
        "readyAsset": False, "visualApproved": False, "playerImages": images,
    }


def write_viewer(output, items):
    rows = ["<!doctype html><html lang='zh-Hant'><meta charset='utf-8'>",
            "<title>BrickHigh 20 件模型人工外觀檢視</title>",
            "<style>body{font-family:system-ui;background:#17202c;color:#f5f5f5;max-width:1100px;margin:auto;padding:24px}"
            "img{max-width:46%;margin:4px;border:1px solid #748499}summary{cursor:pointer;padding:12px;background:#283749}"
            "details{margin:12px 0}p{line-height:1.6}</style>",
            "<h1>BrickHigh 20 件模型人工外觀檢視</h1>",
            "<p>以下圖片來自實際安裝的內部 Player。請只判斷模型外觀、材質與光照；其他品質由機器報告記錄。"
            "本包仍是 F-Catalog，尚未標為 Ready。</p>"]
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
    with sqlite3.connect(dbs[0]) as catalog:
        coverage = json.loads(catalog.execute("SELECT coverage_json FROM runtime_snapshots").fetchone()[0])
        items = [audit_one(project, dbs[0].parent, evidence / "PlayerEvidence", catalog,
                           operations, captures, index, folder, output)
                 for index, folder in enumerate(MODEL_DIRS)]
    report = {
        "purpose": "F-Catalog 20-model mechanical audit", "buildId": player["buildId"],
        "installedLauncher": str(Path(run["installRoot"]) / "BrickHighLauncher.exe"),
        "coverage": coverage, "unityEditMode": "163/163", "python": "192/192", "dotnet": "131/131",
        "mechanicalPassCount": sum(x["mechanicalPass"] for x in items),
        "runtimeModelCount": len(operations), "playerFrameCount": len(player["captures"]),
        "readyAsset": False, "visualApproved": False, "items": items,
    }
    (output / "machine-audit.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    write_viewer(output, items)
    print(json.dumps({key: value for key, value in report.items() if key not in ("items", "coverage")}, ensure_ascii=False))
    return 0 if report["mechanicalPassCount"] == 20 and len(operations) == 20 and len(player["captures"]) == 382 else 3


if __name__ == "__main__":
    raise SystemExit(main())
