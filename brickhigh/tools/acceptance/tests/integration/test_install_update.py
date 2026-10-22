"""隔離暫存安裝根的 Windows 安裝與更新驗收。"""

import hashlib
import json
import subprocess
import time
from pathlib import Path

import pytest


ROOT = Path(__file__).resolve().parents[4]
INSTALLER = ROOT / "tools" / "installer" / "InstallerHarness.csproj"
LAUNCH_HARNESS = ROOT / "tools" / "launcher" / "AcceptanceHarness.csproj"


@pytest.fixture(scope="session")
def harness():
    subprocess.run(["dotnet", "build", str(INSTALLER), "-c", "Release", "--nologo", "--verbosity", "quiet"],
                   check=True, cwd=ROOT)
    return ROOT / "tools" / "installer" / "bin" / "Release" / "net10.0-windows" / "BrickHigh.InstallerHarness.dll"


@pytest.fixture(scope="session")
def launch_harness():
    subprocess.run(["dotnet", "build", str(LAUNCH_HARNESS), "-c", "Release", "--nologo", "--verbosity", "quiet"],
                   check=True, cwd=ROOT)
    return ROOT / "tools" / "launcher" / "bin" / "Release" / "net10.0" / "BrickHigh.LifecycleHarness.dll"


@pytest.fixture(scope="session")
def installer_exe():
    project = ROOT / "tools" / "installer" / "BrickHighInstaller.csproj"
    subprocess.run(["dotnet", "publish", str(project), "-c", "Release", "-r", "win-x64",
                    "--self-contained", "true", "-p:PublishSingleFile=true", "--nologo", "--verbosity", "quiet"],
                   check=True, cwd=ROOT)
    return ROOT / "tools" / "installer" / "bin" / "Release" / "net10.0-windows" / "win-x64" / "publish" / "BrickHighInstaller.exe"


def call(harness, *args):
    result = subprocess.run(["dotnet", str(harness), *map(str, args)], cwd=ROOT,
                            capture_output=True, text=True, timeout=30)
    return result.returncode, result.stdout.strip()


def package(path, build, *, launcher=b"launcher-v1", player=b"player", extra=None,
            kind="Preview", purpose=None, uninstaller=b"installer-v1"):
    path.mkdir()
    files = {"BrickHighLauncher.exe": launcher, "Player/BrickHigh.exe": player,
             "Player/BrickHigh_Data/catalog.db": b"catalog-" + build.encode(),
             "Installer/BrickHighInstaller.exe": uninstaller}
    files.update(extra or {})
    for key, data in files.items():
        target = path / key
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
    application_id = "com.gamenenstyle.brickhigh.preview" if kind == "Preview" else "com.gamenenstyle.brickhigh"
    index = {"applicationId": application_id, "packageKind": kind,
             "buildId": build, "playerKey": "Player/BrickHigh.exe",
             "files": [{"key": key, "sha256": hashlib.sha256(data).hexdigest(), "byteLength": len(data)}
                       for key, data in sorted(files.items())]}
    if purpose:
        index["purpose"] = purpose
    (path / "package-index.json").write_text(json.dumps(index), encoding="utf-8")
    return index


def pointer(root):
    return json.loads((root / "installation.json").read_text(encoding="utf-8"))


def test_install_update_switches_only_after_complete_staging_and_preserves_profile(tmp_path, harness):
    install = tmp_path / "install"
    profile = tmp_path / "profiles" / "save.db"
    profile.parent.mkdir()
    profile.write_bytes(b"private-progress")
    package(tmp_path / "a", "build-a", player=b"player-a")
    package(tmp_path / "b", "build-b", player=b"player-b")
    assert call(harness, "install", tmp_path / "a", install) == (0, "Installed")
    before = pointer(install)
    assert before["playerKey"] == "versions/build-a/Player/BrickHigh.exe"
    assert before["playerSha256"] == hashlib.sha256(b"player-a").hexdigest()
    assert call(harness, "install", tmp_path / "b", install) == (0, "Installed")
    after = pointer(install)
    assert after["playerKey"] == "versions/build-b/Player/BrickHigh.exe"
    assert after["playerSha256"] == hashlib.sha256(b"player-b").hexdigest()
    remove_link = tmp_path / "shortcuts" / "解除安裝 BrickHigh Preview.lnk"
    assert call(harness, "shortcut-target", remove_link) == (
        0, str(install / "versions" / "build-b" / "Installer" / "BrickHighInstaller.exe"))
    assert (install / before["playerKey"]).read_bytes() == b"player-a"
    assert profile.read_bytes() == b"private-progress"
    unknown = install / "versions" / "build-b" / "user-note.txt"
    unknown.write_text("保留", encoding="utf-8")
    assert call(harness, "uninstall", install, "Preview") == (0, "Uninstalled")
    assert profile.read_bytes() == b"private-progress"
    assert not (install / "installation.json").exists()
    assert unknown.read_text(encoding="utf-8") == "保留"


def test_corrupt_or_extra_payload_and_changed_launcher_preserve_pointer(tmp_path, harness):
    install = tmp_path / "install"
    package(tmp_path / "a", "build-a")
    assert call(harness, "install", tmp_path / "a", install) == (0, "Installed")
    old = (install / "installation.json").read_bytes()
    package(tmp_path / "bad", "build-b")
    (tmp_path / "bad" / "Player" / "BrickHigh.exe").write_bytes(b"tampered")
    assert call(harness, "install", tmp_path / "bad", install) == (4, "Corrupt")
    package(tmp_path / "extra", "build-c")
    (tmp_path / "extra" / "surprise.txt").write_bytes(b"x")
    assert call(harness, "install", tmp_path / "extra", install) == (4, "Corrupt")
    package(tmp_path / "launcher", "build-d", launcher=b"different-launcher")
    assert call(harness, "install", tmp_path / "launcher", install) == (4, "Corrupt")
    package(tmp_path / "same-id", "build-a", player=b"changed-bytes")
    assert call(harness, "install", tmp_path / "same-id", install) == (4, "Corrupt")
    assert (install / "installation.json").read_bytes() == old


def test_failed_pointer_commit_and_busy_lock_keep_old_install(tmp_path, harness):
    install = tmp_path / "install"
    profile = tmp_path / "profile.db"
    profile.write_bytes(b"keep")
    package(tmp_path / "a", "build-a")
    package(tmp_path / "b", "build-b")
    package(tmp_path / "b-tamper", "build-b")
    assert call(harness, "install", tmp_path / "a", install) == (0, "Installed")
    old = (install / "installation.json").read_bytes()
    remove_link = tmp_path / "shortcuts" / "解除安裝 BrickHigh Preview.lnk"
    old_remove_link = remove_link.read_bytes()
    assert call(harness, "shortcut-target", remove_link) == (
        0, str(install / "versions" / "build-a" / "Installer" / "BrickHighInstaller.exe"))
    assert call(harness, "install-fail-before-switch", tmp_path / "b", install) == (5, "StorageUnavailable")
    assert call(harness, "install-denied", tmp_path / "b", install) == (5, "StorageUnavailable")
    assert call(harness, "install-lock-pointer-before-switch", tmp_path / "b", install) == (5, "StorageUnavailable")
    assert call(harness, "install-replace-index", tmp_path / "b", install) == (5, "StorageUnavailable")
    assert call(harness, "install-tamper-before-switch", tmp_path / "b-tamper", install) == (5, "StorageUnavailable")
    assert (install / "installation.json").read_bytes() == old
    assert remove_link.read_bytes() == old_remove_link
    ready = tmp_path / "ready"
    release = tmp_path / "release"
    holder = subprocess.Popen(["dotnet", str(harness), "hold", str(install), str(ready), str(release)],
                              cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    try:
        for _ in range(100):
            if ready.exists():
                break
            time.sleep(0.05)
        assert ready.exists()
        assert call(harness, "install", tmp_path / "b-tamper", install) == (7, "Busy")
        assert (install / "installation.json").read_bytes() == old
    finally:
        release.write_text("release")
        holder.communicate(timeout=10)
    assert holder.returncode == 0
    assert profile.read_bytes() == b"keep"


def test_out_of_space_before_switch_preserves_previous_version_profile_and_staged_content(tmp_path, harness):
    install = tmp_path / "install"
    profile = tmp_path / "profiles" / "save.db"
    profile.parent.mkdir()
    profile.write_bytes(b"private-progress")
    package(tmp_path / "a", "build-a", player=b"player-a")
    package(tmp_path / "b", "build-b", player=b"player-b")
    assert call(harness, "install", tmp_path / "a", install) == (0, "Installed")
    old_pointer = (install / "installation.json").read_bytes()
    old_remove = tmp_path / "shortcuts" / "解除安裝 BrickHigh Preview.lnk"
    old_remove_bytes = old_remove.read_bytes()

    assert call(harness, "install-out-of-space", tmp_path / "b", install) == (5, "StorageUnavailable")

    # B 已完整 staged/validated 才注入磁碟空間不足，但可啟動 pointer 與 profile 必須仍指向 A。
    assert (install / "installation.json").read_bytes() == old_pointer
    assert pointer(install)["buildId"] == "build-a"
    assert profile.read_bytes() == b"private-progress"
    assert (install / "versions" / "build-a" / "Player" / "BrickHigh.exe").read_bytes() == b"player-a"
    # 未切換的 B 內容不得為了 rollback 被無聲刪除；後續可由明確 housekeeping 處理。
    assert (install / "versions" / "build-b" / "Player" / "BrickHigh.exe").read_bytes() == b"player-b"
    assert old_remove.read_bytes() == old_remove_bytes


def test_locked_pointer_causes_real_filesystem_failure_without_switch(tmp_path, harness):
    install = tmp_path / "install"
    profile = tmp_path / "profile.db"
    profile.write_bytes(b"keep")
    package(tmp_path / "a", "build-a")
    package(tmp_path / "b", "build-b")
    assert call(harness, "install", tmp_path / "a", install) == (0, "Installed")
    old = (install / "installation.json").read_bytes()
    ready = tmp_path / "pointer-ready"
    release = tmp_path / "pointer-release"
    holder = subprocess.Popen(["dotnet", str(harness), "hold-pointer", str(install), str(ready), str(release)],
                              cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    try:
        for _ in range(100):
            if ready.exists():
                break
            time.sleep(0.05)
        assert ready.exists()
        assert call(harness, "install", tmp_path / "b", install) == (5, "StorageUnavailable")
    finally:
        release.write_text("release")
        holder.communicate(timeout=10)
    assert holder.returncode == 0
    assert (install / "installation.json").read_bytes() == old
    assert profile.read_bytes() == b"keep"


def test_IT_022_game_and_installer_compete_in_both_orders(tmp_path, harness, launch_harness):
    install = tmp_path / "install"
    package(tmp_path / "a", "build-a")
    package(tmp_path / "b", "build-b")
    assert call(harness, "install", tmp_path / "a", install) == (0, "Installed")
    old = (install / "installation.json").read_bytes()

    game_ready = tmp_path / "game-ready"
    game = subprocess.Popen(["dotnet", str(launch_harness), "hold", str(install), str(game_ready)],
                            cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    try:
        for _ in range(100):
            if game_ready.exists():
                break
            time.sleep(0.05)
        assert game_ready.exists()
        assert call(harness, "install", tmp_path / "b", install) == (7, "Busy")
        assert (install / "installation.json").read_bytes() == old
    finally:
        (install / "release").write_text("release")
        game.communicate(timeout=10)
    assert game.returncode == 0

    installer_ready = tmp_path / "installer-ready"
    installer_release = tmp_path / "installer-release"
    updater = subprocess.Popen(["dotnet", str(harness), "install-pause", str(tmp_path / "b"), str(install),
                                str(installer_ready), str(installer_release)],
                               cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    try:
        for _ in range(100):
            if installer_ready.exists():
                break
            time.sleep(0.05)
        assert installer_ready.exists()
        assert subprocess.run(["dotnet", str(launch_harness), "claim", str(install)],
                              cwd=ROOT, capture_output=True, timeout=10).returncode == 7
        assert (install / "installation.json").read_bytes() == old
    finally:
        installer_release.write_text("release")
        stdout, stderr = updater.communicate(timeout=10)
    assert updater.returncode == 0, stderr
    assert stdout.strip() == "Installed"
    assert pointer(install)["buildId"] == "build-b"


def test_reparse_payload_is_rejected(tmp_path, harness):
    package(tmp_path / "bad", "build-a")
    outside = tmp_path / "outside"
    outside.mkdir()
    (outside / "data.bin").write_bytes(b"elsewhere")
    link = tmp_path / "bad" / "Player" / "linked"
    try:
        link.symlink_to(outside, target_is_directory=True)
    except OSError:
        subprocess.run(["cmd", "/c", "mklink", "/J", str(link), str(outside)], check=True,
                       cwd=ROOT, capture_output=True)
    assert call(harness, "install", tmp_path / "bad", tmp_path / "install") == (4, "Corrupt")


def test_uninstall_preserves_unknown_or_corrupt_version_contents(tmp_path, harness):
    install = tmp_path / "install"
    profile = tmp_path / "profile.db"
    profile.write_bytes(b"progress")
    package(tmp_path / "a", "build-a")
    assert call(harness, "install", tmp_path / "a", install) == (0, "Installed")
    corrupt_index = install / "versions" / "build-a" / "package-index.json"
    corrupt_index.write_text("{bad json", encoding="utf-8")
    assert call(harness, "uninstall", install, "Preview") == (0, "Uninstalled")
    assert corrupt_index.read_text(encoding="utf-8") == "{bad json"
    assert profile.read_bytes() == b"progress"


def test_uninstall_cleans_indexed_legacy_version_without_uninstaller_entry(tmp_path, harness):
    package(tmp_path / "package", "legacy-build")
    install = tmp_path / "install"
    assert call(harness, "install", tmp_path / "package", install) == (0, "Installed")
    version = install / "versions" / "legacy-build"
    index_file = version / "package-index.json"
    index = json.loads(index_file.read_text(encoding="utf-8"))
    index["files"] = [entry for entry in index["files"] if entry["key"] != "Installer/BrickHighInstaller.exe"]
    index_file.write_text(json.dumps(index), encoding="utf-8")
    (version / "Installer" / "BrickHighInstaller.exe").unlink()
    assert call(harness, "uninstall", install, "Preview") == (0, "Uninstalled")
    assert not version.exists()


def test_published_native_installer_runs_without_dotnet_host(tmp_path, installer_exe):
    package(tmp_path / "package", "native-build")
    install = tmp_path / "install"
    result = subprocess.run([str(installer_exe), "install", str(tmp_path / "package"), str(install), "--no-shortcut"],
                            cwd=ROOT, capture_output=True, timeout=20)
    assert result.returncode == 0
    assert pointer(install)["playerKey"] == "versions/native-build/Player/BrickHigh.exe"
    result = subprocess.run([str(installer_exe), "uninstall", str(install), "Preview", "--no-shortcut"],
                            cwd=ROOT, capture_output=True, timeout=20)
    assert result.returncode == 0
    assert not (install / "installation.json").exists()


def test_running_version_uninstaller_reports_retained_executable(tmp_path, installer_exe):
    package(tmp_path / "package", "self-uninstall", uninstaller=installer_exe.read_bytes())
    install = tmp_path / "install"
    profile = tmp_path / "profile.db"
    profile.write_bytes(b"keep")
    env = dict(__import__("os").environ, BRICKHIGH_INSTALLER_SUPPRESS_NOTICE="1")
    result = subprocess.run([str(installer_exe), "install", str(tmp_path / "package"), str(install), "--no-shortcut"],
                            cwd=ROOT, env=env, capture_output=True, timeout=30)
    assert result.returncode == 0
    installed_exe = install / "versions" / "self-uninstall" / "Installer" / "BrickHighInstaller.exe"
    result = subprocess.run([str(installed_exe), "uninstall", str(install), "Preview", "--no-shortcut"],
                            cwd=ROOT, env=env, capture_output=True, timeout=30)
    assert result.returncode == 8
    assert not (install / "installation.json").exists()
    assert installed_exe.exists()
    assert profile.read_bytes() == b"keep"


def test_shortcut_targets_are_separate_and_uninstall_preserves_other_kind(tmp_path, harness):
    preview = tmp_path / "preview"
    release = tmp_path / "release"
    package(tmp_path / "package-preview", "preview-build")
    package(tmp_path / "package-release", "release-build", kind="Release")
    assert call(harness, "install", tmp_path / "package-preview", preview) == (0, "Installed")
    assert call(harness, "install", tmp_path / "package-release", release) == (0, "Installed")
    shortcuts = tmp_path / "shortcuts"
    preview_link = shortcuts / "BrickHigh Preview.lnk"
    release_link = shortcuts / "BrickHigh.lnk"
    preview_remove = shortcuts / "解除安裝 BrickHigh Preview.lnk"
    release_remove = shortcuts / "解除安裝 BrickHigh.lnk"
    assert all(path.exists() for path in (preview_link, release_link, preview_remove, release_remove))
    assert call(harness, "shortcut-target", preview_link) == (0, str(preview / "BrickHighLauncher.exe"))
    assert call(harness, "shortcut-target", release_link) == (0, str(release / "BrickHighLauncher.exe"))
    assert call(harness, "shortcut-target", preview_remove) == (
        0, str(preview / "versions" / "preview-build" / "Installer" / "BrickHighInstaller.exe"))
    assert call(harness, "shortcut-target", release_remove) == (
        0, str(release / "versions" / "release-build" / "Installer" / "BrickHighInstaller.exe"))
    assert call(harness, "shortcut-arguments", preview_remove) == (0, f'uninstall "{preview}" Preview')
    assert call(harness, "shortcut-arguments", release_remove) == (0, f'uninstall "{release}" Release')
    assert call(harness, "uninstall", preview, "Preview") == (0, "Uninstalled")
    assert not preview_link.exists() and not preview_remove.exists()
    assert release_link.exists() and release_remove.exists()


def test_unknown_shortcut_is_never_overwritten_or_deleted(tmp_path, harness):
    package(tmp_path / "package", "preview-build")
    install = tmp_path / "install"
    shortcuts = tmp_path / "shortcuts"
    shortcuts.mkdir()
    unknown = shortcuts / "BrickHigh Preview.lnk"
    unknown.write_bytes(b"unrelated shortcut")
    assert call(harness, "install", tmp_path / "package", install) == (4, "Corrupt")
    assert unknown.read_bytes() == b"unrelated shortcut"
    assert not (install / "installation.json").exists()


def test_new_shortcut_rolls_back_when_pointer_switch_fails(tmp_path, harness):
    package(tmp_path / "package", "build-b")
    install = tmp_path / "install"
    assert call(harness, "install-fail-before-switch", tmp_path / "package", install) == (5, "StorageUnavailable")
    assert not (install / "installation.json").exists()
    assert not (tmp_path / "shortcuts" / "BrickHigh Preview.lnk").exists()
    assert not (tmp_path / "shortcuts" / "解除安裝 BrickHigh Preview.lnk").exists()


def test_unknown_uninstall_shortcut_is_preserved_and_blocks_install(tmp_path, harness):
    package(tmp_path / "package", "preview-build")
    install = tmp_path / "install"
    shortcut = tmp_path / "shortcuts" / "解除安裝 BrickHigh Preview.lnk"
    shortcut.parent.mkdir()
    shortcut.write_bytes(b"unrelated shortcut")
    assert call(harness, "install", tmp_path / "package", install) == (4, "Corrupt")
    assert shortcut.read_bytes() == b"unrelated shortcut"
    assert not (install / "installation.json").exists()
    assert not (tmp_path / "shortcuts" / "BrickHigh Preview.lnk").exists()


def test_uninstall_preserves_unmanaged_uninstall_shortcut(tmp_path, harness):
    package(tmp_path / "package", "preview-build")
    install = tmp_path / "install"
    assert call(harness, "install", tmp_path / "package", install) == (0, "Installed")
    shortcut = tmp_path / "shortcuts" / "解除安裝 BrickHigh Preview.lnk"
    shortcut.unlink()
    target = install / "versions" / "preview-build" / "Installer" / "BrickHighInstaller.exe"
    assert call(harness, "make-unmanaged-shortcut", shortcut, target) == (0, "")
    assert call(harness, "uninstall", install, "Preview") == (0, "Uninstalled")
    assert shortcut.exists()


def test_uninstall_preserves_unmanaged_shortcut_even_with_same_target(tmp_path, harness):
    package(tmp_path / "package", "preview-build")
    install = tmp_path / "install"
    assert call(harness, "install", tmp_path / "package", install) == (0, "Installed")
    shortcut = tmp_path / "shortcuts" / "BrickHigh Preview.lnk"
    shortcut.unlink()
    assert call(harness, "make-unmanaged-shortcut", shortcut, install / "BrickHighLauncher.exe") == (0, "")
    assert call(harness, "uninstall", install, "Preview") == (0, "Uninstalled")
    assert shortcut.exists()
    assert call(harness, "install", tmp_path / "package", install) == (4, "Corrupt")
    assert shortcut.exists()


def test_double_click_without_adjacent_payload_fails_safely(tmp_path, installer_exe):
    empty = tmp_path / "empty"
    empty.mkdir()
    copied = empty / "BrickHighInstaller.exe"
    copied.write_bytes(installer_exe.read_bytes())
    env = dict(__import__("os").environ, BRICKHIGH_INSTALLER_SUPPRESS_NOTICE="1")
    result = subprocess.run([str(copied)], cwd=empty, env=env, capture_output=True, timeout=10)
    assert result.returncode == 4
    assert list(empty.iterdir()) == [copied]
