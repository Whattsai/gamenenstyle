"""品質報告必須核對真實封存bytes，人工覆核模板保持Pending。"""

import hashlib
import json
import struct
import zlib

import pytest

from tools.catalog.content import ObjectStore
from tools.catalog.glb import inspect_glb
from tools.catalog.policies import GateNotMet, canonical_json
from tools.catalog.quality import complete_revision_quality, quality_review_template
from tools.catalog.repository import CatalogRepository
from tools.catalog.quality import verify_persisted_quality
from tools.catalog.cli import _validation


def triangle_glb():
    vertices = struct.pack("<9f", 0, 0, 0, .008, .0096, -.004, .008, 0, 0)
    binary = vertices + struct.pack("<3H", 0, 1, 2) + b"\0\0"
    document = {
        "asset": {"version": "2.0"}, "scene": 0, "scenes": [{"nodes": [0]}],
        "nodes": [{"mesh": 0}], "buffers": [{"byteLength": len(binary)}],
        "bufferViews": [{"buffer": 0, "byteOffset": 0, "byteLength": 36},
                       {"buffer": 0, "byteOffset": 36, "byteLength": 6}],
        "accessors": [{"bufferView": 0, "componentType": 5126, "count": 3, "type": "VEC3"},
                      {"bufferView": 1, "componentType": 5123, "count": 3, "type": "SCALAR"}],
        "meshes": [{"primitives": [{"attributes": {"POSITION": 0}, "indices": 1, "material": 0}]}],
        "materials": [{"pbrMetallicRoughness": {"baseColorFactor": [1, 0, 0, 1]}}],
    }
    text = json.dumps(document).encode()
    text += b" " * (-len(text) % 4)
    return (struct.pack("<III", 0x46546C67, 2, 12 + 8 + len(text) + 8 + len(binary))
            + struct.pack("<II", len(text), 0x4E4F534A) + text
            + struct.pack("<II", len(binary), 0x004E4942) + binary)


def png():
    def chunk(kind, body):
        return struct.pack(">I", len(body)) + kind + body + struct.pack(">I", zlib.crc32(kind + body) & 0xFFFFFFFF)
    return (b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", 1, 1, 8, 6, 0, 0, 0))
            + chunk(b"IDAT", zlib.compress(b"\x00\xff\x00\x00\xff")) + chunk(b"IEND", b""))


def catalog_fixture(workspace):
    revision = {"revision_id": "11111111-1111-4111-8111-111111111111",
                "variant_id": "22222222-2222-4222-8222-222222222222",
                "input_digest": "a" * 64, "status": "Validating"}
    store = ObjectStore(workspace / "artifacts" / "catalog")
    model = triangle_glb()
    geometry = inspect_glb(model)
    source_bytes = b"0 !Name: 3001.dat\n0 Author: Example\n0 !LICENSE CC BY 4.0\n"
    source_sha = hashlib.sha256(source_bytes).hexdigest()
    source_row = {"path": "parts/3001.dat", "author": "Example", "license": "CC BY 4.0",
                  "sha256": source_sha, "bytes": len(source_bytes),
                  "source": "https://library.ldraw.org/library/official/parts/3001.dat"}
    pictures = {name + ".png": png() for name in ("front", "back", "left", "right", "top", "bottom", "preview")}
    metadata = {"schemaVersion": 1, "coordinateProfile": "canonical-rh-metres-v1",
                "referenceDimensions": [.008, .0096, .004], "boundsMeters": geometry["boundsMeters"],
                "connectorsRequired": False, "connectors": [], "noConnectorsReason": "裝飾模型無接點"}
    conversion = {"schemaVersion": 1, "purpose": "GeometryProbe", "variantEvidencePending": True,
                  "productionStatus": "Unknown", "qualityPassed": False, "source": {"files": [source_row]},
                  "geometry": geometry, "importerWarnings": [], "materialComparisons": [],
                  "remainingChecks": ["SourceAppearance", "AttributionReview"]}
    attribution = {"schemaVersion": 1, "modelSha256": geometry["sha256"], "sources": [source_row],
                   "modifications": "LDraw至canonical GLB", "reviewed": False}
    views = {"schemaVersion": 1, "modelSha256": geometry["sha256"], "visualApproved": False,
             "profile": {"id": "catalog-six-views-v1", "coordinateProfile": "canonical-rh-metres-v1",
                         "engine": "CYCLES", "device": "CPU", "samples": 16, "seed": 0,
                         "denoising": True, "resolution": [384, 384], "viewTransform": "Standard",
                         "worldStrength": .65, "scriptSha256": "e" * 64}, "views": {}, "preview": {}}
    records = {}
    for name, data in {
        "model.glb": model,
        "metadata.json": canonical_json(metadata).encode(),
        "conversion.json": canonical_json(conversion).encode(),
        "khronos-report.json": canonical_json({"modelSha256": geometry["sha256"],
            "modelByteLength": len(model), "validatorVersion": "2.0.0-dev.3.10",
            "mimeType": "model/gltf-binary", "issues": {"truncated": False, "numErrors": 0,
            "numWarnings": 0, "messages": []}}).encode(),
        "attribution.json": canonical_json(attribution).encode(),
        "sources/parts/3001.dat": source_bytes,
        "sources/LDConfig.ldr": b"0 !LDRAW_ORG Configuration",
        **pictures,
    }.items():
        saved = store.put(data)
        records[name] = {"name": name, "sha256": saved["sha256"], "byteLength": len(data),
                         "storageKey": "artifacts/catalog/" + saved["storage_key"]}
    directions = {"front": [0, 0, 1], "back": [0, 0, -1], "left": [-1, 0, 0],
                  "right": [1, 0, 0], "top": [0, 1, 0], "bottom": [0, -1, 0]}
    views["preview"] = {"file": "preview.png", "canonicalDirection": [1, .8, 1],
                        "sha256": records["preview.png"]["sha256"],
                        "byteLength": records["preview.png"]["byteLength"]}
    for direction in ("front", "back", "left", "right", "top", "bottom"):
        views["views"][direction] = {"file": direction + ".png", "sha256": records[direction + ".png"]["sha256"],
                                     "canonicalDirection": directions[direction],
                                     "byteLength": records[direction + ".png"]["byteLength"]}
    data = canonical_json(views).encode()
    saved = store.put(data)
    records["six-views.json"] = {"name": "six-views.json", "sha256": saved["sha256"],
                                  "byteLength": len(data), "storageKey": "artifacts/catalog/" + saved["storage_key"]}
    manifest = {"schemaVersion": 1, "revisionId": revision["revision_id"],
                "variantId": revision["variant_id"], "inputDigest": revision["input_digest"],
                "files": list(records.values())}
    return revision, manifest


def test_quality_template_binds_archived_model_and_keeps_every_review_pending(tmp_path):
    revision, manifest = catalog_fixture(tmp_path)

    report = quality_review_template(tmp_path, revision, manifest)

    assert report["modelSha256"] == manifest["files"][0]["sha256"]
    assert report["sourceSha256s"] == sorted(
        item["sha256"] for item in manifest["files"] if item["name"].startswith("sources/"))
    assert set(report["reviews"]) == {"geometry", "appearance", "attribution"}
    assert {item["decision"] for item in report["reviews"].values()} == {"Pending"}
    assert all(not item["reviewer"] and not item["evidencePath"] for item in report["reviews"].values())


def test_review_submission_without_actual_approval_stays_validating(tmp_path):
    revision, manifest = catalog_fixture(tmp_path)
    database = tmp_path / "catalog.sqlite"
    with CatalogRepository(database, workspace=tmp_path) as repo:
        part = repo.add_part("測試", "System", "test-part")
        variant = repo.add_variant(part, {"color": "4"})
        revision["variant_id"] = variant
        actual_revision = repo.start_revision(variant, revision["input_digest"], {"tool": "fixture"})
        revision["revision_id"] = actual_revision
        manifest["revisionId"] = actual_revision
        manifest["variantId"] = variant
        repo.transition_revision(actual_revision, "Building")
        repo.transition_revision(actual_revision, "Validating")
        row = dict(repo.connection.execute("SELECT * FROM model_revisions WHERE revision_id=?",
                                           (actual_revision,)).fetchone())
        with repo.transaction():
            repo.connection.execute("UPDATE model_revisions SET manifest_json=? WHERE revision_id=?",
                                    (canonical_json(manifest), actual_revision))

        submitted = quality_review_template(tmp_path, row, manifest)
        report_path = tmp_path / "quality-review.json"
        report_path.write_text(canonical_json(submitted), encoding="utf-8")

        with pytest.raises(GateNotMet):
            complete_revision_quality(repo, tmp_path, actual_revision, "quality-review.json")

        assert repo.connection.execute("SELECT status FROM model_revisions WHERE revision_id=?",
                                       (actual_revision,)).fetchone()[0] == "Validating"


def test_verified_report_can_mark_only_a_local_fixture_ready_and_validate_its_evidence(tmp_path):
    revision, manifest = catalog_fixture(tmp_path)
    with CatalogRepository(tmp_path / "catalog.sqlite", workspace=tmp_path) as repo:
        part = repo.add_part("測試幾何", "System", "quality-fixture")
        variant = repo.add_variant(part, {"color": "4", "print": None, "material": "plastic"})
        snapshot = repo.create_snapshot("2026-09-08T15:59:59Z", {"families": ["System"]})
        repo.put_entry(snapshot, variant, "Active", [], {"tier": "Basic", "reason": "測試用"},
                       {"name": "品質閘門fixture", "fixture": True})
        repo.review_scope(snapshot, {"reviewer": "fixture", "artifact": "missing-production-evidence"})
        repo.freeze(snapshot, repo.snapshot(snapshot)["version"])
        actual_revision = repo.start_revision(variant, revision["input_digest"], {"tool": "fixture"})
        revision["revision_id"] = actual_revision
        revision["variant_id"] = variant
        manifest["revisionId"] = actual_revision
        manifest["variantId"] = variant
        repo.transition_revision(actual_revision, "Building")
        repo.transition_revision(actual_revision, "Validating")
        with repo.transaction():
            repo.connection.execute("UPDATE model_revisions SET manifest_json=? WHERE revision_id=?",
                                    (canonical_json(manifest), actual_revision))

        row = dict(repo.connection.execute("SELECT * FROM model_revisions WHERE revision_id=?",
                                           (actual_revision,)).fetchone())
        review = quality_review_template(tmp_path, row, manifest)
        for name, item in review["reviews"].items():
            evidence_key = "review-evidence/" + name + ".json"
            evidence = {"schemaVersion": 1, "fixtureOnly": True, "reviewType": name,
                        "revisionId": actual_revision, "modelSha256": review["modelSha256"]}
            evidence_path = tmp_path / evidence_key
            evidence_path.parent.mkdir(parents=True, exist_ok=True)
            evidence_path.write_text(canonical_json(evidence), encoding="utf-8")
            item["decision"] = "Approved"
            item["reviewer"] = "local verifier fixture"
            item["reason"] = "Synthetic evidence exercises the verifier only."
            item["evidencePath"] = evidence_key
            item["evidenceSha256"] = hashlib.sha256(evidence_path.read_bytes()).hexdigest()
        submission = tmp_path / "quality-review.json"
        submission.write_text(canonical_json(review), encoding="utf-8")

        result = complete_revision_quality(repo, tmp_path, actual_revision, "quality-review.json")

        ready = dict(repo.connection.execute("SELECT * FROM model_revisions WHERE revision_id=?",
                                             (actual_revision,)).fetchone())
        assert result["status"] == "Ready"
        assert verify_persisted_quality(tmp_path, ready) is True
        repo.select_revision(snapshot, variant, actual_revision)
        validation = _validation(repo, tmp_path, snapshot)
        issues = validation["variants"][0]["issues"]
        assert "unverifiable-quality-report" not in issues
        assert "fixture-content" in issues
        assert validation["counts"]["V"] == 0
        assert validation["releaseAllowed"] is False


def test_quality_template_rejects_tampered_archived_glb(tmp_path):
    revision, manifest = catalog_fixture(tmp_path)
    model = next(item for item in manifest["files"] if item["name"] == "model.glb")
    (tmp_path / model["storageKey"]).write_bytes(b"changed after archiving")

    with pytest.raises(GateNotMet):
        quality_review_template(tmp_path, revision, manifest)
