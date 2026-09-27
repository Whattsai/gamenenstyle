"""真實 SQLite 關閉、重開與雙連線搶佔。"""

from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import sys
from threading import Thread
import time

import pytest

from tools.catalog.jobs import CatalogJobs, fetch_source, run_subprocess
from tools.catalog.policies import CatalogError


class Clock:
    now = datetime(2026, 9, 23, tzinfo=timezone.utc)

    def __call__(self):
        return self.now


def test_scheduler_cleanup_cannot_release_replacement_worker(tmp_path):
    clock = Clock()
    database = tmp_path / "jobs.sqlite"
    with CatalogJobs(database, clock=clock) as old, CatalogJobs(database, clock=clock) as new:
        job = old.submit("replacement", "build", {})
        token = old.claim(job, lease_seconds=1)
        old.begin_item(token, {"model": 1})
        with pytest.raises(RuntimeError):
            with old.release_on_error(token):
                clock.now += timedelta(seconds=2)
                replacement = new.claim(job)
                assert replacement is not None
                assert new.begin_item(replacement, {"model": 1})
                raise RuntimeError("舊 worker 晚到的失敗")
        assert new.status(job)["status"] == "Running"
        new._end_item(replacement, {"model": 1}, "Done", output={})
        assert new.finish(replacement) == "Completed"


def test_IT_006_JobRecovery_ReopenAndConcurrentClaim(tmp_path):
    db = tmp_path / "catalog.db"
    clock = Clock()
    with CatalogJobs(db, clock=clock) as jobs:
        job = jobs.submit("release-1", "build", {"snapshot": "s1"})
        token = jobs.claim(job, lease_seconds=5)
        assert jobs.run_item(token, {"part": "a"}, lambda _: {"glb": "a"}) == "Done"
        # 第二件開始後模擬程序直接結束，沒有 finish。
        jobs.begin_item(token, {"part": "b"})

    clock.now += timedelta(seconds=602)

    def compete(_):
        with CatalogJobs(db, clock=clock) as contender:
            return contender.claim(job)

    with ThreadPoolExecutor(max_workers=2) as pool:
        claims = list(pool.map(compete, range(2)))
    assert len([claim for claim in claims if claim]) == 1
    with CatalogJobs(db, clock=clock) as jobs:
        fresh = next(claim for claim in claims if claim)
        assert jobs.status(job)["items"][1]["reason"] == "WorkerLost"
        calls = []
        assert jobs.run_item(fresh, {"part": "a"}, lambda _: calls.append("again")) == "Done"
        assert not calls
        assert jobs.run_item(fresh, {"part": "b"}, lambda _: {"glb": "b"}) == "Done"
        jobs.finish(fresh)
        assert jobs.status(job)["status"] == "Completed"


def test_IT_006_JobRecovery_RealWorkerTimeoutIsIsolated(tmp_path):
    with CatalogJobs(tmp_path / "catalog.db") as jobs:
        job = jobs.submit("worker-process", "build", {"snapshot": "s1"})
        token = jobs.claim(job)
        assert jobs.run_item(token, {"part": "hang"}, lambda timeout: run_subprocess(
            [sys.executable, "-c", "import time; time.sleep(5)"], timeout_seconds=0.05)) == "Failed"
        assert jobs.run_item(token, {"part": "next"}, lambda timeout: run_subprocess(
            [sys.executable, "-c", "print('ok')"], timeout_seconds=timeout)) == "Done"
        assert jobs.status(job)["items"][0]["reason"] == "WorkerTimeout"


def test_IT_013_ExternalRetry_Http429CheckpointAndHeaderSecret(tmp_path, monkeypatch):
    class Handler(BaseHTTPRequestHandler):
        calls = 0
        headers_seen = []

        def do_GET(self):
            type(self).calls += 1
            type(self).headers_seen.append(self.headers.get("Authorization"))
            if type(self).calls < 3:
                self.send_response(429)
                self.send_header("Retry-After", "4")
                self.end_headers()
            else:
                self.send_response(200)
                self.end_headers()
                self.wfile.write(b"source-page")

        def log_message(self, *_):
            pass

    server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        clock = Clock()
        delays = []

        def sleep(seconds):
            delays.append(seconds)
            clock.now += timedelta(seconds=seconds)

        secret = "local-secret-123"
        monkeypatch.setenv("BRICKHIGH_TEST_SOURCE_TOKEN", secret)
        db = tmp_path / "catalog.db"
        url = f"http://127.0.0.1:{server.server_port}/parts"
        with CatalogJobs(db, clock=clock, sleep=sleep) as jobs:
            job = jobs.submit("remote-page", "import", {"release": 1})
            token = jobs.claim(job)
            assert jobs.run_source_item(token, {"page": 1},
                                        lambda timeout: fetch_source(
                                            url, token_env="BRICKHIGH_TEST_SOURCE_TOKEN",
                                            timeout_seconds=timeout)) == "Done"
            jobs.finish(token)
        with CatalogJobs(db, clock=clock) as jobs:
            assert jobs.status(job)["items"][0]["retry_count"] == 2
            assert jobs.status(job)["status"] == "Completed"
        assert delays == [4, 4]
        assert Handler.headers_seen == [f"Bearer {secret}"] * 3
        assert secret.encode() not in db.read_bytes()
        assert url.encode() not in db.read_bytes()
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=2)


def test_IT_013_ExternalRetry_HttpTimeoutAndCredentialUrlRejected(tmp_path):
    class SlowHandler(BaseHTTPRequestHandler):
        def do_GET(self):
            time.sleep(0.1)
            try:
                self.send_response(200)
                self.end_headers()
            except OSError:
                pass

        def log_message(self, *_):
            pass

    server = ThreadingHTTPServer(("127.0.0.1", 0), SlowHandler)
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        url = f"http://127.0.0.1:{server.server_port}/parts"
        with pytest.raises(CatalogError):
            fetch_source(url + "?api_key=secret")
        clock = Clock()

        def sleep(seconds):
            clock.now += timedelta(seconds=seconds)

        with CatalogJobs(tmp_path / "catalog.db", clock=clock, sleep=sleep) as jobs:
            job = jobs.submit("timeout-page", "import", {"release": 1})
            token = jobs.claim(job)
            assert jobs.run_source_item(token, {"page": 1},
                                        lambda _: fetch_source(url, timeout_seconds=0.01)) == "Failed"
            jobs.finish(token)
            assert jobs.status(job)["items"][0]["reason"] == "Timeout"
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=2)
