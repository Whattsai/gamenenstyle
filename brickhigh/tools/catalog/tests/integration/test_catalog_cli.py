"""製作端 CLI 的真 SQLite、工作狀態與失敗關口。"""

import json
import hashlib
import subprocess
import sys
from pathlib import Path

from tools.catalog.jobs import CatalogJobs
from tools.catalog.content import ObjectStore
from tools.catalog.repository import CatalogRepository


ROOT = Path(__file__).resolve().parents[4]


def invoke(workspace, *args):
    result = subprocess.run([sys.executable, "-m", "tools.catalog", "--workspace", str(workspace), *map(str, args)],
                            cwd=ROOT, capture_output=True, text=True, timeout=15)
    return result.returncode, result.stdout.strip(), result.stderr.strip()


def draft(workspace):
    workspace.mkdir()
    with CatalogRepository(workspace / "catalog.sqlite") as repo:
        part = repo.add_part("基本磚", "System", "3001")
        variant = repo.add_variant(part, {"color": "4"})
        snapshot = repo.create_snapshot("2026-09-08T15:59:59Z", {"families": ["System"]})
        repo.put_entry(snapshot, variant, "Active", ["unknown-evidence"], {"tier": "Basic", "reason": "人工"},
                       {"name": "基本磚"})
        repo.review_scope(snapshot, {"reviewer": "test", "artifact": "unknown-scope"})
        return snapshot, variant, repo.snapshot(snapshot)["version"]


def import_fixture(workspace, *, expected_pages=1):
    workspace.mkdir()
    with CatalogRepository(workspace / "catalog.sqlite"):
        pass
    page = workspace / "page.json"
    page.write_text(json.dumps({"schemaVersion": 1, "records": [{"kind": "candidate", "sourceId": "v1",
        "partId": "part-1", "name": "基本磚", "family": "System", "appearance": {"color": "4"}}]}),
        encoding="utf-8")
    manifest = {"schemaVersion": 1, "baselineAt": "2026-09-08T15:59:59Z",
                "expectedFamilies": ["System"], "sources": [{"name": "catalog",
                "sourceUri": "https://example.invalid/catalog", "sourceVersion": "v1",
                "observedAt": "2026-09-10T12:00:00Z", "effectiveAt": None,
                "expectedPages": expected_pages, "pages": [{"number": 1, "path": "page.json",
                "sha256": hashlib.sha256(page.read_bytes()).hexdigest()}]}]}
    (workspace / "manifest.json").write_text(json.dumps(manifest), encoding="utf-8")
    return page, manifest


def test_freeze_cas_is_persistent_and_conflict_is_exit_five(tmp_path):
    workspace = tmp_path / "workspace"
    snapshot, _, version = draft(workspace)
    code, stdout, stderr = invoke(workspace, "freeze", "--snapshot", snapshot, "--expected-version", version)
    assert (code, stderr) == (0, "")
    assert json.loads(stdout)["status"] == "Frozen"
    with CatalogRepository(workspace / "catalog.sqlite") as repo:
        assert repo.snapshot(snapshot)["version"] == version + 1
    assert invoke(workspace, "freeze", "--snapshot", snapshot, "--expected-version", version)[0] == 5


def test_validate_lists_real_item_gaps_and_publish_preserves_head(tmp_path):
    workspace = tmp_path / "workspace"
    snapshot, variant, version = draft(workspace)
    assert invoke(workspace, "freeze", "--snapshot", snapshot, "--expected-version", version)[0] == 0
    code, stdout, stderr = invoke(workspace, "validate", "--snapshot", snapshot)
    report = json.loads(stdout)
    assert (code, stderr) == (3, "")
    assert report["releaseAllowed"] is False
    assert report["variants"][0]["variantId"] == variant
    assert "missing-source-evidence" in report["variants"][0]["issues"]
    assert "missing-selected-revision" in report["variants"][0]["issues"]
    assert invoke(workspace, "publish", "--snapshot", snapshot, "--expected-head-version", 0)[0] == 3
    with CatalogRepository(workspace / "catalog.sqlite") as repo:
        assert repo.head() == {"snapshot_id": None, "version": 0}
        assert repo.snapshot(snapshot)["status"] == "Frozen"


def test_boolean_ready_and_build_digest_cannot_be_promoted_without_quality_bytes(tmp_path):
    workspace = tmp_path / "workspace"
    snapshot, variant, _ = draft(workspace)
    source = ObjectStore(workspace).put(b"source bytes")
    with CatalogRepository(workspace / "catalog.sqlite") as repo:
        repo.connection.execute("""INSERT INTO source_artifacts VALUES(?,?,?,?,?,?,?,?)""",
                                ("source-a", "offline-source", "2026-09-08T00:00:00Z", None,
                                 source["sha256"], source["storage_key"], "{}", "{}"))
        repo.connection.execute("""INSERT INTO evidence VALUES(?,?,?,?,?,?,?,?)""",
                                ("evidence-a", "source-a", variant, "Producing", None, None, "reviewer", "source"))
        repo.connection.execute("UPDATE snapshot_entries SET evidence_ids_json=? WHERE snapshot_id=?",
                                (json.dumps(["evidence-a"]), snapshot))
        repo.review_scope(snapshot, {"reviewer": "reviewer", "artifact": "source-a"})
        repo.freeze(snapshot, repo.snapshot(snapshot)["version"])
        revision = repo.start_revision(variant, "a" * 64, {"tool": "fixture"})
        for state in ("Building", "Validating"):
            repo.transition_revision(revision, state)
        repo.transition_revision(revision, "Ready", report={"quality_passed": True,
                             "provenance_passed": True, "evidence_digest": hashlib.sha256(b"unavailable").hexdigest()})
        repo.select_revision(snapshot, variant, revision)
        repo.record_validation(snapshot, "windows-x64", "b" * 64, "c" * 64, [revision])
        assert repo.coverage(snapshot)["release_allowed"] is True
    code, stdout, _ = invoke(workspace, "validate", "--snapshot", snapshot)
    assert code == 3
    report = json.loads(stdout)
    assert "unverified-production-claim" in report["variants"][0]["issues"]
    assert "unverifiable-quality-report" in report["variants"][0]["issues"]
    assert invoke(workspace, "publish", "--snapshot", snapshot, "--expected-head-version", 0)[0] == 3
    with CatalogRepository(workspace / "catalog.sqlite") as repo:
        assert repo.head()["snapshot_id"] is None


def test_publish_stale_head_version_is_conflict_before_gate_check(tmp_path):
    workspace = tmp_path / "workspace"
    snapshot, _, version = draft(workspace)
    assert invoke(workspace, "freeze", "--snapshot", snapshot, "--expected-version", version)[0] == 0
    with CatalogRepository(workspace / "catalog.sqlite") as repo:
        repo.connection.execute("UPDATE catalog_head SET version=1 WHERE id=1")
    assert invoke(workspace, "publish", "--snapshot", snapshot, "--expected-head-version", 0)[0] == 5


def test_status_uses_persisted_hash_only_and_failed_job_returns_four(tmp_path):
    workspace = tmp_path / "workspace"
    workspace.mkdir()
    secret = "https://example.invalid/data?api_key=private-key"
    with CatalogJobs(workspace / "catalog.sqlite") as jobs:
        job_id = jobs.submit("job-safe", "build", {"source": secret})
    code, stdout, stderr = invoke(workspace, "status", "--job", job_id)
    assert (code, stderr) == (0, "")
    assert json.loads(stdout)["job_id"] == job_id
    assert secret not in stdout
    with CatalogJobs(workspace / "catalog.sqlite") as jobs:
        token = jobs.claim(job_id)
        jobs.run_item(token, {"item": 1}, lambda *_: (_ for _ in ()).throw(RuntimeError(secret)))
        jobs.finish(token)
    code, stdout, stderr = invoke(workspace, "status", "--job", job_id)
    assert (code, stderr) == (4, "")
    assert json.loads(stdout)["status"] == "Failed"
    assert secret not in stdout


def test_invalid_workspace_database_and_unsupported_commands_are_safe(tmp_path):
    workspace = tmp_path / "workspace"
    workspace.mkdir()
    code, stdout, stderr = invoke(workspace, "validate", "--snapshot", "invalid")
    assert code == 2 and not stdout
    assert not (workspace / "catalog.sqlite").exists()
    assert invoke(workspace, "--db", "../outside.sqlite", "status", "--job", "x")[0] == 2
    assert invoke(workspace, "import", "--manifest", "secret.json", "--job-key", "x")[0] == 2
    assert not (tmp_path / "outside.sqlite").exists()


def test_import_subprocess_idempotency_hash_rejection_and_missing_page_gap(tmp_path):
    workspace = tmp_path / "workspace"
    page, manifest = import_fixture(workspace, expected_pages=2)
    command = ("import", "--manifest", "manifest.json", "--job-key", "import-one")
    code, stdout, stderr = invoke(workspace, *command)
    assert (code, stderr) == (0, "")
    first = json.loads(stdout)
    assert first["snapshotId"] and first["coverage"]["G"] >= 1
    assert "private" not in stdout
    assert json.loads(invoke(workspace, *command)[1])["snapshotId"] == first["snapshotId"]

    page.write_bytes(b"tampered")
    assert invoke(workspace, "import", "--manifest", "manifest.json", "--job-key", "new-key")[0] != 0
    page.write_text(json.dumps({"schemaVersion": 1, "records": []}), encoding="utf-8")
    manifest["sources"][0]["pages"][0]["sha256"] = hashlib.sha256(page.read_bytes()).hexdigest()
    (workspace / "manifest.json").write_text(json.dumps(manifest), encoding="utf-8")
    assert invoke(workspace, *command)[0] == 5
    with CatalogRepository(workspace / "catalog.sqlite") as repo:
        assert repo.connection.execute("SELECT COUNT(*) FROM snapshots").fetchone()[0] == 1


def test_import_rejects_credential_uri_without_persisting_secret(tmp_path):
    workspace = tmp_path / "workspace"
    _, manifest = import_fixture(workspace)
    manifest["sources"][0]["sourceUri"] += "?token=private"
    (workspace / "manifest.json").write_text(json.dumps(manifest), encoding="utf-8")
    code, stdout, stderr = invoke(workspace, "import", "--manifest", "manifest.json", "--job-key", "unsafe")
    assert code == 2
    assert "private" not in stdout + stderr
    with CatalogRepository(workspace / "catalog.sqlite") as repo:
        assert repo.connection.execute("SELECT COUNT(*) FROM source_artifacts").fetchone()[0] == 0


def test_import_bootstraps_database_in_new_workspace(tmp_path):
    workspace = tmp_path / "workspace"
    import_fixture(workspace)
    (workspace / "catalog.sqlite").unlink()
    code, stdout, stderr = invoke(workspace, "import", "--manifest", "manifest.json", "--job-key", "first")
    assert (code, stderr) == (0, "")
    with CatalogRepository(workspace / "catalog.sqlite") as repo:
        assert repo.snapshot(json.loads(stdout)["snapshotId"])["status"] == "Draft"


def test_validation_does_not_count_boolean_ready_as_verified_delivery(tmp_path):
    workspace = tmp_path / "workspace"
    snapshot, variant, version = draft(workspace)
    with CatalogRepository(workspace / "catalog.sqlite") as repo:
        repo.freeze(snapshot, version)
        revision = repo.start_revision(variant, "a" * 64, {"tool": "fixture"})
        for state in ("Building", "Validating"):
            repo.transition_revision(revision, state)
        repo.transition_revision(revision, "Ready", report={"quality_passed": True,
                                  "provenance_passed": True, "evidence_digest": "b" * 64})
        repo.select_revision(snapshot, variant, revision)
    code, stdout, _ = invoke(workspace, "validate", "--snapshot", snapshot)
    assert code == 3
    assert json.loads(stdout)["counts"]["V"] == 0


def test_validation_rejects_retired_without_evidence_instead_of_silently_excluding(tmp_path):
    workspace = tmp_path / "workspace"
    snapshot, variant, _ = draft(workspace)
    with CatalogRepository(workspace / "catalog.sqlite") as repo:
        repo.put_entry(snapshot, variant, "Retired", [], {}, {"name": "基本磚"})
        repo.freeze(snapshot, repo.snapshot(snapshot)["version"])
    code, stdout, _ = invoke(workspace, "validate", "--snapshot", snapshot)
    assert code == 3
    assert "unverified-production-claim" in json.loads(stdout)["variants"][0]["issues"]
