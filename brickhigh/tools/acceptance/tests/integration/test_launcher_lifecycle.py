"""使用真實 Windows 子程序驗證共用鎖與一次性啟動權；僅建立隔離人工安裝根。"""

from pathlib import Path
import subprocess
import time

import pytest


@pytest.fixture(scope="module")
def harness(tmp_path_factory):
    root = Path(__file__).resolve().parents[4]
    output = tmp_path_factory.mktemp("launcher-harness")
    result = subprocess.run(["dotnet", "build", str(root / "tools/launcher/AcceptanceHarness.csproj"),
                             "-o", str(output), "--nologo", "--verbosity", "quiet"],
                            capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=90)
    assert result.returncode == 0, result.stdout + result.stderr
    return output / "BrickHigh.LifecycleHarness.exe"


def test_game_and_update_share_cross_process_lock(harness, tmp_path):
    marker = tmp_path / "held"
    profile = tmp_path / "人工profile.db"
    profile.write_bytes(b"keep-new-progress")
    with subprocess.Popen([str(harness), "hold", str(tmp_path), str(marker)],
                          stdout=subprocess.PIPE, stderr=subprocess.PIPE) as holder:
        deadline = time.monotonic() + 15
        while not marker.exists() and holder.poll() is None and time.monotonic() < deadline:
            time.sleep(.02)
        assert marker.exists(), "第一個程序未取得鎖"
        denied = subprocess.run([str(harness), "claim", str(tmp_path)], capture_output=True, timeout=15)
        assert denied.returncode == 7
        (tmp_path / "release").write_bytes(b"release")
        assert holder.wait(timeout=15) == 0
    acquired = subprocess.run([str(harness), "claim", str(tmp_path)], capture_output=True, timeout=15)
    assert acquired.returncode == 0
    assert profile.read_bytes() == b"keep-new-progress"


def test_authority_uses_actual_child_pid_and_rejects_direct_launch(harness, tmp_path):
    authorized = subprocess.run([str(harness), "launch", str(tmp_path)], capture_output=True, timeout=20)
    assert authorized.returncode == 0, authorized.stderr.decode(errors="replace")
    direct = subprocess.run([str(harness), "client", str(tmp_path)], capture_output=True, timeout=15)
    assert direct.returncode == 8
