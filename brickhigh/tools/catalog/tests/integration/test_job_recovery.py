"""IT-006：指定盒組增量快照、冪等重建與真實 worker／租約恢復矩陣。"""

from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone
from copy import deepcopy
import shutil

import pytest

from tools.catalog.building import revision_input_digest
from tools.catalog.jobs import CatalogJobs, run_subprocess
from tools.catalog.policies import CatalogConflict
from tools.catalog.repository import CatalogRepository


class Clock:
    now = datetime(2026, 9, 23, tzinfo=timezone.utc)

    def __call__(self):
        return self.now


def _published_parent(database):
    """只建立 SC-011 的 Published 前置；發布門檻本身由 IT-002 驗證。"""
    with CatalogRepository(database) as repo:
        part = repo.add_part("既有基本磚", "System", "LEGO-Design:3001")
        variant = repo.add_variant(part, {"color": "4", "material": "plastic"})
        snapshot = repo.create_snapshot("2026-09-08T15:59:59Z", {"families": ["System"]})
        repo.put_entry(
            snapshot,
            variant,
            ["existing-evidence"],
            {"tier": "Basic", "reason": "existing published fixture"},
            {"name": "既有基本磚", "fixture": True, "designId": "3001", "elementId": "300101"},
        )
        repo.freeze(snapshot, repo.snapshot(snapshot)["version"])
        # Arrange only：SC-011 從「已有 Published」開始，正式 publish gate 不屬 IT-006。
        repo.connection.execute("UPDATE snapshots SET status='Published' WHERE snapshot_id=?", (snapshot,))
        return snapshot, variant


def test_IT_006_RunJobRecovery_ScenarioMatrix_PreservesContract(tmp_path):
    database = tmp_path / "catalog.sqlite"
    parent, _ = _published_parent(database)
    with CatalogRepository(database) as repo:
        parent_before = repo.snapshot(parent)
        parent_entries_before = repo.entries(parent)

        # 新盒組可在同一 catalog baseline 建立後繼快照；不再依零件上市／停產日期決定收錄資格。
        successor = repo.fork(parent, parent_before["baseline_at"])
        new_part = repo.add_part("BRICK 1X2 W. 2 KNOBS", "System", "LEGO-Design:11211")
        new_variant = repo.add_variant(new_part, {"color": "Medium Nougat", "material": "plastic"})
        repo.put_entry(
            successor,
            new_variant,
            ["set-membership-evidence"],
            {"tier": "Basic", "reason": "explicit set inventory"},
            {"name": "BRICK 1X2 W. 2 KNOBS", "fixture": True,
             "designId": "11211", "elementId": "6411587", "setNumber": "10334"},
        )

        assert repo.snapshot(parent) == parent_before
        assert repo.entries(parent) == parent_entries_before
        assert repo.snapshot(successor)["parent_id"] == parent
        assert repo.snapshot(successor)["baseline_at"] == parent_before["baseline_at"]
        assert new_variant not in {row["variant_id"] for row in repo.entries(parent)}
        assert new_variant in {row["variant_id"] for row in repo.entries(successor)}

        item = {
            "variantId": new_variant,
            "part": "3001.dat",
            "colour": "1",
            "metadata": {"path": "metadata.json", "sha256": "a" * 64},
        }
        toolchain = {"importerCommit": "b" * 40, "scripts": {"building.py": "c" * 64}}
        source = {"filename": "3001.dat", "dependencyDigest": "d" * 64}
        predecessor_digest = revision_input_digest(item, toolchain, source)
        predecessor = repo.start_revision(new_variant, predecessor_digest, toolchain)
        predecessor_row = dict(repo.connection.execute(
            "SELECT * FROM model_revisions WHERE revision_id=?", (predecessor,)
        ).fetchone())

        changed_source = deepcopy(source)
        changed_source["dependencyDigest"] = "e" * 64
        successor_digest = revision_input_digest(item, toolchain, changed_source)
        changed_revision = repo.start_revision(new_variant, successor_digest, toolchain)

        assert changed_revision != predecessor
        assert dict(repo.connection.execute(
            "SELECT * FROM model_revisions WHERE revision_id=?", (predecessor,)
        ).fetchone()) == predecessor_row

    with CatalogJobs(database) as jobs:
        input_value = {"snapshot": successor, "variant": new_variant, "revision": changed_revision}
        first_job = jobs.submit("sc011-set-part-build", "build", input_value)
        assert jobs.submit("sc011-set-part-build", "build", deepcopy(input_value)) == first_job
        with pytest.raises(CatalogConflict) as conflict:
            jobs.submit(
                "sc011-set-part-build",
                "build",
                {"snapshot": successor, "variant": new_variant, "revision": predecessor},
            )
        assert conflict.value.exit_code == 5


def test_IT_006_JobRecovery_ExpiredLeaseAllowsOnlyOneReplacement(tmp_path):
    database = tmp_path / "jobs.sqlite"
    clock = Clock()
    with CatalogJobs(database, clock=clock) as jobs:
        job = jobs.submit("lease-recovery", "build", {"snapshot": "s1"})
        token = jobs.claim(job, lease_seconds=5)
        assert jobs.run_item(token, {"part": "done"}, lambda _: {"glb": "done"}) == "Done"
        jobs.begin_item(token, {"part": "interrupted"})

    clock.now += timedelta(seconds=602)

    def compete(_):
        with CatalogJobs(database, clock=clock) as contender:
            return contender.claim(job)

    with ThreadPoolExecutor(max_workers=2) as pool:
        claims = list(pool.map(compete, range(2)))

    live_claims = [claim for claim in claims if claim]
    assert len(live_claims) == 1
    with CatalogJobs(database, clock=clock) as jobs:
        replacement = live_claims[0]
        status = jobs.status(job)
        assert status["items"][1]["reason"] == "WorkerLost"
        calls = []
        assert jobs.run_item(replacement, {"part": "done"}, lambda _: calls.append("unexpected")) == "Done"
        assert calls == []
        assert jobs.run_item(replacement, {"part": "interrupted"}, lambda _: {"glb": "recovered"}) == "Done"
        assert jobs.finish(replacement) == "Completed"


def test_IT_006_JobRecovery_RealBlenderWorkerTimeoutIsIsolated(tmp_path):
    blender = shutil.which("blender")
    assert blender is not None, "IT-006 需要實際 Blender worker，不能以 stub 或 skip 冒充。"

    with CatalogJobs(tmp_path / "jobs.sqlite") as jobs:
        job = jobs.submit("real-blender-timeout", "build", {"snapshot": "s1"})
        token = jobs.claim(job)
        assert jobs.run_item(
            token,
            {"part": "timeout"},
            lambda _: run_subprocess(
                [
                    blender,
                    "--background",
                    "--factory-startup",
                    "--disable-autoexec",
                    "--python-expr",
                    "import time; time.sleep(5)",
                ],
                timeout_seconds=0.1,
            ),
        ) == "Failed"
        assert jobs.status(job)["items"][0]["reason"] == "WorkerTimeout"

        assert jobs.run_item(
            token,
            {"part": "next"},
            lambda _: run_subprocess([blender, "--version"], timeout_seconds=30),
        ) == "Done"
        # 單一 item timeout 必須保留失敗事實；後續獨立 item 可成功，但整體 job 仍為 Failed。
        assert jobs.finish(token) == "Failed"
