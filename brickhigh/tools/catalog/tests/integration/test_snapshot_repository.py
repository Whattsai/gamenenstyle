"""真實 SQLite 的快照、逐件選擇與發布交易；fixture 不作正式交付。"""

import sqlite3

import pytest

from tools.catalog.policies import CatalogConflict, GateNotMet
from tools.catalog.repository import CatalogRepository


@pytest.fixture
def repo(tmp_path):
    with CatalogRepository(tmp_path / "catalog.sqlite") as value:
        yield value


def draft(repo, fixture=False):
    part = repo.add_part("基本磚", "System", "LEGO-Design:3001")
    variant = repo.add_variant(part, {"color": "4", "print": None, "material": "plastic"})
    snapshot = repo.create_snapshot("2026-09-08T15:59:59Z", scope={"families": ["System"]})
    repo.put_entry(snapshot, variant, ["e1"], {"tier": "Basic", "reason": "fixture"},
                   {"name": "基本磚", "fixture": fixture, "designId": "3001", "elementId": "300101"})
    repo.review_scope(snapshot, {"reviewer": "test", "artifact": "scope-evidence"})
    return snapshot, variant


def validating(repo, fixture=False):
    snapshot, variant = draft(repo, fixture=fixture)
    repo.freeze(snapshot, repo.snapshot(snapshot)["version"])
    revision = repo.start_revision(variant, "a" * 64, {"tool": "fixture"})
    repo.transition_revision(revision, "Building")
    repo.transition_revision(revision, "Validating")
    return snapshot, variant, revision


def test_IT_002_RunSnapshotPublish_ScenarioMatrix_PreservesContract(repo):
    snapshot, variant = draft(repo)
    version = repo.snapshot(snapshot)["version"]
    repo.freeze(snapshot, version)
    with pytest.raises(CatalogConflict):
        repo.put_entry(snapshot, variant, [], {}, {})
    with pytest.raises(GateNotMet):
        repo.publish(snapshot, 0, "missing", "windows-x64", "c" * 64)
    assert repo.head() == {"snapshot_id": None, "version": 0}
    successor = repo.fork(snapshot, "2026-09-09T15:59:59Z")
    repo.put_entry(successor, variant, [], {"tier": "Basic", "reason": "new"},
                   {"name": "新版", "designId": "3001", "elementId": "300101"})
    assert repo.entries(snapshot)[0]["classification_json"] != repo.entries(successor)[0]["classification_json"]


def test_IT_021_Publish_ChangedSourceDigest_RejectsPromotion(repo):
    snapshot, _, revision = validating(repo)
    with pytest.raises(GateNotMet):
        repo.transition_revision(revision, "Ready", report={"quality_passed": True,
                                     "provenance_passed": True, "evidence_digest": "b" * 64})
    with pytest.raises(GateNotMet):
        repo.publish(snapshot, 0, "unverified", "windows-x64", "c" * 64)
    assert repo.head()["snapshot_id"] is None


def test_IT_014_RunPublishWithoutVerifiedQualityReport_PreservesContract(repo):
    snapshot, _, _ = validating(repo)
    with pytest.raises(GateNotMet):
        repo.publish(snapshot, 0, "unverified", "windows-x64", "c" * 64)
    assert repo.head() == {"snapshot_id": None, "version": 0}
    assert repo.snapshot(snapshot)["status"] == "Frozen"


def test_publication_commit_failure_preserves_head_and_staging(repo):
    snapshot, _, _ = validating(repo)
    repo.connection.execute("CREATE TRIGGER fault BEFORE UPDATE ON catalog_head BEGIN SELECT RAISE(ABORT,'fault'); END")
    with pytest.raises(GateNotMet):
        repo.publish(snapshot, 0, "unverified", "windows-x64", "c" * 64)
    assert repo.head()["version"] == 0
    assert repo.snapshot(snapshot)["status"] == "Frozen"
    assert repo.connection.execute("SELECT COUNT(*) FROM validation_builds").fetchone()[0] == 0


def test_fixture_cannot_publish(repo):
    snapshot, _, revision = validating(repo, fixture=True)
    with pytest.raises(GateNotMet):
        repo.transition_revision(revision, "Ready", report={"quality_passed": True,
                                     "provenance_passed": True, "evidence_digest": "b" * 64})
    with pytest.raises(GateNotMet):
        repo.publish(snapshot, 0, "unverified", "windows-x64", "c" * 64)
    assert repo.coverage(snapshot)["V"] == 0


def test_revision_wrong_owner_and_skipped_validation_are_rejected(repo):
    snapshot, variant = draft(repo)
    other = repo.add_variant(repo.entries(snapshot)[0]["part_id"], {"color": "1"})
    revision = repo.start_revision(other, "e" * 64, {})
    with pytest.raises(GateNotMet):
        repo.transition_revision(revision, "Ready", report={"quality_passed": True})
    repo.freeze(snapshot, repo.snapshot(snapshot)["version"])
    with pytest.raises(GateNotMet):
        repo.select_revision(snapshot, variant, revision)


def test_boolean_quality_flags_cannot_move_validating_revision_to_ready(repo):
    snapshot, variant = draft(repo)
    revision = repo.start_revision(variant, "f" * 64, {"tool": "fixture"})
    repo.transition_revision(revision, "Building")
    repo.transition_revision(revision, "Validating")

    with pytest.raises(GateNotMet):
        repo.transition_revision(revision, "Ready", report={
            "quality_passed": True,
            "provenance_passed": True,
            "evidence_digest": "a" * 64,
        })

    assert repo.connection.execute("SELECT status FROM model_revisions WHERE revision_id=?", (revision,)).fetchone()[0] == "Validating"


@pytest.mark.parametrize('statement', [
    "UPDATE snapshot_entries SET evidence_ids_json='[]' WHERE snapshot_id=?",
    "UPDATE snapshot_entries SET classification_json='{}' WHERE snapshot_id=?",
    "DELETE FROM snapshot_entries WHERE snapshot_id=?",
    "UPDATE snapshots SET scope_manifest_json='{}' WHERE snapshot_id=?",
    "UPDATE snapshots SET status='Draft' WHERE snapshot_id=?",
])
def test_frozen_snapshot_rejects_direct_sql_mutation(repo, statement):
    snapshot, _, _ = validating(repo)
    with pytest.raises(sqlite3.IntegrityError):
        repo.connection.execute(statement, (snapshot,))


@pytest.mark.parametrize('statement', [
    "UPDATE coverage_gaps SET resolution_evidence_id='fabricated' WHERE snapshot_id=?",
    "DELETE FROM coverage_gaps WHERE snapshot_id=?",
    "INSERT INTO coverage_gaps VALUES('new-gap',?,'source','family','MissingPage',NULL)",
])
def test_frozen_coverage_gaps_cannot_change_release_denominator(repo, statement):
    snapshot, _ = draft(repo)
    repo.connection.execute("INSERT INTO coverage_gaps VALUES('original-gap',?,'source','family','MissingPage',NULL)", (snapshot,))
    repo.freeze(snapshot, repo.snapshot(snapshot)['version'])
    with pytest.raises(sqlite3.IntegrityError):
        repo.connection.execute(statement, (snapshot,))
    successor = repo.fork(snapshot, '2026-09-09T15:59:59Z')
    repo.connection.execute("UPDATE coverage_gaps SET resolution_evidence_id='new-evidence' WHERE snapshot_id=?", (successor,))
    assert repo.connection.execute("SELECT resolution_evidence_id FROM coverage_gaps WHERE snapshot_id=?", (snapshot,)).fetchone()[0] is None


def test_draft_gap_cannot_move_into_frozen_snapshot(repo):
    frozen, _ = draft(repo)
    successor = repo.fork(frozen, '2026-09-09T15:59:59Z')
    repo.connection.execute("INSERT INTO coverage_gaps VALUES('movable',?,'source','family','MissingPage',NULL)", (successor,))
    repo.freeze(frozen, repo.snapshot(frozen)['version'])
    with pytest.raises(sqlite3.IntegrityError):
        repo.connection.execute("UPDATE coverage_gaps SET snapshot_id=? WHERE gap_id='movable'", (frozen,))


def test_direct_sql_boolean_claim_cannot_set_revision_ready(repo):
    _, _, revision = validating(repo)
    with pytest.raises(sqlite3.IntegrityError):
        repo.connection.execute("""UPDATE model_revisions SET status='Ready',
            validation_json='{"quality_passed":true,"provenance_passed":true,"evidence_digest":"abc"}',
            manifest_json='{}' WHERE revision_id=?""", (revision,))
    assert repo.connection.execute("SELECT status FROM model_revisions WHERE revision_id=?", (revision,)).fetchone()[0] == "Validating"
