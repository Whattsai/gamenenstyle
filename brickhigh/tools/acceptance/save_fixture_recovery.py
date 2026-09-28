"""隔離的 F-Save 驗收工具：以 SQLite 一致備份與明確選擇還原。

不搜尋正式玩家資料，也不建立遊戲存檔資料表。
"""

from __future__ import annotations

from contextlib import closing
from dataclasses import dataclass
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import sqlite3
from typing import Callable
from uuid import uuid4


Verify = Callable[[sqlite3.Connection], None]


@dataclass(frozen=True)
class BackupRecord:
    backup_id: str
    path: Path
    label: str
    created_at: str


class SaveFixtureRecovery:
    """只處理明確指定且有 F-Save 標記的人工資料庫。"""

    restore_warning = "還原將回到所選備份的進度；目前資料會另行保留。"

    def __init__(self, current: Path, backups: Path):
        self.current = Path(current)
        self.backups = Path(backups)
        self._assert_fixture(self.current)
        self.backups.mkdir(parents=True, exist_ok=True)

    @staticmethod
    def _assert_fixture(path: Path) -> None:
        try:
            with closing(sqlite3.connect(f"file:{path.as_posix()}?mode=ro", uri=True)) as db:
                marker = db.execute("SELECT purpose FROM fixture_identity").fetchall()
            if marker != [("F-Save",)]:
                raise ValueError("僅接受 F-Save 人工資料庫。")
        except sqlite3.DatabaseError as error:
            raise ValueError("僅接受 F-Save 人工資料庫。") from error

    def last_good(self) -> BackupRecord | None:
        pointer = self.backups / "last-good.json"
        if not pointer.exists():
            return None
        data = json.loads(pointer.read_text(encoding="utf-8"))
        record = BackupRecord(data["backup_id"], self.backups / (data["backup_id"] + ".db"),
                              data["label"], data["created_at"])
        if not record.path.is_file():
            raise RuntimeError("最後完整備份遺失。")
        return record

    @staticmethod
    def _check(db: sqlite3.Connection, verify: Verify | None) -> None:
        if db.execute("PRAGMA integrity_check").fetchone()[0] != "ok":
            raise RuntimeError("備份資料庫損毀。")
        if verify is not None:
            verify(db)

    def backup(self, label: str, verify: Verify | None, *, fault: str | None = None) -> BackupRecord:
        """用備份 API 擷取已提交的 WAL 頁面，驗證通過才更新最後良好指標。"""
        self._assert_fixture(self.current)
        backup_id = uuid4().hex
        temporary = self.backups / (backup_id + ".tmp.db")
        final = self.backups / (backup_id + ".db")
        pointer_temp = self.backups / (backup_id + ".pointer.tmp")
        record = BackupRecord(backup_id, final, label, datetime.now(timezone.utc).isoformat())
        try:
            with closing(sqlite3.connect(self.current)) as source, closing(sqlite3.connect(temporary)) as target:
                source.backup(target)
            if fault == "copied":
                raise RuntimeError("injected copy interruption")
            with closing(sqlite3.connect(f"file:{temporary.as_posix()}?mode=ro", uri=True)) as copied:
                self._check(copied, verify)
            if fault == "validated":
                raise RuntimeError("injected validation interruption")
            pointer_temp.write_text(json.dumps({"backup_id": backup_id, "label": label,
                                                "created_at": record.created_at}), encoding="utf-8")
            if fault == "committing":
                raise RuntimeError("injected commit interruption")
            os.replace(temporary, final)
            os.replace(pointer_temp, self.backups / "last-good.json")
            return record
        finally:
            temporary.unlink(missing_ok=True)
            pointer_temp.unlink(missing_ok=True)

    def migrate(self, label: str, verify_backup: Verify, migration: Callable[[sqlite3.Connection], None]) -> BackupRecord:
        """在單一遷移交易前建立可獨立讀取的完整備份。"""
        record = self.backup(label, verify_backup)
        with closing(sqlite3.connect(self.current)) as db:
            db.execute("BEGIN IMMEDIATE")
            try:
                migration(db)
                db.execute("COMMIT")
            except BaseException:
                db.execute("ROLLBACK")
                raise
        return record

    def restore_prompt(self, selected: BackupRecord) -> str:
        return f"備份版本 {selected.label}；時間 {selected.created_at}。{self.restore_warning}"

    def restore(self, selected: BackupRecord, *, confirmed: bool, verify: Verify,
                fault: str | None = None) -> BackupRecord | None:
        """未確認不讀寫；確認後先保留新進度的不可變副本。"""
        if not confirmed:
            return None
        if selected.path.parent != self.backups or selected.path.name != selected.backup_id + ".db":
            raise ValueError("備份位置不屬於人工 fixture。")
        self._assert_fixture(selected.path)
        with closing(sqlite3.connect(f"file:{selected.path.as_posix()}?mode=ro", uri=True)) as source:
            self._check(source, verify)
        preserved = self.backup("preserved-current", None)
        staged = self.current.with_name(self.current.name + ".restore-" + uuid4().hex)
        try:
            with closing(sqlite3.connect(f"file:{selected.path.as_posix()}?mode=ro", uri=True)) as source, closing(sqlite3.connect(staged)) as target:
                source.backup(target)
            with closing(sqlite3.connect(f"file:{staged.as_posix()}?mode=ro", uri=True)) as checked:
                self._check(checked, verify)
            if fault == "staged":
                raise RuntimeError("injected restore interruption")
            # 切換前關閉 WAL，避免新主檔誤配舊日誌。
            with closing(sqlite3.connect(self.current)) as current:
                current.execute("PRAGMA wal_checkpoint(TRUNCATE)")
                current.execute("PRAGMA journal_mode=DELETE")
            os.replace(staged, self.current)
            return preserved
        finally:
            staged.unlink(missing_ok=True)
