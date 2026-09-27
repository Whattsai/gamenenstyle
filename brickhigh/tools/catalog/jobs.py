"""製作端工作佇列；使用 SQLite 持久化租約與逐件 checkpoint。"""

from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
import hashlib
import math
import os
from pathlib import Path
import re
import sqlite3
import subprocess
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qsl, urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener
from uuid import uuid4

from .policies import CatalogConflict, CatalogError, digest


_SAFE_ID = re.compile(r"^[A-Za-z0-9_.-]{1,128}$")
_REASONS = {"RateLimited", "Unavailable", "Timeout", "WorkerTimeout",
            "WorkerFailed", "WorkerLost", "RetryExhausted"}


class SourceFailure(Exception):
    """外部來源失敗；detail 僅供呼叫端，不寫入工作資料庫。"""

    exit_code = 4

    def __init__(self, reason="Unavailable", *, retry_after=None, detail=None):
        self.reason = reason if reason in _REASONS else "Unavailable"
        self.retry_after = retry_after
        self.detail = detail
        super().__init__(self.reason)


def run_subprocess(command, timeout_seconds=600):
    """對受控命令執行有界 worker；不經 shell 也不保存 stderr。"""
    try:
        result = subprocess.run(command, shell=False, check=False, timeout=timeout_seconds,
                                capture_output=True)
    except subprocess.TimeoutExpired as error:
        raise TimeoutError("worker timeout") from error
    if result.returncode != 0:
        raise RuntimeError("worker failed")
    return {"output_sha256": digest(result.stdout.hex())}


def fetch_source(url, *, token_env=None, timeout_seconds=30):
    """以 Authorization header 讀取來源；只返回內容摘要，不保存 URL 或憑證。"""
    parsed = urlsplit(url)
    sensitive = {"token", "key", "api_key", "access_token", "password", "secret"}
    if (parsed.scheme not in {"http", "https"} or not parsed.hostname or
            parsed.username or parsed.password or
            any(name.lower() in sensitive for name, _ in parse_qsl(parsed.query))):
        raise CatalogError("來源 URL 格式無效或含憑證。")
    token = os.environ.get(token_env) if token_env else None
    if token_env and (not _SAFE_ID.fullmatch(token_env) or not token):
        raise CatalogError("來源憑證環境變數無效。")
    headers = {"Authorization": f"Bearer {token}"} if token else {}

    class NoRedirect(HTTPRedirectHandler):
        def redirect_request(self, *_):
            return None

    try:
        with build_opener(NoRedirect).open(Request(url, headers=headers), timeout=timeout_seconds) as response:
            data = response.read()
    except HTTPError as error:
        if error.code == 429:
            raw = error.headers.get("Retry-After", "")
            try:
                delay = float(raw)
            except ValueError:
                try:
                    delay = max(0, (parsedate_to_datetime(raw) - datetime.now(timezone.utc)).total_seconds())
                except (ValueError, TypeError, OverflowError):
                    delay = None
            raise SourceFailure("RateLimited", retry_after=delay) from None
        raise SourceFailure("Unavailable") from None
    except TimeoutError:
        raise SourceFailure("Timeout") from None
    except URLError as error:
        if isinstance(error.reason, TimeoutError):
            raise SourceFailure("Timeout") from None
        raise SourceFailure("Unavailable") from None
    except OSError:
        raise SourceFailure("Unavailable") from None
    return {"sha256": hashlib.sha256(data).hexdigest(), "bytes": len(data)}


class CatalogJobs:
    """獨立 SQLite 連線的工作排程器；每次狀態變更核對租約 token。"""

    def __init__(self, path, *, clock=None, sleep=None):
        self.path = Path(path).absolute()
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.clock = clock or (lambda: datetime.now(timezone.utc))
        if sleep is None:
            from time import sleep as default_sleep
            sleep = default_sleep
        self.sleep = sleep
        self.connection = sqlite3.connect(self.path, timeout=10, isolation_level=None,
                                          check_same_thread=False)
        self.connection.row_factory = sqlite3.Row
        self.connection.execute("PRAGMA foreign_keys=ON")
        self.connection.execute("PRAGMA busy_timeout=10000")
        self._initialize()

    def __enter__(self):
        return self

    def __exit__(self, *_):
        self.connection.close()

    def _initialize(self):
        # v1 僅補足既有 jobs/job_items 缺少的 fencing 與 checkpoint 欄位。
        self.connection.executescript("""
            CREATE TABLE IF NOT EXISTS jobs (
                job_id TEXT PRIMARY KEY, idempotency_key TEXT NOT NULL UNIQUE,
                input_digest TEXT NOT NULL, kind TEXT NOT NULL, status TEXT NOT NULL,
                lease_until TEXT, attempts INTEGER NOT NULL DEFAULT 0,
                result_json TEXT NOT NULL DEFAULT '{}');
            CREATE TABLE IF NOT EXISTS job_items (
                job_id TEXT NOT NULL REFERENCES jobs, input_digest TEXT NOT NULL,
                status TEXT NOT NULL, result_json TEXT NOT NULL DEFAULT '{}',
                PRIMARY KEY(job_id,input_digest));
            CREATE TABLE IF NOT EXISTS catalog_jobs_meta (
                version INTEGER PRIMARY KEY CHECK(version=1));
            INSERT OR IGNORE INTO catalog_jobs_meta(version) VALUES(1);
            CREATE TABLE IF NOT EXISTS catalog_job_claims (
                job_id TEXT PRIMARY KEY REFERENCES jobs(job_id), token TEXT NOT NULL UNIQUE);
            CREATE TABLE IF NOT EXISTS catalog_job_item_meta (
                job_id TEXT NOT NULL, input_digest TEXT NOT NULL, reason TEXT,
                output_digest TEXT, retry_count INTEGER NOT NULL DEFAULT 0,
                next_retry_at TEXT, checkpoint TEXT,
                PRIMARY KEY(job_id,input_digest),
                FOREIGN KEY(job_id,input_digest) REFERENCES job_items(job_id,input_digest));
        """)

    @contextmanager
    def _write(self):
        self.connection.execute("BEGIN IMMEDIATE")
        try:
            yield
            self.connection.execute("COMMIT")
        except BaseException:
            self.connection.execute("ROLLBACK")
            raise

    def _now(self):
        value = self.clock()
        if value.tzinfo is None or value.utcoffset() is None:
            raise CatalogError("工作時鐘必須含時區。")
        return value.astimezone(timezone.utc)

    def submit(self, key, kind, input_value):
        """同鍵同輸入回原工作；不保存原始輸入或來源憑證。"""
        if not isinstance(key, str) or not _SAFE_ID.fullmatch(key):
            raise CatalogError("工作鍵格式無效。")
        if not isinstance(kind, str) or not _SAFE_ID.fullmatch(kind):
            raise CatalogError("工作種類格式無效。")
        input_hash = digest(input_value)
        with self._write():
            row = self.connection.execute(
                "SELECT job_id,input_digest,kind FROM jobs WHERE idempotency_key=?", (key,)).fetchone()
            if row:
                if row["input_digest"] != input_hash or row["kind"] != kind:
                    raise CatalogConflict("相同工作鍵的輸入已改變。")
                return row["job_id"]
            job_id = str(uuid4())
            self.connection.execute(
                "INSERT INTO jobs(job_id,idempotency_key,input_digest,kind,status) VALUES(?,?,?,?,'Pending')",
                (job_id, key, input_hash, kind))
            return job_id

    def claim(self, job_id, *, lease_seconds=600):
        """以 BEGIN IMMEDIATE 保證跨連線只有一名有效寫入者。"""
        if lease_seconds <= 0:
            raise CatalogError("租約期限必須大於零。")
        now = self._now()
        with self._write():
            row = self.connection.execute("SELECT * FROM jobs WHERE job_id=?", (job_id,)).fetchone()
            if row is None:
                raise CatalogError("找不到工作。")
            if row["status"] == "Completed":
                return None
            active = self.connection.execute(
                "SELECT job_id FROM jobs WHERE status='Running' AND lease_until>? LIMIT 1",
                (now.isoformat(),)).fetchone()
            if active:
                return None
            self.connection.execute("""UPDATE catalog_job_item_meta SET
                reason=CASE WHEN retry_count>=4 THEN 'RetryExhausted' ELSE 'WorkerLost' END
                WHERE job_id=? AND input_digest IN
                (SELECT input_digest FROM job_items WHERE job_id=? AND status='Running')""",
                                    (job_id, job_id))
            self.connection.execute("""UPDATE job_items SET status='Failed'
                WHERE job_id=? AND status='Running'""", (job_id,))
            token = str(uuid4())
            self.connection.execute("INSERT INTO catalog_job_claims(job_id,token) VALUES(?,?) "
                                    "ON CONFLICT(job_id) DO UPDATE SET token=excluded.token", (job_id, token))
            until = (now + timedelta(seconds=lease_seconds)).isoformat()
            self.connection.execute("""UPDATE jobs SET status='Running', lease_until=?,
                attempts=attempts+1 WHERE job_id=?""", (until, job_id))
            return token

    def _owned_job(self, token):
        row = self.connection.execute("""SELECT j.job_id,j.lease_until,j.status FROM jobs j
            JOIN catalog_job_claims c ON c.job_id=j.job_id WHERE c.token=?""", (token,)).fetchone()
        if row is None or row["status"] != "Running" or row["lease_until"] <= self._now().isoformat():
            raise CatalogConflict("工作租約已失效。")
        return row["job_id"]

    def renew(self, token, *, lease_seconds=600):
        if lease_seconds <= 0:
            raise CatalogError("租約期限必須大於零。")
        with self._write():
            job_id = self._owned_job(token)
            self.connection.execute("UPDATE jobs SET lease_until=? WHERE job_id=?",
                                    ((self._now() + timedelta(seconds=lease_seconds)).isoformat(), job_id))

    def begin_item(self, token, input_value):
        """成功 hash 直接復用；失敗或當機項目可重跑。"""
        input_hash = digest(input_value)
        with self._write():
            job_id = self._owned_job(token)
            row = self.connection.execute("""SELECT i.status,m.reason FROM job_items i
                LEFT JOIN catalog_job_item_meta m ON m.job_id=i.job_id AND m.input_digest=i.input_digest
                WHERE i.job_id=? AND i.input_digest=?""", (job_id, input_hash)).fetchone()
            if row and row["status"] == "Done":
                return False
            self.connection.execute("""INSERT INTO job_items(job_id,input_digest,status)
                VALUES(?,?,'Running') ON CONFLICT(job_id,input_digest) DO UPDATE SET status='Running'""",
                                    (job_id, input_hash))
            self.connection.execute("""INSERT INTO catalog_job_item_meta(job_id,input_digest)
                VALUES(?,?) ON CONFLICT(job_id,input_digest) DO UPDATE SET reason=NULL""",
                                    (job_id, input_hash))
            if row and row["status"] == "Failed" and row["reason"] not in {"WorkerLost", "RetryExhausted"}:
                self.connection.execute("""UPDATE catalog_job_item_meta SET retry_count=0,next_retry_at=NULL
                    WHERE job_id=? AND input_digest=?""", (job_id, input_hash))
            return True

    def _end_item(self, token, input_value, status, *, reason=None, output=None):
        input_hash = digest(input_value)
        with self._write():
            job_id = self._owned_job(token)
            row = self.connection.execute("SELECT status FROM job_items WHERE job_id=? AND input_digest=?",
                                          (job_id, input_hash)).fetchone()
            if row is None or row["status"] != "Running":
                raise CatalogConflict("工作項目已由其他 worker 處理。")
            self.connection.execute("UPDATE job_items SET status=? WHERE job_id=? AND input_digest=?",
                                    (status, job_id, input_hash))
            self.connection.execute("""UPDATE catalog_job_item_meta SET reason=?,output_digest=?,
                next_retry_at=CASE WHEN ?='Done' THEN NULL ELSE next_retry_at END
                WHERE job_id=? AND input_digest=?""",
                                    (reason, digest(output) if status == "Done" else None,
                                     status, job_id, input_hash))

    def run_item(self, token, input_value, worker, *, timeout_seconds=600):
        if timeout_seconds <= 0:
            raise CatalogError("worker 時限必須大於零。")
        if not self.begin_item(token, input_value):
            return "Done"
        self.renew(token, lease_seconds=timeout_seconds + 1)
        try:
            output = worker(timeout_seconds)
        except TimeoutError:
            self._end_item(token, input_value, "Failed", reason="WorkerTimeout")
            return "Failed"
        except Exception:
            self._end_item(token, input_value, "Failed", reason="WorkerFailed")
            return "Failed"
        self._end_item(token, input_value, "Done", output=output)
        return "Done"

    def _retry_checkpoint(self, token, input_value, count, delay, reason):
        with self._write():
            job_id = self._owned_job(token)
            try:
                until = (self._now() + timedelta(seconds=delay)).isoformat()
            except OverflowError:
                until = datetime.max.replace(tzinfo=timezone.utc).isoformat()
            self.connection.execute("""UPDATE catalog_job_item_meta SET retry_count=?,
                next_retry_at=?,reason=? WHERE job_id=? AND input_digest=?""",
                                    (count, until, reason, job_id, digest(input_value)))

    def run_source_item(self, token, input_value, source, *, timeout_seconds=600):
        """來源初次呼叫加三次自動重試，每次失敗先提交 checkpoint。"""
        if timeout_seconds <= 0:
            raise CatalogError("來源時限必須大於零。")
        job_id = self._owned_job(token)
        previous = self.connection.execute("""SELECT i.status,m.reason,m.next_retry_at
            FROM job_items i LEFT JOIN catalog_job_item_meta m
            ON m.job_id=i.job_id AND m.input_digest=i.input_digest
            WHERE i.job_id=? AND i.input_digest=?""", (job_id, digest(input_value))).fetchone()
        if previous and previous["status"] == "Failed":
            if previous["next_retry_at"] and previous["next_retry_at"] > self._now().isoformat():
                return "Deferred"
            if previous["reason"] == "RetryExhausted":
                return "Failed"
        if not self.begin_item(token, input_value):
            return "Done"
        job_id = self._owned_job(token)
        checkpoint = self.connection.execute("""SELECT retry_count,next_retry_at
            FROM catalog_job_item_meta WHERE job_id=? AND input_digest=?""",
                                             (job_id, digest(input_value))).fetchone()
        start_retry = checkpoint["retry_count"]
        if start_retry >= 4:
            self._end_item(token, input_value, "Failed", reason="RetryExhausted")
            return "Failed"
        if checkpoint["next_retry_at"]:
            remaining = (datetime.fromisoformat(checkpoint["next_retry_at"]) - self._now()).total_seconds()
            if remaining > 0:
                self.renew(token, lease_seconds=remaining + timeout_seconds + 1)
                self.sleep(remaining)
        for retry in range(start_retry, 4):
            self.renew(token, lease_seconds=timeout_seconds + 1)
            try:
                output = source(timeout_seconds)
            except SourceFailure as error:
                reason = error.reason
                delay = error.retry_after if error.retry_after is not None else min(2 ** retry, 60)
            except TimeoutError:
                reason, delay = "Timeout", min(2 ** retry, 60)
            except Exception:
                reason, delay = "Unavailable", min(2 ** retry, 60)
            else:
                self._end_item(token, input_value, "Done", output=output)
                return "Done"
            if not isinstance(delay, (int, float)) or not math.isfinite(delay) or delay < 0:
                delay = 60
            self._retry_checkpoint(token, input_value, retry + 1, delay, reason)
            if delay > 86400:
                self._end_item(token, input_value, "Failed", reason=reason)
                return "Deferred"
            if retry < 3:
                self.renew(token, lease_seconds=delay + timeout_seconds + 1)
                self.sleep(delay)
        self._end_item(token, input_value, "Failed", reason=reason)
        return "Failed"

    def reset_source_retry(self, token, input_value):
        """人工確認後重設當機前已耗盡的來源重試預算。"""
        with self._write():
            job_id = self._owned_job(token)
            input_hash = digest(input_value)
            row = self.connection.execute("""SELECT i.status,m.reason,m.next_retry_at
                FROM job_items i JOIN catalog_job_item_meta m
                ON m.job_id=i.job_id AND m.input_digest=i.input_digest
                WHERE i.job_id=? AND i.input_digest=?""", (job_id, input_hash)).fetchone()
            if row is None or row["status"] != "Failed" or row["reason"] != "RetryExhausted":
                raise CatalogConflict("工作項目未處於重試耗盡狀態。")
            if row["next_retry_at"] and row["next_retry_at"] > self._now().isoformat():
                raise CatalogConflict("來源重試時間尚未到達。")
            self.connection.execute("""UPDATE catalog_job_item_meta SET reason=NULL,retry_count=0,
                next_retry_at=NULL WHERE job_id=? AND input_digest=?""", (job_id, input_hash))

    def finish(self, token):
        with self._write():
            job_id = self._owned_job(token)
            counts = [row[0] for row in self.connection.execute(
                "SELECT status FROM job_items WHERE job_id=?", (job_id,))]
            status = "Completed" if counts and all(x == "Done" for x in counts) else "Failed"
            self.connection.execute("UPDATE jobs SET status=?,lease_until=NULL WHERE job_id=?",
                                    (status, job_id))
            self.connection.execute("DELETE FROM catalog_job_claims WHERE job_id=?", (job_id,))
            return status

    @contextmanager
    def release_on_error(self, token):
        """調度層失敗時釋放自己的租約；不可覆寫接手 worker 的狀態。"""
        try:
            yield
        except BaseException:
            if token is not None:
                with self._write():
                    row = self.connection.execute("""SELECT j.job_id FROM jobs j
                        JOIN catalog_job_claims c ON j.job_id=c.job_id
                        WHERE c.token=? AND j.status='Running'""", (token,)).fetchone()
                    if row is not None:
                        job_id = row[0]
                        self.connection.execute("""UPDATE catalog_job_item_meta SET reason='WorkerLost'
                            WHERE job_id=? AND input_digest IN
                            (SELECT input_digest FROM job_items WHERE job_id=? AND status='Running')""",
                                                (job_id, job_id))
                        self.connection.execute("UPDATE job_items SET status='Failed' WHERE job_id=? AND status='Running'", (job_id,))
                        self.connection.execute("UPDATE jobs SET status='Failed',lease_until=NULL WHERE job_id=?", (job_id,))
                        self.connection.execute("DELETE FROM catalog_job_claims WHERE job_id=?", (job_id,))
            raise

    def status(self, job_id):
        """只回安全狀態碼、hash 與計數，不回原輸入或例外內容。"""
        row = self.connection.execute("SELECT job_id,kind,status,attempts FROM jobs WHERE job_id=?",
                                      (job_id,)).fetchone()
        if row is None:
            raise CatalogError("找不到工作。")
        items = [dict(record) for record in self.connection.execute("""SELECT i.input_digest,
            i.status,m.reason,m.output_digest,m.retry_count,m.next_retry_at
            FROM job_items i LEFT JOIN catalog_job_item_meta m
            ON m.job_id=i.job_id AND m.input_digest=i.input_digest
            WHERE i.job_id=? ORDER BY i.rowid""", (job_id,))]
        return dict(row, items=items, exit_code=4 if row["status"] == "Failed" else 0)
