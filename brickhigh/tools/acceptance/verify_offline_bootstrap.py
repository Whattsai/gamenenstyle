"""在可恢復的人工探針複本，驗證啟動設定不能觸發遠端請求。"""

import argparse
from contextlib import closing
import hashlib
import json
from pathlib import Path
import shutil
import sqlite3
import subprocess
import sys
import threading
import uuid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def verify(player_directory):
    source = Path(player_directory).resolve(strict=True)
    source_streaming = source / "BrickHighToolchainProbe_Data/StreamingAssets"
    candidates = list(source_streaming.glob("Catalog/*/release-manifest.json"))
    if (source_streaming / "release-manifest.json").is_file():
        candidates.append(source_streaming / "release-manifest.json")
    if len(candidates) != 1:
        raise ValueError("內部探針必須恰有一份人工 catalog。")
    original = candidates[0]
    manifest = json.loads(original.read_text(encoding="utf-8-sig"))
    if manifest.get("purpose") != "F-Catalog" or manifest.get("readyAsset") is not False:
        raise ValueError("只允許人工 F-Catalog 探針，禁止修改正式包。")
    identity = uuid.uuid4().hex[:8]
    destination = source.parent.parent / ("fault-bootstrap-" + identity)
    evidence = source.parent / ("bootstrap-" + identity)
    shutil.copytree(source, destination)
    evidence.mkdir()
    requests = []

    class LocalSink(BaseHTTPRequestHandler):
        def do_GET(self):
            requests.append(self.path)
            self.send_error(404)

        def log_message(self, *args):
            pass

    # 僅監聽回環位址；舊實作即使發出請求也不接觸外部服務。
    server = ThreadingHTTPServer(("127.0.0.1", 0), LocalSink)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        streaming = destination / "BrickHighToolchainProbe_Data/StreamingAssets"
        catalog_root = destination / original.parent.relative_to(source)
        settings = streaming / "aa/settings.json"
        data = json.loads(settings.read_text(encoding="utf-8"))
        data["m_CatalogLocations"][0]["m_InternalId"] = f"http://127.0.0.1:{server.server_port}/catalog.bin"
        settings.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
        pack_settings = catalog_root / "aa/settings.json"
        if pack_settings != settings:
            shutil.copyfile(settings, pack_settings)
        # 同步人工索引，使失敗必須來自啟動政策而非 hash 不一致。
        settings_hash = digest(settings)
        with closing(sqlite3.connect(catalog_root / "catalog.db")) as database:
            with database:
                database.execute("UPDATE runtime_files SET sha256=?,byte_length=? WHERE storage_key='aa/settings.json'",
                                 (settings_hash, settings.stat().st_size))
        for entry in manifest["files"]:
            if entry["storageKey"] == "aa/settings.json":
                entry["sha256"] = settings_hash
                entry["byteLength"] = settings.stat().st_size
        manifest["catalogDbSha256"] = digest(catalog_root / "catalog.db")
        (catalog_root / "release-manifest.json").write_text(json.dumps(manifest, ensure_ascii=False), encoding="utf-8")
        command = [str(destination / "BrickHighToolchainProbe.exe"), "-screen-fullscreen", "0", "-force-d3d11",
                   "-probe-output", str(evidence), "-logFile", str(evidence / "player.log")]
        process = subprocess.Popen(command, creationflags=subprocess.CREATE_NO_WINDOW)
        try:
            exit_code = process.wait(timeout=150)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait()
            raise RuntimeError("僅終止本次逾時探針，故障複本已保留。")
        report = json.loads((evidence / "player-report.json").read_text(encoding="utf-8"))
        passed = (exit_code == 3 and report["failure"] == "FirstAcquire:AssetCorrupt"
                  and report["bundleReadCount"] == 0 and report["allocatedHandleCount"] == 0 and not requests)
        result = {"purpose": "InternalOfflineBootstrapTest", "passed": passed, "requests": requests,
                  "exitCode": exit_code, "failure": report["failure"], "fixture": str(destination)}
        (evidence / "bootstrap-report.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
        print(json.dumps(result, ensure_ascii=False))
        print(f"證據：{evidence}")
        if not passed:
            raise AssertionError("啟動設定未在 Addressables 初始化前被拒絕，或曾送出回環 HTTP 請求。")
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=2)


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--player-directory", required=True)
    verify(parser.parse_args().player_directory)
