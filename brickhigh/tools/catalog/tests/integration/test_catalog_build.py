"""模型工作以真SQLite及不可變產物驗證恢復；另有真正Blender CLI整合。"""

import hashlib
import json
from pathlib import Path
from uuid import uuid4

import pytest

from tools.catalog.building import build_catalog
from tools.catalog.content import ContentPathPolicy
from tools.catalog.policies import CatalogConflict, CatalogError
from tools.catalog.repository import CatalogRepository


def prepare(workspace, *, frozen=True, count=1):
    metadata = {"schemaVersion": 1, "fixture": True, "boundsMeters": {
        "min": [0, 0, 0], "max": [.032, .0112, .016]}, "connectors": [],
        "remainingChecks": ["DimensionsAndConnectors", "SourceAppearance", "SixViews"]}
    (workspace / "metadata.json").write_text(json.dumps(metadata), encoding="utf-8")
    with CatalogRepository(workspace / "catalog.sqlite") as repo:
        snapshot = repo.create_snapshot("2026-09-08T15:59:59Z", {})
        items = []
        for i in range(count):
            design_id = "3001" if i == 0 else "3005"
            part = repo.add_part("fixture", "System", "LEGO-Design:" + design_id)
            variant = repo.add_variant(part, {"color": "4"})
            repo.put_entry(snapshot, variant, [], {}, {"fixture": True, "designId": design_id,
                                                       "elementId": design_id + "01"})
            items.append({"variantId": variant, "part": "3001.dat", "colour": "4",
                          "metadata": {"path": "metadata.json", "sha256": hashlib.sha256(
                              (workspace / "metadata.json").read_bytes()).hexdigest()}})
        if frozen:
            repo.freeze(snapshot, repo.snapshot(snapshot)["version"])
        plan = {"schemaVersion": 1, "snapshotId": snapshot, "snapshotVersion": repo.snapshot(snapshot)["version"],
                "library": "library", "importer": "importer", "items": items}
    (workspace / "plan.json").write_text(json.dumps(plan), encoding="utf-8")
    return snapshot, plan


def fake_prepare(_workspace, plan):
    return {"toolchain": {"fixture": True, "converterSha256": "a" * 64},
            "sources": {item["variantId"]: {"sha256": "b" * 64} for item in plan["items"]}}


def fake_convert(workspace, plan, item, output, timeout):
    output.mkdir(parents=True)
    (output / "views").mkdir()
    for name in ("six-views.json", "preview.png", "front.png", "back.png", "left.png", "right.png", "top.png", "bottom.png"):
        (output / "views" / name).write_bytes(b"persistence-fixture-only")
    (output / "attribution.json").write_bytes(b'{"fixture":true}')
    for name, data in {"model.glb": b"F-Geometry model", "conversion.json": b'{"qualityPassed":false}',
                       "khronos-report.json": b'{"issues":{"numErrors":0,"numWarnings":0}}'}.items():
        (output / name).write_bytes(data)
    return {"geometry": {"sha256": hashlib.sha256(b"F-Geometry model").hexdigest()}, "source": {"sha256": "b" * 64},
            "qualityPassed": False}


def test_build_persists_validating_revision_and_reuses_successful_geometry(tmp_path, monkeypatch):
    snapshot, plan = prepare(tmp_path)
    monkeypatch.setattr("tools.catalog.building.prepare_toolchain", fake_prepare)
    calls = []
    def convert(*args):
        calls.append(1)
        return fake_convert(*args)
    monkeypatch.setattr("tools.catalog.building.convert_item", convert)
    first = build_catalog(tmp_path, tmp_path / "catalog.sqlite", snapshot, "build-one", "plan.json")
    again = build_catalog(tmp_path, tmp_path / "catalog.sqlite", snapshot, "build-one", "plan.json")
    assert first == again
    assert first["exitCode"] == 3
    assert first["jobStatus"] == "Completed"
    assert calls == [1]
    with CatalogRepository(tmp_path / "catalog.sqlite") as repo:
        row = repo.connection.execute("SELECT * FROM model_revisions").fetchone()
        assert row["status"] == "Validating"
        checks = json.loads(row["validation_json"])["metadataChecks"]
        assert "missing-canonical-coordinate-profile" in checks["geometryIssues"]
        assert checks["wheelEligible"] is False
        manifest = json.loads(row["manifest_json"])
        assert manifest["variantId"] == plan["items"][0]["variantId"]
        assert manifest["revisionId"] == row["revision_id"]
        assert {file["name"] for file in manifest["files"]} == {
            "model.glb", "metadata.json", "conversion.json", "khronos-report.json", "attribution.json",
            "six-views.json", "preview.png", "front.png", "back.png", "left.png", "right.png", "top.png", "bottom.png"}
        for file in manifest["files"]:
            assert len(ContentPathPolicy.read_verified(tmp_path, file["storageKey"], file["sha256"])) == file["byteLength"]
        assert repo.entries(snapshot)[0]["selected_revision_id"] is None
        assert repo.head()["snapshot_id"] is None


@pytest.mark.parametrize("change_kind", ["source", "metadata", "toolchain"])
def test_build_changed_identity_input_creates_immutable_successor_revision(tmp_path, monkeypatch, change_kind):
    snapshot, plan = prepare(tmp_path)
    identity = {"toolchain_sha": "a" * 64, "source_sha": "b" * 64}

    def versioned_prepare(_workspace, current_plan):
        return {
            "toolchain": {"fixture": True, "converterSha256": identity["toolchain_sha"]},
            "sources": {
                item["variantId"]: {"sha256": identity["source_sha"]}
                for item in current_plan["items"]
            },
        }

    def versioned_convert(*args):
        report = fake_convert(*args)
        return dict(report, source={"sha256": identity["source_sha"]})

    monkeypatch.setattr("tools.catalog.building.prepare_toolchain", versioned_prepare)
    monkeypatch.setattr("tools.catalog.building.convert_item", versioned_convert)

    first = build_catalog(tmp_path, tmp_path / "catalog.sqlite", snapshot, "build-predecessor", "plan.json")
    with CatalogRepository(tmp_path / "catalog.sqlite") as repo:
        predecessor = dict(repo.connection.execute("SELECT rowid,* FROM model_revisions").fetchone())
        predecessor_manifest = predecessor["manifest_json"]
        predecessor_files = {
            item["name"]: item for item in json.loads(predecessor_manifest)["files"]
        }

    if change_kind == "source":
        identity["source_sha"] = "c" * 64
    elif change_kind == "toolchain":
        identity["toolchain_sha"] = "c" * 64
    else:
        changed_metadata = {
            "schemaVersion": 1,
            "fixture": True,
            "boundsMeters": {"min": [0, 0, 0], "max": [.032, .0112, .016]},
            "connectors": [],
            "remainingChecks": ["SourceAppearance"],
            "revisionMarker": "changed-metadata",
        }
        (tmp_path / "metadata.json").write_text(json.dumps(changed_metadata), encoding="utf-8")
        plan["items"][0]["metadata"]["sha256"] = hashlib.sha256(
            (tmp_path / "metadata.json").read_bytes()
        ).hexdigest()
        (tmp_path / "plan.json").write_text(json.dumps(plan), encoding="utf-8")

    successor = build_catalog(
        tmp_path,
        tmp_path / "catalog.sqlite",
        snapshot,
        "build-successor-" + change_kind,
        "plan.json",
    )

    assert first["revisions"][0]["revisionId"] != successor["revisions"][0]["revisionId"]
    with CatalogRepository(tmp_path / "catalog.sqlite") as repo:
        rows = [dict(row) for row in repo.connection.execute(
            "SELECT rowid,* FROM model_revisions ORDER BY rowid"
        )]
        assert len(rows) == 2
        assert rows[0]["revision_id"] == predecessor["revision_id"]
        assert rows[0]["manifest_json"] == predecessor_manifest
        assert rows[0]["input_digest"] != rows[1]["input_digest"]
        assert rows[0]["status"] == rows[1]["status"] == "Validating"

        successor_files = {
            item["name"]: item for item in json.loads(rows[1]["manifest_json"])["files"]
        }
        assert "preview.png" in predecessor_files
        assert "preview.png" in successor_files
        assert predecessor_files["model.glb"]["sha256"] == successor_files["model.glb"]["sha256"]
        assert predecessor_files["preview.png"]["sha256"] == successor_files["preview.png"]["sha256"]
        if change_kind == "metadata":
            assert predecessor_files["metadata.json"]["sha256"] != successor_files["metadata.json"]["sha256"]
        for manifest_files in (predecessor_files, successor_files):
            for file in manifest_files.values():
                assert len(ContentPathPolicy.read_verified(
                    tmp_path, file["storageKey"], file["sha256"]
                )) == file["byteLength"]


def test_build_failed_item_does_not_abort_other_items_and_retry_only_rebuilds_failure(tmp_path, monkeypatch):
    snapshot, plan = prepare(tmp_path, count=2)
    monkeypatch.setattr("tools.catalog.building.prepare_toolchain", fake_prepare)
    fail_variant = plan["items"][0]["variantId"]
    calls = []
    def convert(workspace, plan, item, output, timeout):
        calls.append(item["variantId"])
        if item["variantId"] == fail_variant:
            raise TimeoutError("fixture worker timeout")
        return fake_convert(workspace, plan, item, output, timeout)
    monkeypatch.setattr("tools.catalog.building.convert_item", convert)
    first = build_catalog(tmp_path, tmp_path / "catalog.sqlite", snapshot, "build-two", "plan.json")
    assert first["exitCode"] == 4
    assert {item["status"] for item in first["revisions"]} == {"Failed", "Validating"}
    with CatalogRepository(tmp_path / "catalog.sqlite") as repo:
        failed = repo.connection.execute("SELECT validation_json FROM model_revisions WHERE status='Failed'").fetchone()[0]
        assert json.loads(failed)["failureCode"] == "WorkerTimeout"
    fail_variant = None
    again = build_catalog(tmp_path, tmp_path / "catalog.sqlite", snapshot, "build-two", "plan.json")
    assert again["exitCode"] == 3
    assert len(calls) == 3
    assert {item["status"] for item in again["revisions"]} == {"Validating"}


def test_build_changed_metadata_with_same_job_key_is_conflict(tmp_path, monkeypatch):
    snapshot, plan = prepare(tmp_path)
    monkeypatch.setattr("tools.catalog.building.prepare_toolchain", fake_prepare)
    monkeypatch.setattr("tools.catalog.building.convert_item", fake_convert)
    build_catalog(tmp_path, tmp_path / "catalog.sqlite", snapshot, "same-key", "plan.json")
    (tmp_path / "metadata.json").write_text('{"schemaVersion":1,"changed":true}', encoding="utf-8")
    plan["items"][0]["metadata"]["sha256"] = hashlib.sha256((tmp_path / "metadata.json").read_bytes()).hexdigest()
    (tmp_path / "plan.json").write_text(json.dumps(plan), encoding="utf-8")
    with pytest.raises(CatalogConflict):
        build_catalog(tmp_path, tmp_path / "catalog.sqlite", snapshot, "same-key", "plan.json")


def test_build_rejects_draft_before_starting_worker(tmp_path, monkeypatch):
    snapshot, _ = prepare(tmp_path, frozen=False)
    def unexpected(*_):
        raise AssertionError("invalid input must not start tools")
    monkeypatch.setattr("tools.catalog.building.prepare_toolchain", unexpected)
    with pytest.raises(CatalogConflict):
        build_catalog(tmp_path, tmp_path / "catalog.sqlite", snapshot, "draft", "plan.json")


def test_build_retry_rejects_corrupt_archived_output(tmp_path, monkeypatch):
    snapshot, _ = prepare(tmp_path)
    monkeypatch.setattr("tools.catalog.building.prepare_toolchain", fake_prepare)
    monkeypatch.setattr("tools.catalog.building.convert_item", fake_convert)
    build_catalog(tmp_path, tmp_path / "catalog.sqlite", snapshot, "same-key", "plan.json")
    with CatalogRepository(tmp_path / "catalog.sqlite") as repo:
        manifest = json.loads(repo.connection.execute("SELECT manifest_json FROM model_revisions").fetchone()[0])
    (tmp_path / manifest["files"][0]["storageKey"]).write_bytes(b"corrupt")
    with pytest.raises(CatalogError):
        build_catalog(tmp_path, tmp_path / "catalog.sqlite", snapshot, "same-key", "plan.json")


def test_build_source_replaced_during_conversion_cannot_commit_old_identity(tmp_path, monkeypatch):
    snapshot, _ = prepare(tmp_path)
    monkeypatch.setattr("tools.catalog.building.prepare_toolchain", fake_prepare)
    def changed(*args):
        return dict(fake_convert(*args), source={"sha256": "c" * 64})
    monkeypatch.setattr("tools.catalog.building.convert_item", changed)
    result = build_catalog(tmp_path, tmp_path / "catalog.sqlite", snapshot, "changed", "plan.json")
    assert result["exitCode"] == 4
    assert result["revisions"][0]["status"] == "Failed"


def test_build_snapshot_changed_during_tool_preparation_rejects_stale_plan(tmp_path, monkeypatch):
    snapshot, _ = prepare(tmp_path)
    def changed(workspace, plan):
        with CatalogRepository(tmp_path / "catalog.sqlite") as repo:
            repo.connection.execute("UPDATE snapshots SET version=version+1 WHERE snapshot_id=?", (snapshot,))
        return fake_prepare(workspace, plan)
    monkeypatch.setattr("tools.catalog.building.prepare_toolchain", changed)
    monkeypatch.setattr("tools.catalog.building.convert_item", fake_convert)
    with pytest.raises(CatalogConflict):
        build_catalog(tmp_path, tmp_path / "catalog.sqlite", snapshot, "stale-plan", "plan.json")
    with CatalogRepository(tmp_path / "catalog.sqlite") as repo:
        assert repo.connection.execute("SELECT count(*) FROM model_revisions").fetchone()[0] == 0
        assert repo.connection.execute("SELECT count(*) FROM jobs WHERE status='Running'").fetchone()[0] == 0


def test_build_snapshot_changed_during_conversion_never_commits_validating_revision(tmp_path, monkeypatch):
    snapshot, _ = prepare(tmp_path)
    monkeypatch.setattr("tools.catalog.building.prepare_toolchain", fake_prepare)
    def changed(*args):
        report = fake_convert(*args)
        with CatalogRepository(tmp_path / "catalog.sqlite") as repo:
            repo.connection.execute("UPDATE snapshots SET version=version+1 WHERE snapshot_id=?", (snapshot,))
        return report
    monkeypatch.setattr("tools.catalog.building.convert_item", changed)
    result = build_catalog(tmp_path, tmp_path / "catalog.sqlite", snapshot, "changed-snapshot", "plan.json")
    assert result["exitCode"] == 4
    with CatalogRepository(tmp_path / "catalog.sqlite") as repo:
        row = repo.connection.execute("SELECT * FROM model_revisions").fetchone()
        assert row["status"] == "Failed"
        assert json.loads(row["validation_json"])["failureCode"] == "SnapshotChanged"
        assert repo.head()["snapshot_id"] is None


def test_build_corrupt_reuse_releases_new_job_lease_for_immediate_retry(tmp_path, monkeypatch):
    snapshot, _ = prepare(tmp_path)
    monkeypatch.setattr("tools.catalog.building.prepare_toolchain", fake_prepare)
    monkeypatch.setattr("tools.catalog.building.convert_item", fake_convert)
    build_catalog(tmp_path, tmp_path / "catalog.sqlite", snapshot, "original", "plan.json")
    with CatalogRepository(tmp_path / "catalog.sqlite") as repo:
        manifest = json.loads(repo.connection.execute("SELECT manifest_json FROM model_revisions").fetchone()[0])
    artifact = tmp_path / manifest["files"][0]["storageKey"]
    original = artifact.read_bytes()
    artifact.write_bytes(b"corrupt")
    with pytest.raises(CatalogError):
        build_catalog(tmp_path, tmp_path / "catalog.sqlite", snapshot, "reuse", "plan.json")
    with CatalogRepository(tmp_path / "catalog.sqlite") as repo:
        job = repo.connection.execute("SELECT * FROM jobs WHERE idempotency_key='reuse'").fetchone()
        assert job["status"] == "Failed"
        assert job["lease_until"] is None
        assert repo.connection.execute("SELECT count(*) FROM catalog_job_claims").fetchone()[0] == 0
    artifact.write_bytes(original)
    assert build_catalog(tmp_path, tmp_path / "catalog.sqlite", snapshot, "reuse", "plan.json")["jobStatus"] == "Completed"


@pytest.mark.parametrize("missing_source", [False, True])
def test_real_cli_build_blender_validator_and_immutable_revision(missing_source):
    import subprocess
    import sys
    workspace = Path(__file__).resolve().parents[4]
    relative = "artifacts/acceptance/catalog-build-" + uuid4().hex
    case = workspace / relative
    case.mkdir(parents=True)
    snapshot, plan = prepare(case, count=2 if missing_source else 1)
    plan["library"] = "artifacts/sources/ldraw-release/ldraw"
    plan["importer"] = "artifacts/toolchain/ImportLDraw"
    for item in plan["items"]:
        item["metadata"]["path"] = relative + "/metadata.json"
    if missing_source:
        plan["items"][1]["part"] = "brickhigh-missing-fixture.dat"
    (case / "plan.json").write_text(json.dumps(plan), encoding="utf-8")
    command = [sys.executable, "-m", "tools.catalog", "--workspace", str(workspace),
               "--db", relative + "/catalog.sqlite", "build", "--snapshot", snapshot,
               "--job-key", "real-build", "--plan", relative + "/plan.json"]
    first = subprocess.run(command, cwd=workspace, capture_output=True, timeout=180)
    (case / "cli-result.json").write_bytes(first.stdout)
    if missing_source:
        assert first.returncode == 4, first.stderr
        result = json.loads(first.stdout)
        assert {item["status"] for item in result["revisions"]} == {"Failed", "Validating"}
        assert result["jobStatus"] == "Failed"
        return
    assert first.returncode == 3, first.stderr
    report = json.loads(first.stdout)
    assert report["jobStatus"] == "Completed"
    assert report["qualityPassed"] is False
    with CatalogRepository(case / "catalog.sqlite") as repo:
        row = repo.connection.execute("SELECT * FROM model_revisions").fetchone()
        manifest = json.loads(row["manifest_json"])
        refs = {item["name"]: item for item in manifest["files"]}
        assert {"preview.png", "attribution.json", "six-views.json", "front.png", "back.png",
                "left.png", "right.png", "top.png", "bottom.png"}.issubset(refs)
        def data(name):
            ref = refs[name]
            return ContentPathPolicy.read_verified(workspace, ref["storageKey"], ref["sha256"])
        from tools.catalog.glb import inspect_glb
        geometry = inspect_glb(data("model.glb"))
        assert geometry["triangles"] > 100
        validator = json.loads(data("khronos-report.json"))
        assert validator["modelSha256"] == geometry["sha256"]
        assert validator["modelByteLength"] == len(data("model.glb"))
        assert validator["issues"]["numErrors"] == 0
        assert validator["issues"]["numWarnings"] == 0
        assert json.loads(data("conversion.json"))["source"]["filename"] == "3001.dat"
        views = json.loads(data("six-views.json"))
        assert views["modelSha256"] == geometry["sha256"]
        for view in views["views"].values():
            assert view["sha256"] == hashlib.sha256(data(view["file"])).hexdigest()
        attribution = json.loads(data("attribution.json"))
        assert attribution["modelSha256"] == geometry["sha256"]
        assert all(file["author"] and file["license"] and file["sha256"] for file in attribution["sources"])
        for source in attribution["sources"]:
            archived = data("sources/" + source["path"])
            assert hashlib.sha256(archived).hexdigest() == source["sha256"]
        assert hashlib.sha256(data("sources/LDConfig.ldr")).hexdigest() == attribution["colourConfig"]["sha256"]
        assert row["status"] == "Validating"
        assert repo.snapshot(snapshot)["status"] == "Frozen"
        assert repo.head()["snapshot_id"] is None
    again = subprocess.run(command, cwd=workspace, capture_output=True, timeout=90)
    assert again.returncode == 3
    assert json.loads(again.stdout) == report
