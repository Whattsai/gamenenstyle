"""以已保存的內部安裝證據核對真正 Player 重啟、更新及受管卸載。"""

import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess


def read(path):
    return json.loads(path.read_text(encoding="utf-8"))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for key in ("previous-run", "package", "installer", "output"):
        parser.add_argument("--" + key, type=Path, required=True)
    args = parser.parse_args()
    previous = read(args.previous_run)
    root = Path(previous["installRoot"])
    package, installer, output = (value.resolve() for value in (args.package, args.installer, args.output))
    next_index = read(package / "package-index.json")
    pointer = read(root / "installation.json")
    old_index = read(root / "versions" / pointer["buildId"] / "package-index.json")
    # 只允許工具先前建立且仍是同一版本的 F-Catalog；不操作一般安裝或 Profiles。
    if (previous.get("purpose") != "F-Catalog" or previous.get("launcherExitCode") != 0
            or previous.get("buildId") != pointer["buildId"]
            or not old_index.get("purpose", "").startswith("F-Catalog")
            or next_index.get("purpose") != "F-Catalog" or output.exists()):
        parser.error("需可核對的內部成功安裝紀錄與全新證據位置。")
    output.mkdir(parents=True)
    environment = dict(os.environ, BRICKHIGH_INSTALLER_SUPPRESS_NOTICE="1")
    report = {"purpose": "F-Catalog", "installRoot": str(root), "oldBuild": pointer["buildId"],
              "newBuild": next_index["buildId"], "visualApproved": False,
              "installerSha256": hashlib.sha256(installer.read_bytes()).hexdigest(), "steps": []}

    def save():
        (output / "update.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    def launch(label, expected):
        environment["BRICKHIGH_ACCEPTANCE_OUTPUT"] = str(output / label)
        process = subprocess.Popen([str(root / "BrickHighLauncher.exe")], cwd=root,
                                   env=environment, creationflags=subprocess.CREATE_NO_WINDOW)
        step = {"operation": label, "pid": process.pid}
        report["steps"].append(step)
        save()
        try:
            step["exitCode"] = process.wait(timeout=180)
        except subprocess.TimeoutExpired:
            step["timeout"] = True
            save()
            raise RuntimeError("Player逾時；程序與現場保留。") from None
        result = read(output / label / "result.json")
        step["playerBuildId"] = result.get("buildId")
        step["success"] = step["exitCode"] == 0 and result.get("success") is True and result.get("buildId") == expected
        save()
        if not step["success"]:
            raise RuntimeError("Player未完成指定版本重啟。")

    save()
    try:
        launch("BeforeUpdate", pointer["buildId"])
        installed = subprocess.run([str(installer), "install", str(package), str(root), "--no-shortcut"],
                                   env=environment, timeout=120, creationflags=subprocess.CREATE_NO_WINDOW)
        report["steps"].append({"operation": "update", "exitCode": installed.returncode})
        save()
        if installed.returncode != 0 or read(root / "installation.json")["buildId"] != next_index["buildId"]:
            raise RuntimeError("安裝更新未切換到指定版本。")
        launch("AfterUpdate", next_index["buildId"])
        # 未知檔案放在工具持有的隔離安裝根，確認卸載不會遞迴刪除使用者新增內容。
        marker = root / "acceptance-user-owned.txt"
        with marker.open("x", encoding="utf-8") as stream:
            stream.write("內部驗證：此檔非安裝包所有。")
        marker_hash = hashlib.sha256(marker.read_bytes()).hexdigest()
        removed = subprocess.run([str(installer), "uninstall", str(root), "Preview", "--no-shortcut"],
                                 env=environment, timeout=120, creationflags=subprocess.CREATE_NO_WINDOW)
        remaining = sorted(str(path.relative_to(root)) for path in root.rglob("*") if path.is_file())
        preserved = marker.is_file() and hashlib.sha256(marker.read_bytes()).hexdigest() == marker_hash
        report["steps"].append({"operation": "uninstall", "exitCode": removed.returncode,
                                "unknownFilePreserved": preserved, "remainingFiles": remaining})
        report["success"] = (removed.returncode == 0 and preserved
                             and remaining == [marker.name] and not (root / "installation.json").exists())
    except Exception as error:
        report["success"] = False
        report["error"] = type(error).__name__ + ": " + str(error)
    save()
    print(json.dumps(report, ensure_ascii=False))
    return 0 if report.get("success") else 4


if __name__ == "__main__":
    raise SystemExit(main())
