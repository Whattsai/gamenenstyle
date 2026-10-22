"""Gate 2 固定20件：在不修改舊 revision 的前提下補齊 preview 驗收證據。"""

import hashlib
import html
import json
from pathlib import Path
import shutil
import subprocess

from PIL import Image, ImageStat

from tools.acceptance.audit_internal_model_set import MODEL_DIRS
from tools.catalog.content import ContentPathPolicy, ObjectStore
from tools.catalog.policies import digest
from tools.catalog.repository import CatalogRepository


PROJECT = Path(__file__).resolve().parents[4]
OUTPUT = PROJECT / "artifacts/acceptance/gate2-fixed20-preview-completion"
RENDER_SCRIPT = PROJECT / "tools/catalog/render_views.py"
PREVIEW_BUDGET_BYTES = 256 * 1024
EXPECTED_MISSING_ARCHIVE_PREVIEWS = {
    "3001-red-exploratory-v1",
    "pm-20260923-plate-3020",
    "pm-20260923-transparent-color47",
    "pm-20260923-printed-torso-973p06-color4",
    "pm-20260923-technic-pin-2780",
    "pm-20260923-technic-axle-3705",
    "pm-20260923-duplo-3437",
    "pm-20260923-asymmetric-slope-3298-materials-v2",
}


def _sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def _slug(folder):
    return folder.replace("/", "__")


def _fingerprint_tree(root):
    return {
        path.relative_to(root).as_posix(): _sha(path)
        for path in sorted(root.rglob("*"))
        if path.is_file()
    }


def _validate_preview(path, expected_sha=None):
    data = path.read_bytes()
    digest = hashlib.sha256(data).hexdigest()
    if expected_sha is not None:
        assert digest == expected_sha
    assert len(data) <= PREVIEW_BUDGET_BYTES
    with Image.open(path) as picture:
        assert picture.size == (384, 384)
        assert picture.mode == "RGBA"
        alpha = picture.getchannel("A")
        assert 5000 < sum(alpha.histogram()[1:]) < 384 * 384 * .9
        assert max(ImageStat.Stat(picture.convert("RGB"), mask=alpha).stddev) > 5
    return {"sha256": digest, "byteLength": len(data)}


def _render_missing_preview(folder, model, model_sha, script_sha):
    evidence = OUTPUT / "rendered" / f"{_slug(folder)}-{model_sha[:12]}-{script_sha[:8]}"
    report_path = evidence / "six-views.json"
    if not report_path.is_file():
        assert not evidence.exists(), f"不完整 preview evidence 不可覆寫：{evidence}"
        blender = shutil.which("blender")
        assert blender, "缺少 Blender，無法產生 Gate 2 preview evidence。"
        result = subprocess.run([
            blender,
            "--background",
            "--factory-startup",
            "--disable-autoexec",
            "--python-exit-code",
            "4",
            "--python",
            str(RENDER_SCRIPT),
            "--",
            "--model",
            str(model),
            "--output",
            str(evidence),
        ], capture_output=True, timeout=240)
        assert result.returncode == 0, result.stdout.decode("utf-8", errors="replace")[-3000:]

    report = json.loads(report_path.read_text(encoding="utf-8"))
    assert report["modelSha256"] == model_sha
    assert report["visualApproved"] is False
    assert set(report["views"]) == {"front", "back", "left", "right", "top", "bottom"}
    preview = report["preview"]
    preview_path = evidence / preview["file"]
    checked = _validate_preview(preview_path, preview["sha256"])
    assert checked["byteLength"] == preview["byteLength"]
    return evidence, checked


def _archive_successor_revisions(script_sha, items):
    successor_items = [item for item in items if item["source"] == "acceptance-evidence"]
    identity = digest({
        "schemaVersion": 1,
        "kind": "gate2-preview-successor-v2",
        "renderScriptSha256": script_sha,
        "items": [
            {
                "folder": item["folder"],
                "modelSha256": item["modelSha256"],
                "previewSha256": item["sha256"],
            }
            for item in successor_items
        ],
    })
    archive = OUTPUT / "successor-archive" / identity[:24]
    summary_path = archive / "summary.json"

    if summary_path.is_file():
        summary = json.loads(summary_path.read_text(encoding="utf-8"))
        assert summary["identityDigest"] == identity
        assert summary["revisionCount"] == len(successor_items) == 8
        with CatalogRepository(archive / "catalog.sqlite", workspace=PROJECT) as repo:
            rows = repo.connection.execute("SELECT * FROM model_revisions ORDER BY rowid").fetchall()
            assert len(rows) == 8
            assert all(row["status"] == "Validating" for row in rows)
            for row in rows:
                manifest = json.loads(row["manifest_json"])
                assert {file["name"] for file in manifest["files"]} == {
                    "model.glb", "six-views.json", "front.png", "back.png", "left.png",
                    "right.png", "top.png", "bottom.png", "preview.png",
                }
                for file in manifest["files"]:
                    data = ContentPathPolicy.read_verified(PROJECT, file["storageKey"], file["sha256"])
                    assert len(data) == file["byteLength"]
        return summary

    assert not archive.exists(), f"不完整 successor archive 不可覆寫：{archive}"
    archive.mkdir(parents=True)
    store = ObjectStore(archive / "store")
    revisions = []
    with CatalogRepository(archive / "catalog.sqlite", workspace=PROJECT) as repo:
        snapshot = repo.create_snapshot("2026-09-08T15:59:59Z", {
            "purpose": "Gate 2 preview successor acceptance only",
            "readyAsset": False,
        })
        variants = {}
        for item in successor_items:
            part = repo.add_part(item["folder"], "Gate2Preview", "legacy-model:" + item["modelSha256"])
            variant = repo.add_variant(part, {"color": "legacy"})
            repo.put_entry(snapshot, variant, "Unknown", [], {}, {
                "fixture": True,
                "legacyFolder": item["folder"],
                "readyAsset": False,
            })
            variants[item["folder"]] = variant
        repo.freeze(snapshot, repo.snapshot(snapshot)["version"])

        for item in successor_items:
            folder = item["folder"]
            variant = variants[folder]
            input_digest = digest({
                "schemaVersion": 1,
                "kind": "gate2-preview-successor-v2",
                "legacyFolder": folder,
                "modelSha256": item["modelSha256"],
                "previewSha256": item["sha256"],
                "renderScriptSha256": script_sha,
            })
            revision = repo.start_revision(variant, input_digest, {
                "kind": "gate2-preview-successor-v2",
                "renderScriptSha256": script_sha,
            })
            repo.transition_revision(revision, "Building")

            model = PROJECT / "artifacts/models" / folder / "model.glb"
            evidence = PROJECT / Path(item["previewPath"]).parent
            view_report = json.loads((evidence / "six-views.json").read_text(encoding="utf-8"))
            assert view_report["modelSha256"] == item["modelSha256"]
            archive_files = [("model.glb", model), ("six-views.json", evidence / "six-views.json")]
            archive_files.extend((record["file"], evidence / record["file"]) for record in view_report["views"].values())
            archive_files.append(("preview.png", evidence / view_report["preview"]["file"]))
            assert {name for name, _ in archive_files} == {
                "model.glb", "six-views.json", "front.png", "back.png", "left.png",
                "right.png", "top.png", "bottom.png", "preview.png",
            }

            files = []
            for name, path in archive_files:
                saved = store.put(path.read_bytes())
                storage_key = (archive / "store" / saved["storage_key"]).relative_to(PROJECT).as_posix()
                files.append({
                    "name": name,
                    "sha256": saved["sha256"],
                    "byteLength": saved["byte_length"],
                    "storageKey": storage_key,
                })

            manifest = {
                "schemaVersion": 1,
                "variantId": variant,
                "revisionId": revision,
                "inputDigest": input_digest,
                "archiveKind": "gate2-preview-successor-v2",
                "predecessorArtifact": {
                    "folder": folder,
                    "modelSha256": item["modelSha256"],
                },
                "toolchain": {"renderScriptSha256": script_sha},
                "files": files,
            }
            validation = {
                "quality_passed": False,
                "provenance_passed": False,
                "visualApproved": False,
                "remainingChecks": ["ReadyQuality", "FormalVisualBaseline"],
            }
            repo.transition_revision(revision, "Validating", report=validation, manifest=manifest)
            revisions.append({
                "folder": folder,
                "variantId": variant,
                "revisionId": revision,
                "inputDigest": input_digest,
                "status": "Validating",
                "modelSha256": item["modelSha256"],
                "previewSha256": item["sha256"],
                "manifest": manifest,
            })

        assert repo.connection.execute("SELECT count(*) FROM model_revisions WHERE status='Validating'").fetchone()[0] == 8
        assert repo.connection.execute("SELECT count(*) FROM snapshot_entries WHERE selected_revision_id IS NOT NULL").fetchone()[0] == 0

    summary = {
        "schemaVersion": 1,
        "purpose": "Gate 2 fixed8 immutable successor revision/archive evidence",
        "identityDigest": identity,
        "snapshotStatus": "Frozen",
        "revisionCount": len(revisions),
        "validatingCount": len(revisions),
        "selectedRevisionCount": 0,
        "readyCount": 0,
        "productionActiveCount": 0,
        "visualApproved": False,
        "revisions": revisions,
    }
    summary_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    return summary


def test_gate2_fixed20_preview_evidence_reaches_20_without_mutating_old_revisions():
    script_sha = _sha(RENDER_SCRIPT)
    legacy_before = {
        folder: _fingerprint_tree(PROJECT / "artifacts/models" / folder)
        for folder in EXPECTED_MISSING_ARCHIVE_PREVIEWS
    }
    archived = []
    missing = []
    for folder in MODEL_DIRS:
        model_dir = PROJECT / "artifacts/models" / folder
        model = model_dir / "model.glb"
        assert model.is_file(), folder
        archived_preview = model_dir / "views/preview.png"
        if archived_preview.is_file():
            archived.append(folder)
        else:
            missing.append(folder)

    assert len(MODEL_DIRS) == 20
    assert len(archived) == 12
    assert set(missing) == EXPECTED_MISSING_ARCHIVE_PREVIEWS

    OUTPUT.mkdir(parents=True, exist_ok=True)
    items = []
    for folder in MODEL_DIRS:
        model_dir = PROJECT / "artifacts/models" / folder
        model = model_dir / "model.glb"
        model_sha = _sha(model)
        archived_preview = model_dir / "views/preview.png"
        if archived_preview.is_file():
            checked = _validate_preview(archived_preview)
            items.append({
                "folder": folder,
                "modelSha256": model_sha,
                "source": "archived-revision",
                "previewPath": archived_preview.relative_to(PROJECT).as_posix(),
                **checked,
            })
            continue

        evidence, checked = _render_missing_preview(folder, model, model_sha, script_sha)
        items.append({
            "folder": folder,
            "modelSha256": model_sha,
            "source": "acceptance-evidence",
            "previewPath": (evidence / "preview.png").relative_to(PROJECT).as_posix(),
            **checked,
        })

    assert len(items) == 20
    assert sum(item["source"] == "archived-revision" for item in items) == 12
    assert sum(item["source"] == "acceptance-evidence" for item in items) == 8
    assert all(item["byteLength"] <= PREVIEW_BUDGET_BYTES for item in items)

    successor = _archive_successor_revisions(script_sha, items)
    assert successor["revisionCount"] == 8
    assert successor["validatingCount"] == 8
    assert successor["selectedRevisionCount"] == 0
    assert successor["readyCount"] == 0
    assert successor["productionActiveCount"] == 0
    assert successor["visualApproved"] is False

    summary = {
        "schemaVersion": 1,
        "purpose": "Gate 2 fixed20 preview acceptance evidence without mutating old revisions",
        "renderScriptSha256": script_sha,
        "fixedModelCount": 20,
        "archivedPreviewCount": 12,
        "generatedAcceptancePreviewCount": 8,
        "acceptancePreviewCount": 20,
        "archivePreviewCount": 12,
        "successorArchiveRevisionCount": successor["revisionCount"],
        "successorArchiveIdentityDigest": successor["identityDigest"],
        "previewBudgetBytes": PREVIEW_BUDGET_BYTES,
        "visualApproved": False,
        "items": items,
    }
    (OUTPUT / "summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")

    new_items = [item for item in items if item["source"] == "acceptance-evidence"]
    cards = []
    for item in new_items:
        relative = Path(item["previewPath"]).relative_to("artifacts/acceptance/gate2-fixed20-preview-completion")
        cards.append(
            "<article><h2>" + html.escape(item["folder"]) + "</h2>"
            + '<img loading="lazy" src="' + html.escape(relative.as_posix()) + '" alt="preview">'
            + "<p>GLB SHA-256: <code>" + html.escape(item["modelSha256"]) + "</code></p>"
            + "<p>preview: " + str(item["byteLength"]) + " bytes / 262144 bytes</p></article>"
        )
    page = """<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8">
<title>Gate 2 fixed20 preview completion</title><style>
body{font-family:system-ui,sans-serif;margin:24px;background:#f4f5f7;color:#171717}
header{max-width:1100px;margin:auto auto 20px}main{max-width:1100px;margin:auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px}
article{background:white;border:1px solid #d8dbe0;border-radius:12px;padding:14px}img{width:100%;aspect-ratio:1;object-fit:contain;background:#e9ebef;border-radius:8px}
h1{margin-bottom:8px}h2{font-size:16px;word-break:break-all}p{font-size:13px;word-break:break-all}code{font-size:11px}.note{background:#fff7d6;border:1px solid #e8d47a;padding:12px;border-radius:8px}
</style></head><body><header><h1>Gate 2：原 8 件缺少 preview 的實際渲染檢視</h1>
<p class="note">這些圖片由既有固定 GLB 經相同 render_views.py 產生；原 8 件舊資料夾未修改，並另建立 8 個 status=Validating 的不可變 successor revision/archive。visualApproved、Ready、Active 均未升格。</p>
<p>驗證狀態：8/8 successor archive 已建立；加上既有 archive preview 12/12，Gate 2 preview evidence 為 20/20。每張 preview 必須 ≤256 KiB。</p></header><main>""" + "".join(cards) + "</main></body></html>"
    (OUTPUT / "manual-visual-review.html").write_text(page, encoding="utf-8")

    assert (OUTPUT / "manual-visual-review.html").is_file()
    legacy_after = {
        folder: _fingerprint_tree(PROJECT / "artifacts/models" / folder)
        for folder in EXPECTED_MISSING_ARCHIVE_PREVIEWS
    }
    assert legacy_after == legacy_before
