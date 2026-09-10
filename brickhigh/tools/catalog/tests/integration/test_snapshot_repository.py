"""真實 SQLite 的快照、逐件選擇與發布交易；fixture 不作正式交付。"""

from concurrent.futures import ThreadPoolExecutor
import sqlite3

import pytest

from tools.catalog.policies import CatalogConflict, GateNotMet
from tools.catalog.repository import CatalogRepository


@pytest.fixture
def repo(tmp_path):
    with CatalogRepository(tmp_path / "catalog.sqlite") as value:
        yield value


def draft(repo, status="Active", fixture=False):
    part = repo.add_part("基本磚", "System", "3001")
    variant = repo.add_variant(part, {"color": "4", "print": None, "material": "plastic"})
    snapshot = repo.create_snapshot("2026-09-08T15:59:59Z", scope={"families": ["System"]})
    repo.put_entry(snapshot, variant, status, ["e1"], {"tier": "Basic", "reason": "fixture"},
                   {"name": "基本磚", "fixture": fixture})
    repo.review_scope(snapshot, {"reviewer": "test", "artifact": "scope-evidence"})
    return snapshot, variant


def validated(repo, fixture=False):
    snapshot, variant = draft(repo, fixture=fixture)
    repo.freeze(snapshot, repo.snapshot(snapshot)["version"])
    revision = repo.start_revision(variant, "a" * 64, {"tool": "fixture"})
    repo.transition_revision(revision, "Building")
    repo.transition_revision(revision, "Validating")
    repo.transition_revision(revision, "Ready", report={"quality_passed": True, "provenance_passed": True,
                                                       "evidence_digest": "b" * 64})
    repo.select_revision(snapshot, variant, revision)
    build = repo.record_validation(snapshot, "windows-x64", "c" * 64, "d" * 64, [revision])
    return snapshot, variant, revision, build


def test_IT_002_RunSnapshotPublish_ScenarioMatrix_PreservesContract(repo):
    snapshot, variant = draft(repo)
    version = repo.snapshot(snapshot)["version"]
    repo.freeze(snapshot, version)
    with pytest.raises(CatalogConflict):
        repo.put_entry(snapshot, variant, "Retired", [], {}, {})
    with pytest.raises(GateNotMet):
        repo.publish(snapshot, 0, "missing", "windows-x64", "c" * 64)
    assert repo.head() == {"snapshot_id": None, "version": 0}
    successor = repo.fork(snapshot, "2026-09-09T15:59:59Z")
    repo.put_entry(successor, variant, "Unknown", [], {"tier": "Basic", "reason": "new"}, {"name": "新版"})
    assert repo.entries(snapshot)[0]["production_status"] == "Active"
    assert repo.entries(successor)[0]["production_status"] == "Unknown"


def test_IT_021_Publish_ChangedSourceDigest_RejectsPromotion(repo):
    snapshot, variant, revision, build = validated(repo)
    initial = repo.snapshot(snapshot)
    # 重新選擇也會遞增版本，因此不能重用舊驗證。
    repo.select_revision(snapshot, variant, revision)
    assert repo.snapshot(snapshot)["version"] > initial["version"]
    with pytest.raises(GateNotMet):
        repo.publish(snapshot, 0, build, "windows-x64", "c" * 64)
    assert repo.head()["snapshot_id"] is None


def test_IT_014_RunPublishConcurrency_ScenarioMatrix_PreservesContract(repo):
    snapshot, _, _, build = validated(repo)
    db_path = repo.path

    def publish():
        with CatalogRepository(db_path) as other:
            try:
                other.publish(snapshot, 0, build, "windows-x64", "c" * 64)
                return "published"
            except CatalogConflict:
                return "conflict"

    with ThreadPoolExecutor(max_workers=2) as pool:
        results = list(pool.map(lambda _: publish(), range(2)))
    assert sorted(results) == ["conflict", "published"]
    assert repo.head() == {"snapshot_id": snapshot, "version": 1}
    assert repo.snapshot(snapshot)["status"] == "Published"
    with pytest.raises(CatalogConflict):
        repo.select_revision(snapshot, repo.entries(snapshot)[0]["variant_id"], "not-a-revision")


def test_publication_commit_failure_preserves_head_and_staging(repo):
    snapshot, _, _, build = validated(repo)
    repo.connection.execute("CREATE TRIGGER fault BEFORE UPDATE ON catalog_head BEGIN SELECT RAISE(ABORT,'fault'); END")
    with pytest.raises(sqlite3.IntegrityError):
        repo.publish(snapshot, 0, build, "windows-x64", "c" * 64)
    assert repo.head()["version"] == 0
    assert repo.snapshot(snapshot)["status"] == "Frozen"
    assert repo.connection.execute("SELECT COUNT(*) FROM validation_builds").fetchone()[0] == 1


def test_fixture_or_unknown_cannot_publish(repo):
    snapshot, variant, revision, build = validated(repo, fixture=True)
    with pytest.raises(GateNotMet):
        repo.publish(snapshot, 0, build, "windows-x64", "c" * 64)


def test_revision_wrong_owner_and_skipped_validation_are_rejected(repo):
    snapshot, variant = draft(repo)
    other = repo.add_variant(repo.entries(snapshot)[0]["part_id"], {"color": "1"})
    revision = repo.start_revision(other, "e" * 64, {})
    with pytest.raises(GateNotMet):
        repo.transition_revision(revision, "Ready", report={"quality_passed": True})
    repo.freeze(snapshot, repo.snapshot(snapshot)["version"])
    with pytest.raises(GateNotMet):
        repo.select_revision(snapshot, variant, revision)


@pytest.mark.parametrize('statement', [
    "UPDATE snapshot_entries SET production_status='Retired' WHERE snapshot_id=?",
    "UPDATE snapshot_entries SET evidence_ids_json='[]' WHERE snapshot_id=?",
    "UPDATE snapshot_entries SET classification_json='{}' WHERE snapshot_id=?",
    "DELETE FROM snapshot_entries WHERE snapshot_id=?",
    "UPDATE snapshots SET scope_manifest_json='{}' WHERE snapshot_id=?",
    "UPDATE snapshots SET status='Draft' WHERE snapshot_id=?",
])
def test_frozen_snapshot_rejects_direct_sql_mutation(repo, statement):
    snapshot, _, _, _ = validated(repo)
    with pytest.raises(sqlite3.IntegrityError):
        repo.connection.execute(statement, (snapshot,))


def test_ready_revision_and_validation_evidence_are_immutable(repo):
    snapshot, variant, revision, build = validated(repo)
    with pytest.raises(sqlite3.IntegrityError):
        repo.connection.execute("UPDATE model_revisions SET validation_json='{}' WHERE revision_id=?", (revision,))
    with pytest.raises(sqlite3.IntegrityError):
        repo.connection.execute("DELETE FROM validation_builds WHERE build_id=?", (build,))
