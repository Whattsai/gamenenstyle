"""開發端 SQLite repository；發布必須在同一寫入交易核對快照及 head。"""

from contextlib import contextmanager
import json
from pathlib import Path
import sqlite3
from uuid import uuid4

from .policies import (CatalogConflict, CatalogCoveragePolicy, CatalogError, GateNotMet,
                       VariantIdentityPolicy, canonical_json, digest, utc_time)


class CatalogRepository:
    """管理來源快照；不讀取或建立任何玩家資料庫。"""

    def __init__(self, path):
        self.path = Path(path).absolute()
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.connection = sqlite3.connect(self.path, timeout=10, isolation_level=None)
        self.connection.row_factory = sqlite3.Row
        self.connection.execute("PRAGMA foreign_keys=ON")
        self.connection.execute("PRAGMA busy_timeout=10000")
        self.connection.executescript(Path(__file__).with_name("schema.sql").read_text(encoding="utf-8"))

    def __enter__(self):
        return self

    def __exit__(self, *_):
        self.connection.close()

    @contextmanager
    def transaction(self):
        """單一寫入者交易；錯誤時保留原 head 與所有已提交資料。"""
        self.connection.execute("BEGIN IMMEDIATE")
        try:
            yield
            self.connection.execute("COMMIT")
        except BaseException:
            self.connection.execute("ROLLBACK")
            raise

    def add_part(self, name, family, geometry_identity):
        part_id = str(uuid4())
        self.connection.execute("INSERT OR IGNORE INTO parts(part_id,name,family,geometry_identity) VALUES(?,?,?,?)",
                                (part_id, name, family, geometry_identity))
        return self.connection.execute("SELECT part_id FROM parts WHERE geometry_identity=?", (geometry_identity,)).fetchone()[0]

    def add_variant(self, part_id, appearance):
        key = VariantIdentityPolicy.key(appearance)
        variant_id = VariantIdentityPolicy.stable_id(part_id, appearance)
        self.connection.execute("INSERT OR IGNORE INTO variants VALUES(?,?,?,?)",
                                (variant_id, part_id, key, canonical_json(appearance)))
        return self.connection.execute("SELECT variant_id FROM variants WHERE part_id=? AND variant_key=?", (part_id, key)).fetchone()[0]

    def create_snapshot(self, baseline, scope, parent=None):
        utc_time(baseline)
        snapshot = str(uuid4())
        self.connection.execute("INSERT INTO snapshots(snapshot_id,baseline_at,parent_id,status,scope_manifest_json) VALUES(?,?,?,'Draft',?)",
                                (snapshot, baseline, parent, canonical_json(scope)))
        return snapshot

    def snapshot(self, snapshot):
        row = self.connection.execute("SELECT * FROM snapshots WHERE snapshot_id=?", (snapshot,)).fetchone()
        if row is None:
            raise CatalogError("找不到指定快照。")
        return dict(row)

    def _require(self, snapshot, statuses):
        row = self.snapshot(snapshot)
        if row["status"] not in statuses:
            raise CatalogConflict("快照狀態不允許此變更，請建立後繼草稿。")
        return row

    def put_entry(self, snapshot, variant, status, evidence_ids, classification, projection):
        with self.transaction():
            self._require(snapshot, {"Draft"})
            self.connection.execute("""INSERT INTO snapshot_entries VALUES(?,?,?,?,?,?,NULL)
                ON CONFLICT(snapshot_id,variant_id) DO UPDATE SET production_status=excluded.production_status,
                evidence_ids_json=excluded.evidence_ids_json,classification_json=excluded.classification_json,
                display_projection_json=excluded.display_projection_json""",
                (snapshot, variant, status, canonical_json(evidence_ids), canonical_json(classification), canonical_json(projection)))
            self.connection.execute("UPDATE snapshots SET version=version+1 WHERE snapshot_id=?", (snapshot,))

    def review_scope(self, snapshot, review):
        if not review.get("reviewer") or not review.get("artifact"):
            raise CatalogError("涵蓋審查需有審查者及來源紀錄。")
        with self.transaction():
            self._require(snapshot, {"Draft"})
            self.connection.execute("UPDATE snapshots SET coverage_review_json=?,version=version+1 WHERE snapshot_id=?",
                                    (canonical_json(review), snapshot))

    def entries(self, snapshot):
        return [dict(row) for row in self.connection.execute("""SELECT e.*,v.part_id,r.status AS revision_status,
            r.validation_json FROM snapshot_entries e JOIN variants v ON v.variant_id=e.variant_id
            LEFT JOIN model_revisions r ON r.revision_id=e.selected_revision_id
            WHERE e.snapshot_id=? ORDER BY e.variant_id""", (snapshot,))]

    def freeze(self, snapshot, expected_version):
        with self.transaction():
            row = self._require(snapshot, {"Draft"})
            if row["version"] != expected_version:
                raise CatalogConflict("快照版本已改變。")
            self.connection.execute("UPDATE snapshots SET status='Frozen',version=version+1 WHERE snapshot_id=?", (snapshot,))

    def fork(self, snapshot, baseline):
        original = self.snapshot(snapshot)
        if utc_time(baseline) < utc_time(original["baseline_at"]):
            raise CatalogError("後繼快照基準日不可早於原快照。")
        with self.transaction():
            successor = self.create_snapshot(baseline, json.loads(original["scope_manifest_json"]), snapshot)
            self.connection.execute("""INSERT INTO snapshot_entries SELECT ?,variant_id,production_status,
                evidence_ids_json,classification_json,display_projection_json,selected_revision_id
                FROM snapshot_entries WHERE snapshot_id=?""", (successor, snapshot))
            self.connection.execute("""UPDATE snapshots SET compatibility_profiles_json=? WHERE snapshot_id=?""",
                                    (original["compatibility_profiles_json"], successor))
            for row in self.connection.execute("SELECT * FROM coverage_gaps WHERE snapshot_id=?", (snapshot,)).fetchall():
                self.connection.execute("INSERT INTO coverage_gaps VALUES(?,?,?,?,?,?)",
                                        (str(uuid4()), successor, row["source"], row["family"], row["kind"], row["resolution_evidence_id"]))
            return successor

    def start_revision(self, variant, input_digest, toolchain):
        revision = str(uuid4())
        self.connection.execute("""INSERT OR IGNORE INTO model_revisions
            (revision_id,variant_id,input_digest,toolchain_json,status) VALUES(?,?,?,?,'Pending')""",
            (revision, variant, input_digest, canonical_json(toolchain)))
        return self.connection.execute("SELECT revision_id FROM model_revisions WHERE variant_id=? AND input_digest=?",
                                       (variant, input_digest)).fetchone()[0]

    def transition_revision(self, revision, target, report=None, manifest=None):
        with self.transaction():
            row = self.connection.execute("SELECT * FROM model_revisions WHERE revision_id=?", (revision,)).fetchone()
            allowed = {"Pending": {"Building", "Failed"}, "Building": {"Validating", "Failed"},
                       "Validating": {"Ready", "Failed"}, "Failed": {"Building"}, "Ready": set()}
            if row is None or target not in allowed[row["status"]]:
                raise GateNotMet("模型必須依序建置與驗證。")
            if target == "Ready" and (not report or report.get("quality_passed") is not True
                                      or report.get("provenance_passed") is not True or not report.get("evidence_digest")):
                raise GateNotMet("模型尚無完整品質及來源報告。")
            self.connection.execute("UPDATE model_revisions SET status=?,validation_json=?,manifest_json=? WHERE revision_id=?",
                                    (target, canonical_json(report or {}), canonical_json(manifest or {}), revision))

    def select_revision(self, snapshot, variant, revision):
        with self.transaction():
            self._require(snapshot, {"Frozen"})
            row = self.connection.execute("SELECT * FROM model_revisions WHERE revision_id=? AND variant_id=?", (revision, variant)).fetchone()
            if row is None or row["status"] != "Ready":
                raise GateNotMet("所選版本不屬於此變體或尚未通過驗證。")
            changed = self.connection.execute("UPDATE snapshot_entries SET selected_revision_id=? WHERE snapshot_id=? AND variant_id=?",
                                              (revision, snapshot, variant)).rowcount
            if changed != 1:
                raise CatalogError("變體不在此快照中。")
            self.connection.execute("UPDATE snapshots SET version=version+1 WHERE snapshot_id=?", (snapshot,))

    def selection_digest(self, snapshot):
        row = self.snapshot(snapshot)
        return digest({"snapshot": snapshot, "version": row["version"], "scope": row["scope_manifest_json"],
                       "review": row["coverage_review_json"], "profiles": row["compatibility_profiles_json"],
                       "entries": self.entries(snapshot)})

    def record_validation(self, snapshot, target, toolchain_digest, result_digest, revisions):
        with self.transaction():
            row = self._require(snapshot, {"Frozen"})
            selected = {entry["selected_revision_id"] for entry in self.entries(snapshot) if entry["revision_status"] == "Ready"}
            if not revisions or not set(revisions).issubset(selected):
                raise GateNotMet("驗證結果包含未選定或未完成版本。")
            identity = (snapshot, row["version"], self.selection_digest(snapshot), toolchain_digest, target, result_digest)
            build = str(uuid4())
            self.connection.execute("INSERT OR IGNORE INTO validation_builds VALUES(?,?,?,?,?,?,?,'Passed',?)",
                                    (build, *identity, canonical_json(sorted(set(revisions)))))
            return self.connection.execute("""SELECT build_id FROM validation_builds WHERE snapshot_id=? AND snapshot_version=?
                AND selection_digest=? AND toolchain_digest=? AND target=? AND result_digest=?""", identity).fetchone()[0]

    def coverage(self, snapshot):
        rows = []
        for entry in self.entries(snapshot):
            validation = json.loads(entry["validation_json"] or "{}")
            classification = json.loads(entry["classification_json"])
            projection = json.loads(entry["display_projection_json"])
            rows.append(dict(entry, ready=entry["revision_status"] == "Ready",
                             classified=classification.get("tier") in {"Basic", "Advanced", "Special"} and bool(classification.get("reason")),
                             quality_passed=validation.get("quality_passed", False),
                             provenance_passed=validation.get("provenance_passed", False), fixture=projection.get("fixture", False)))
        gaps = [dict(row) for row in self.connection.execute("SELECT * FROM coverage_gaps WHERE snapshot_id=? AND resolution_evidence_id IS NULL", (snapshot,))]
        review = json.loads(self.snapshot(snapshot)["coverage_review_json"])
        return CatalogCoveragePolicy.evaluate(rows, gaps, bool(review.get("reviewer") and review.get("artifact")))

    def head(self):
        return dict(self.connection.execute("SELECT snapshot_id,version FROM catalog_head WHERE id=1").fetchone())

    def publish(self, snapshot, expected_head_version, build, target, toolchain_digest):
        with self.transaction():
            if self.head()["version"] != expected_head_version:
                raise CatalogConflict("正式版本已被另一工作更新。")
            row = self._require(snapshot, {"Frozen"})
            report = self.coverage(snapshot)
            if not report["release_allowed"]:
                raise GateNotMet("全量来源或逐件品質門檻未完成。")
            validation = self.connection.execute("SELECT * FROM validation_builds WHERE build_id=?", (build,)).fetchone()
            if validation is None or any(validation[key] != value for key, value in {
                "snapshot_id": snapshot, "snapshot_version": row["version"], "selection_digest": self.selection_digest(snapshot),
                "toolchain_digest": toolchain_digest, "target": target, "status": "Passed"}.items()):
                raise GateNotMet("建置驗證的版本、選件、工具或平台不相符。")
            required = {entry["selected_revision_id"] for entry in self.entries(snapshot) if entry["production_status"] == "Active"}
            if not required.issubset(set(json.loads(validation["revisions_json"]))):
                raise GateNotMet("正式平台仍有未驗證模型。")
            self.connection.execute("UPDATE snapshots SET status='Published',published_build_id=? WHERE snapshot_id=?", (build, snapshot))
            self.connection.execute("UPDATE catalog_head SET snapshot_id=?,version=version+1 WHERE id=1 AND version=?", (snapshot, expected_head_version))
