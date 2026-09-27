"""隔離安裝內部 F-Catalog，經真正啟動器執行 Player 的操作與畫面探針。"""

import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import time


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ('package', 'installer', 'install-root', 'output'):
        parser.add_argument('--' + name, required=True, type=Path)
    args = parser.parse_args()
    package, installer, root, output = (path.resolve() for path in
                                        (args.package, args.installer, args.install_root, args.output))
    if root.exists() or output.exists():
        parser.error('只接受全新的隔離安裝與證據路徑。')
    index = json.loads((package / 'package-index.json').read_text(encoding='utf-8'))
    if not index.get('purpose', '').startswith('F-Catalog'):
        parser.error('本入口只接受內部 F-Catalog，不能自動操作真正使用者包。')
    output.mkdir(parents=True)
    report = {'purpose': 'F-Catalog', 'package': str(package), 'installRoot': str(root),
              'buildId': index['buildId'], 'installerSha256': hashlib.sha256(installer.read_bytes()).hexdigest(),
              'visualApproved': False, 'readyAsset': False}
    environment = dict(os.environ, BRICKHIGH_INSTALLER_SUPPRESS_NOTICE='1')
    installed = subprocess.run([str(installer), 'install', str(package), str(root), '--no-shortcut'],
                               env=environment, timeout=120, creationflags=subprocess.CREATE_NO_WINDOW)
    report['installExitCode'] = installed.returncode
    if installed.returncode:
        (output / 'run.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
        return installed.returncode
    before = time.monotonic()
    environment['BRICKHIGH_ACCEPTANCE_OUTPUT'] = str(output / 'PlayerEvidence')
    launched = subprocess.Popen([str(root / 'BrickHighLauncher.exe')], cwd=root, env=environment,
                                creationflags=subprocess.CREATE_NO_WINDOW)
    report['launcherPid'] = launched.pid
    (output / 'run.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    try:
        report['launcherExitCode'] = launched.wait(timeout=180)
    except subprocess.TimeoutExpired:
        # 保留現場與程序，不用強殺掩蓋啟動或畫面失敗。
        report['timeout'] = True
    report['elapsedSeconds'] = time.monotonic() - before
    result = output / 'PlayerEvidence/result.json'
    if result.exists():
        report['playerEvidence'] = json.loads(result.read_text(encoding='utf-8'))
    (output / 'run.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({key: value for key, value in report.items() if key != 'playerEvidence'}, ensure_ascii=False))
    return 0 if report.get('launcherExitCode') == 0 and report.get('playerEvidence', {}).get('success') else 4


if __name__ == '__main__':
    raise SystemExit(main())
