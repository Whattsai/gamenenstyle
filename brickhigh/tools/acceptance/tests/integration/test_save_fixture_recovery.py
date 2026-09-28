"""SC-050 人工 F-Save：真 SQLite/WAL 備份與明確還原。"""

import sqlite3
from contextlib import closing
import json
import hashlib
import subprocess
import sys
from pathlib import Path

import pytest

from tools.acceptance.save_fixture_recovery import SaveFixtureRecovery


REFERENCE = "11111111-1111-4111-8111-111111111111/22222222-2222-4222-8222-222222222222/33333333-3333-4333-8333-333333333333"
DIGEST = hashlib.sha256(("ref-digest-v1\n" + REFERENCE).encode()).hexdigest()


def state(path):
    with closing(sqlite3.connect(path)) as db:
        return db.execute("SELECT progress FROM fixture_state").fetchone()[0]


def fixture(tmp_path):
    current = tmp_path / "profile" / "player.db"
    current.parent.mkdir()
    with closing(sqlite3.connect(current)) as db:
        with db:
            db.execute("PRAGMA journal_mode=WAL")
            db.execute("PRAGMA user_version=1")
            db.execute("CREATE TABLE fixture_state(progress TEXT NOT NULL, reference_digest TEXT NOT NULL)")
            db.execute("CREATE TABLE fixture_refs(reference TEXT NOT NULL)")
            db.execute("CREATE TABLE fixture_identity(purpose TEXT NOT NULL CHECK(purpose='F-Save'))")
            db.execute("INSERT INTO fixture_identity VALUES ('F-Save')")
            db.execute("INSERT INTO fixture_refs VALUES (?)", (REFERENCE,))
            db.execute("INSERT INTO fixture_state VALUES ('old',?)", (DIGEST,))
    return current, SaveFixtureRecovery(current, tmp_path / "backups")


def test_recovery_refuses_unmarked_database(tmp_path):
    current = tmp_path / "player.db"
    with closing(sqlite3.connect(current)) as db:
        db.execute("CREATE TABLE unrelated(value TEXT)")
    with pytest.raises(ValueError, match="F-Save"):
        SaveFixtureRecovery(current, tmp_path / "backups")


def verify(expected_version, expected_progress):
    def check(db):
        assert db.execute("PRAGMA user_version").fetchone()[0] == expected_version
        assert db.execute("SELECT progress FROM fixture_state").fetchone()[0] == expected_progress
        references = [row[0] for row in db.execute("SELECT reference FROM fixture_refs")]
        actual = hashlib.sha256(("ref-digest-v1\n" + "\n".join(sorted(set(references)))).encode()).hexdigest()
        assert db.execute("SELECT reference_digest FROM fixture_state").fetchone()[0] == actual
    return check


@pytest.mark.parametrize("fault", ["copied", "validated", "committing"])
def test_it_023_interrupted_backup_keeps_last_good_and_live_wal(tmp_path, fault):
    current, recovery = fixture(tmp_path)
    first = recovery.backup("v1", verify(1, "old"))
    with closing(sqlite3.connect(current)) as db:
        with db:
            db.execute("UPDATE fixture_state SET progress='new'")
    with pytest.raises(RuntimeError):
        recovery.backup("v2", verify(1, "new"), fault=fault)
    assert recovery.last_good() == first
    assert state(first.path) == "old"
    assert state(current) == "new"


def test_it_023_failed_migration_rolls_back_after_consistent_backup(tmp_path):
    current, recovery = fixture(tmp_path)

    def migration(db):
        db.execute("UPDATE fixture_state SET progress='broken'")
        db.execute("PRAGMA user_version=2")
        raise RuntimeError("injected migration fault")

    with pytest.raises(RuntimeError):
        recovery.migrate("before-v2", verify(1, "old"), migration)
    assert state(current) == "old"
    assert recovery.last_good() is not None
    assert state(recovery.last_good().path) == "old"
    with closing(sqlite3.connect(current)) as db:
        assert db.execute("PRAGMA user_version").fetchone()[0] == 1


def test_it_023_backup_captures_committed_pages_while_wal_is_live(tmp_path):
    current, recovery = fixture(tmp_path)
    with closing(sqlite3.connect(current)) as writer:
        writer.execute("UPDATE fixture_state SET progress='committed-in-wal'")
        writer.commit()
        assert current.with_name(current.name + "-wal").exists()
        copy = recovery.backup("live-wal", verify(1, "committed-in-wal"))
        assert state(copy.path) == "committed-in-wal"


def test_it_023_invalid_reference_copy_does_not_replace_last_good(tmp_path):
    current, recovery = fixture(tmp_path)
    previous = recovery.backup("good", verify(1, "old"))
    with closing(sqlite3.connect(current)) as db:
        with db:
            db.execute("DELETE FROM fixture_refs")
    with pytest.raises(AssertionError):
        recovery.backup("invalid", verify(1, "old"))
    assert recovery.last_good() == previous
    assert state(previous.path) == "old"


def test_it_023_successful_migration_keeps_old_backup_and_commits_new_schema(tmp_path):
    current, recovery = fixture(tmp_path)

    def migration(db):
        db.execute("UPDATE fixture_state SET progress='migrated'")
        db.execute("PRAGMA user_version=2")

    previous = recovery.migrate("before-v2", verify(1, "old"), migration)
    assert state(previous.path) == "old"
    assert state(current) == "migrated"
    with closing(sqlite3.connect(current)) as db:
        assert db.execute("PRAGMA user_version").fetchone()[0] == 2


def test_et_017_corrupt_selected_backup_cannot_replace_current(tmp_path):
    current, recovery = fixture(tmp_path)
    selected = recovery.backup("v1", verify(1, "old"))
    with closing(sqlite3.connect(current)) as db:
        with db:
            db.execute("UPDATE fixture_state SET progress='new'")
    selected.path.write_bytes(b"not sqlite")
    with pytest.raises(ValueError, match="F-Save"):
        recovery.restore(selected, confirmed=True, verify=verify(1, "old"))
    assert state(current) == "new"


def test_et_017_cancel_failure_and_confirm_preserve_new_progress(tmp_path):
    current, recovery = fixture(tmp_path)
    original = recovery.backup("v1", verify(1, "old"))
    with closing(sqlite3.connect(current)) as db:
        with db:
            db.execute("UPDATE fixture_state SET progress='new'")
            db.execute("PRAGMA user_version=2")
    prompt = recovery.restore_prompt(original)
    assert "還原將回到所選備份的進度；目前資料會另行保留。" in prompt
    assert "v1" in prompt
    assert recovery.restore(original, confirmed=False, verify=verify(1, "old")) is None
    assert state(current) == "new"
    with pytest.raises(RuntimeError):
        recovery.restore(original, confirmed=True, verify=verify(1, "old"), fault="staged")
    assert state(current) == "new"
    preserved = recovery.restore(original, confirmed=True, verify=verify(1, "old"))
    assert state(current) == "old"
    assert preserved is not None and state(preserved.path) == "new"
    assert state(original.path) == "old"


@pytest.mark.parametrize("choice,fail,expected", [
    ("none", False, "new"), ("cancel", False, "new"),
    ("confirm", True, "new"), ("confirm", False, "old"),
])
def test_et_017_cli_explicit_choice_matrix(tmp_path, choice, fail, expected):
    output = tmp_path / f"{choice}-{fail}.json"
    script = Path(__file__).resolve().parents[2] / "verify_save_fixture_recovery.py"
    command = [sys.executable, str(script), "--choice", choice, "--output", str(output)]
    if fail:
        command.append("--inject-restore-failure")
    completed = subprocess.run(command, capture_output=True, text=True, check=False)
    assert completed.returncode == 0, completed.stderr
    report = json.loads(output.read_text(encoding="utf-8"))
    assert report["choice"] == choice
    assert report["currentProgress"] == expected
    assert report["originalBackupProgress"] == "old"
    assert "還原將回到所選備份的進度；目前資料會另行保留。" in report["prompt"]
    assert report["currentSchema"] == (1 if expected == "old" else 2)
    assert report["preservedNewProgress"] == ("new" if expected == "old" else None)
