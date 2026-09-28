"""只在新建且用完即棄的 F-Save 上執行 SC-050 還原選擇。"""

from __future__ import annotations

import argparse
from contextlib import closing
import hashlib
import json
from pathlib import Path
import sqlite3
from tempfile import TemporaryDirectory

from save_fixture_recovery import SaveFixtureRecovery


REFERENCE = "11111111-1111-4111-8111-111111111111/22222222-2222-4222-8222-222222222222/33333333-3333-4333-8333-333333333333"
DIGEST = hashlib.sha256(("ref-digest-v1\n" + REFERENCE).encode()).hexdigest()


def _progress(path: Path) -> tuple[int, str]:
    with closing(sqlite3.connect(path)) as db:
        return db.execute("PRAGMA user_version").fetchone()[0], db.execute(
            "SELECT progress FROM fixture_state").fetchone()[0]


def _verify_old(db: sqlite3.Connection) -> None:
    assert db.execute("PRAGMA user_version").fetchone()[0] == 1
    assert db.execute("SELECT progress FROM fixture_state").fetchone()[0] == "old"
    references = [row[0] for row in db.execute("SELECT reference FROM fixture_refs")]
    actual = hashlib.sha256(("ref-digest-v1\n" + "\n".join(sorted(set(references)))).encode()).hexdigest()
    assert db.execute("SELECT reference_digest FROM fixture_state").fetchone()[0] == actual


def run(choice: str, inject_restore_failure: bool) -> dict:
    with TemporaryDirectory(prefix="brickhigh-f-save-") as temporary:
        root = Path(temporary)
        current = root / "profile" / "player.db"
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
        recovery = SaveFixtureRecovery(current, root / "backups")
        old_backup = recovery.backup("v1", _verify_old)
        with closing(sqlite3.connect(current)) as db:
            with db:
                db.execute("UPDATE fixture_state SET progress='new'")
                db.execute("PRAGMA user_version=2")
        preserved = None
        failed = False
        if choice == "confirm":
            try:
                preserved = recovery.restore(old_backup, confirmed=True, verify=_verify_old,
                                             fault="staged" if inject_restore_failure else None)
            except RuntimeError:
                if not inject_restore_failure:
                    raise
                failed = True
        elif choice == "cancel":
            recovery.restore(old_backup, confirmed=False, verify=_verify_old)
        current_schema, current_progress = _progress(current)
        return {"fixture": "F-Save", "choice": choice, "restorationFailed": failed,
                "prompt": recovery.restore_prompt(old_backup), "currentSchema": current_schema,
                "currentProgress": current_progress, "originalBackupProgress": _progress(old_backup.path)[1],
                "preservedNewProgress": _progress(preserved.path)[1] if preserved else None}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--choice", choices=("none", "cancel", "confirm"), required=True)
    parser.add_argument("--inject-restore-failure", action="store_true")
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    if args.inject_restore_failure and args.choice != "confirm":
        parser.error("restore failure injection requires --choice confirm")
    report = run(args.choice, args.inject_restore_failure)
    encoded = json.dumps(report, ensure_ascii=False, indent=2)
    if args.output is not None:
        args.output.write_text(encoded + "\n", encoding="utf-8")
    print(encoded)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
