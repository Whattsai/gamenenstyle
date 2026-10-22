"""來源重試在真實工作 DB 中保存進度。"""

from datetime import datetime, timedelta, timezone

from tools.catalog.jobs import CatalogJobs, SourceFailure
from tools.catalog.repository import CatalogRepository


class Clock:
    def __init__(self):
        self.now = datetime(2026, 9, 23, tzinfo=timezone.utc)
        self.delays = []

    def __call__(self):
        return self.now

    def sleep(self, seconds):
        self.delays.append(seconds)
        self.now += timedelta(seconds=seconds)


def test_UT_061_SourceRetryPolicy_RateLimitedSource_RespectsRetryLimit(tmp_path):
    clock = Clock()
    with CatalogJobs(tmp_path / "jobs.db", clock=clock, sleep=clock.sleep) as jobs:
        job = jobs.submit("source-1", "import", {"release": 1})
        token = jobs.claim(job)
        calls = []

        def source(_timeout):
            calls.append(1)
            raise SourceFailure("RateLimited", retry_after=7)

        assert jobs.run_source_item(token, {"page": 1}, source) == "Failed"
        assert len(calls) == 4  # 原呼叫及至多三次自動重試
        assert clock.delays == [7, 7, 7]
        assert jobs.status(job)["items"][0]["reason"] == "RateLimited"
        assert jobs.finish(token) == "Failed"
        resumed = jobs.claim(job)
        assert jobs.run_source_item(resumed, {"page": 1}, lambda _: {"parts": ["a"]}) == "Deferred"
        clock.now += timedelta(seconds=7)
        assert jobs.run_source_item(resumed, {"page": 1}, lambda _: {"parts": ["a"]}) == "Done"
        assert jobs.finish(resumed) == "Completed"


def test_UT_062_SourceRetryPolicy_InterruptedImport_PreservesCandidates(tmp_path):
    db = tmp_path / "jobs.db"
    with CatalogRepository(db) as repo:
        part = repo.add_part("fixture", "System", "LEGO-Design:3001")
        variant = repo.add_variant(part, {"color": "red"})
        snapshot = repo.create_snapshot("2026-09-23T00:00:00Z", {"families": ["System"]})
        repo.put_entry(snapshot, variant, [], {"tier": "Basic"},
                       {"name": "fixture", "fixture": True, "designId": "3001", "elementId": "300101"})
    with CatalogJobs(db) as jobs:
        job = jobs.submit("source-2", "import", {"release": 1})
        token = jobs.claim(job)
        assert jobs.run_source_item(token, {"page": 1}, lambda _: {"parts": ["a"]}) == "Done"
        assert jobs.run_source_item(token, {"page": 2},
                                    lambda _: (_ for _ in ()).throw(SourceFailure("Unavailable"))) == "Failed"
        jobs.finish(token)
        items = jobs.status(job)["items"]
        assert [item["status"] for item in items] == ["Done", "Failed"]
        assert items[0]["output_digest"]
    with CatalogRepository(db) as repo:
        assert len(repo.entries(snapshot)) == 1
        assert repo.entries(snapshot)[0]["variant_id"] == variant


def test_UT_063_SourceRetryPolicy_CredentialFailure_RedactsOutput(tmp_path):
    secret = "private-token-123"
    with CatalogJobs(tmp_path / "jobs.db") as jobs:
        job = jobs.submit("source-3", "import", {"credential": secret})
        token = jobs.claim(job)
        assert jobs.run_source_item(token, {"page": 1}, lambda _: (_ for _ in ()).throw(
            SourceFailure("Unavailable", detail=f"https://host/?key={secret}"))) == "Failed"
        jobs.finish(token)
        assert jobs.status(job)["exit_code"] == 4
    assert secret.encode() not in (tmp_path / "jobs.db").read_bytes()


def test_SourceRetryPolicy_CrashAfterCheckpoint_ResumesRemainingBudget(tmp_path):
    clock = Clock()
    db = tmp_path / "jobs.db"
    calls = []

    def source(_):
        calls.append(1)
        raise SourceFailure("RateLimited", retry_after=4)

    with CatalogJobs(db, clock=clock, sleep=lambda _: (_ for _ in ()).throw(SystemExit())) as jobs:
        job = jobs.submit("source-crash", "import", {"release": 1})
        token = jobs.claim(job, lease_seconds=5)
        try:
            jobs.run_source_item(token, {"page": 1}, source)
        except SystemExit:
            pass
        assert jobs.status(job)["items"][0]["retry_count"] == 1

    clock.now += timedelta(seconds=607)
    with CatalogJobs(db, clock=clock, sleep=clock.sleep) as jobs:
        token = jobs.claim(job)
        assert jobs.run_source_item(token, {"page": 1}, source) == "Failed"
        assert len(calls) == 4
        assert jobs.status(job)["items"][0]["retry_count"] == 4


def test_SourceRetryPolicy_LongRetryAfter_RemainsDeferred(tmp_path):
    clock = Clock()
    with CatalogJobs(tmp_path / "jobs.db", clock=clock, sleep=clock.sleep) as jobs:
        job = jobs.submit("long-limit", "import", {"release": 1})
        token = jobs.claim(job)
        calls = []

        def limited(_):
            calls.append(1)
            raise SourceFailure("RateLimited", retry_after=90000)

        assert jobs.run_source_item(token, {"page": 1}, limited) == "Deferred"
        assert calls == [1]
        assert clock.delays == []
        assert jobs.status(job)["items"][0]["next_retry_at"]
        jobs.finish(token)
        token = jobs.claim(job)
        assert jobs.run_source_item(token, {"page": 1}, limited) == "Deferred"
        assert calls == [1]


def test_SourceRetryPolicy_CrashAfterFourthFailure_DoesNotAutoRetry(tmp_path):
    clock = Clock()
    db = tmp_path / "jobs.db"
    calls = []

    def source(_):
        calls.append(1)
        raise SourceFailure("RateLimited", retry_after=0)

    with CatalogJobs(db, clock=clock, sleep=clock.sleep) as jobs:
        job = jobs.submit("final-crash", "import", {"release": 1})
        token = jobs.claim(job)

        def crash(*_, **__):
            raise SystemExit()

        jobs._end_item = crash
        try:
            jobs.run_source_item(token, {"page": 1}, source)
        except SystemExit:
            pass
        assert len(calls) == 4
        assert jobs.status(job)["items"][0]["retry_count"] == 4
    clock.now += timedelta(seconds=602)
    with CatalogJobs(db, clock=clock, sleep=clock.sleep) as jobs:
        token = jobs.claim(job)
        assert jobs.run_source_item(token, {"page": 1}, source) == "Failed"
        assert len(calls) == 4
        assert jobs.status(job)["items"][0]["reason"] == "RetryExhausted"
        jobs.reset_source_retry(token, {"page": 1})
        assert jobs.run_source_item(token, {"page": 1}, lambda _: {"parts": ["a"]}) == "Done"
