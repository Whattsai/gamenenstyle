"""工作租約、逐項恢復與冪等衝突。"""

from datetime import datetime, timedelta, timezone

import pytest

from tools.catalog.jobs import CatalogJobs
from tools.catalog.policies import CatalogConflict


class Clock:
    now = datetime(2026, 9, 23, tzinfo=timezone.utc)

    def __call__(self):
        return self.now


def test_UT_064_CatalogJobPolicy_WorkerTimeout_FailsOnlyItem(tmp_path):
    with CatalogJobs(tmp_path / "jobs.db") as jobs:
        job = jobs.submit("build-1", "build", {"snapshot": 1})
        token = jobs.claim(job)
        assert jobs.run_item(token, {"part": 1}, lambda _: (_ for _ in ()).throw(TimeoutError())) == "Failed"
        assert jobs.run_item(token, {"part": 2}, lambda _: {"mesh": "ok"}) == "Done"
        assert [row["status"] for row in jobs.status(job)["items"]] == ["Failed", "Done"]


def test_UT_065_CatalogJobPolicy_CompletedInput_ReusesResult(tmp_path):
    db = tmp_path / "jobs.db"
    with CatalogJobs(db) as jobs:
        job = jobs.submit("build-2", "build", {"snapshot": 1})
        token = jobs.claim(job)
        calls = []

        def build(_):
            calls.append(1)
            return {"mesh": "ok"}

        assert jobs.run_item(token, {"part": 1}, build) == "Done"
        assert jobs.run_item(token, {"part": 1}, build) == "Done"
        assert calls == [1]
        jobs.finish(token)
        original_digest = jobs.status(job)["items"][0]["output_digest"]
    with CatalogJobs(db) as jobs:
        assert jobs.submit("build-2", "build", {"snapshot": 1}) == job
        assert jobs.claim(job) is None
        assert jobs.status(job)["items"][0]["output_digest"] == original_digest


def test_UT_066_CatalogJobPolicy_JobConflict_ReturnsExitFive(tmp_path):
    clock = Clock()
    db = tmp_path / "jobs.db"
    with CatalogJobs(db, clock=clock) as jobs:
        job = jobs.submit("build-3", "build", {"snapshot": 1})
        old = jobs.claim(job, lease_seconds=5)
        with pytest.raises(CatalogConflict) as error:
            jobs.submit("build-3", "build", {"snapshot": 2})
        assert error.value.exit_code == 5
        clock.now += timedelta(seconds=6)
        new = jobs.claim(job)
        assert new != old
        with pytest.raises(CatalogConflict):
            jobs.run_item(old, {"part": 1}, lambda _: {})
        assert jobs.status(job)["attempts"] == 2


def test_CatalogJobPolicy_WorkerLeaseCoversConfiguredTimeout(tmp_path):
    clock = Clock()
    with CatalogJobs(tmp_path / "jobs.db", clock=clock) as jobs:
        job = jobs.submit("lease-worker", "build", {"snapshot": 1})
        token = jobs.claim(job, lease_seconds=5)

        def worker(_timeout):
            clock.now += timedelta(seconds=6)
            return {"mesh": "ok"}

        assert jobs.run_item(token, {"part": 1}, worker, timeout_seconds=10) == "Done"
