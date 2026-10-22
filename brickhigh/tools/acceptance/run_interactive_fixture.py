"""隔離安裝內部 F-Catalog，經真正啟動器執行 Player 的操作與畫面探針。"""

import argparse
import ctypes
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import time
import traceback

from acceptance_monitor import emit, wait_player, terminate_tree, failure_event


def _hash_tree(root):
    result = {}
    for path in sorted(root.rglob('*')):
        if path.is_file():
            result[path.relative_to(root).as_posix()] = {
                'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
                'byteLength': path.stat().st_size,
            }
    return result


def _run_acl(*args):
    result = subprocess.run(['icacls', *map(str, args)], capture_output=True, text=True,
                            timeout=30, creationflags=subprocess.CREATE_NO_WINDOW)
    stdout = result.stdout or ''
    stderr = result.stderr or ''
    if result.returncode:
        reason = (stderr or stdout).strip() or f'icacls 未提供錯誤輸出（exit {result.returncode}）'
        raise RuntimeError('icacls failed: ' + reason)
    return stdout.strip()


def _make_read_only(path, account):
    # 模擬 Program Files：保留 SYSTEM／Administrators 等既有 ACL，只把目前一般帳號降成 RX。
    # 不能把整棵樹重建成只有單一使用者，否則會把 Windows native loader 的真實環境一起破壞。
    _run_acl(path, '/inheritance:d')
    _run_acl(path, '/remove:g', account, '/T', '/C')
    _run_acl(path, '/grant:r', f'{account}:(OI)(CI)(RX)', '/T', '/C')
    probe = path / '.brickhigh-write-probe'
    try:
        probe.write_bytes(b'should-not-write')
    except OSError:
        return
    else:
        probe.unlink(missing_ok=True)
        raise RuntimeError('ACL read-only policy was not effective.')


def _restore_writable(path, account):
    _run_acl(path, '/inheritance:e')
    _run_acl(path, '/grant:r', f'{account}:(OI)(CI)(F)', '/T', '/C')


def _audit_installed_catalog(root):
    manifests = []
    for path in root.rglob('release-manifest.json'):
        try:
            payload = json.loads(path.read_text(encoding='utf-8'))
        except (OSError, UnicodeError, json.JSONDecodeError):
            continue
        if payload.get('purpose') == 'F-Catalog':
            manifests.append((path, payload))
    if len(manifests) != 1:
        return {'manifestCount': len(manifests), 'error': 'ExpectedOneFCatalogManifest'}

    path, payload = manifests[0]
    base = path.parent
    missing = []
    size_mismatch = []
    local_catalog_hash_mismatch = []
    for item in payload.get('files', []):
        key = item.get('storageKey')
        if not isinstance(key, str):
            continue
        target = base / Path(key)
        if not target.is_file():
            missing.append(key)
            continue
        if target.stat().st_size != item.get('byteLength'):
            size_mismatch.append(key)
        if item.get('kind') == 'LocalCatalog':
            actual = hashlib.sha256(target.read_bytes()).hexdigest()
            if actual != item.get('sha256'):
                local_catalog_hash_mismatch.append(key)
    return {
        'manifestCount': 1,
        'manifestRelativePath': path.relative_to(root).as_posix(),
        'indexedFileCount': len(payload.get('files', [])),
        'missingKeys': missing,
        'sizeMismatchKeys': size_mismatch,
        'localCatalogHashMismatchKeys': local_catalog_hash_mismatch,
    }


def _classify_bootstrap(payload):
    if not isinstance(payload, dict) or payload.get('stage') != 'CatalogOpenFailed':
        return None
    if payload.get('error') != 'AssetMissing':
        return 'other-catalog-failure'
    message = payload.get('message')
    if message == '必要執行檔不完整，請使用完整安裝包修復。':
        return 'native-dependency-missing'
    if message == '此模型檔案不完整，請使用完整安裝包修復。':
        return 'indexed-content-missing'
    return 'asset-missing-unclassified'


def _max_installed_path_length(install_container, index):
    root = install_container / '唯讀 安裝'
    version = root / 'versions' / index['buildId']
    return max(len(str(version / Path(item['key']))) for item in index.get('files', [])
               if item.get('key') != 'BrickHighLauncher.exe')


def _select_install_container(requested, output, index):
    # 此矩陣驗證 Unicode/空白路徑與 ACL；MCP 的深層暫存根不應意外變成 MAX_PATH 測試。
    # Unity/Mono 的 Win32 FileStream 在過深路徑可能回 DirectoryNotFoundException。
    if _max_installed_path_length(requested, index) <= 240:
        return requested
    token = hashlib.sha256(str(output).encode('utf-8')).hexdigest()[:12]
    shortened = Path.home() / 'bh-qa-it9' / token
    if shortened.exists():
        raise RuntimeError('短路徑 acceptance install root 已存在。')
    if _max_installed_path_length(shortened, index) > 240:
        raise RuntimeError('無法建立符合 acceptance 路徑預算的隔離安裝根。')
    return shortened


def _prepare_upgrade_a_fixture(package, output, index):
    """建立前版本安裝 fixture；不啟動 A，只驗證真 Installer 的 A→B 原子切換。"""
    previous = output / 'UpgradePackageA'
    shutil.copytree(package, previous)
    previous_index_path = previous / 'package-index.json'
    previous_index = json.loads(previous_index_path.read_text(encoding='utf-8'))
    current = index['buildId']
    previous_build = ('a' + current[1:]) if len(current) > 1 else 'acceptance-a'
    if previous_build == current:
        raise RuntimeError('無法建立不同 buildId 的 upgrade fixture。')
    previous_index['buildId'] = previous_build
    previous_index_path.write_text(json.dumps(previous_index, ensure_ascii=False, indent=2), encoding='utf-8')
    return previous, previous_build


def _run_launcher(root, environment, timeout, scenario='player'):
    process = subprocess.Popen([str(root / 'BrickHighLauncher.exe')], cwd=root.parent, env=environment,
                               creationflags=subprocess.CREATE_NO_WINDOW)
    try:
        code = wait_player(process, Path(environment['BRICKHIGH_ACCEPTANCE_OUTPUT']), scenario, timeout)
    except BaseException:
        terminate_tree(process)
        raise
    emit('scenario_completed', scenario=scenario, exitCode=code)
    return process.pid, code, False


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ('package', 'installer', 'install-root', 'output'):
        parser.add_argument('--' + name, required=True, type=Path)
    args = parser.parse_args()
    emit('prepare', timeoutSeconds=90)
    package, configured_installer, requested_install_container, output = (path.resolve() for path in
        (args.package, args.installer, args.install_root, args.output))
    if requested_install_container.exists() or output.exists():
        parser.error('只接受全新的隔離安裝與證據路徑。')
    index = json.loads((package / 'package-index.json').read_text(encoding='utf-8'))
    install_container = _select_install_container(requested_install_container, output, index)
    if install_container.exists():
        parser.error('實際隔離安裝根必須是全新路徑。')
    root = install_container / '唯讀 安裝'
    if not index.get('purpose', '').startswith('F-Catalog'):
        parser.error('本入口只接受內部 F-Catalog，不能自動操作真正使用者包。')
    package_installer = package / 'Installer' / 'BrickHighInstaller.exe'
    installer_entry = next((item for item in index.get('files', [])
                            if item.get('key') == 'Installer/BrickHighInstaller.exe'), None)
    if installer_entry is None or not package_installer.is_file():
        parser.error('F-Catalog package 缺少受 index 管理的 Installer。')
    packaged_installer_sha = hashlib.sha256(package_installer.read_bytes()).hexdigest()
    if packaged_installer_sha != installer_entry.get('sha256'):
        parser.error('F-Catalog package Installer hash 不符合 package-index。')
    installer = package_installer
    output.mkdir(parents=True)
    previous_package, previous_build = _prepare_upgrade_a_fixture(package, output, index)
    local_low = output / 'LocalLow'
    product_root = local_low / 'GameNenStyle' / 'BrickHighPreview'
    profile = product_root / 'Profiles' / 'acceptance-profile.bin'
    profile.parent.mkdir(parents=True)
    profile.write_bytes(b'brickhigh-private-profile-v1')
    profile_sha = hashlib.sha256(profile.read_bytes()).hexdigest()
    whoami = subprocess.run(['whoami'], capture_output=True, text=True, timeout=10,
                            creationflags=subprocess.CREATE_NO_WINDOW, check=True).stdout.strip()
    report = {
        'purpose': 'F-Catalog', 'package': str(package),
        'requestedInstallContainer': str(requested_install_container),
        'installContainer': str(install_container), 'installRoot': str(root),
        'maxInstalledPathLength': _max_installed_path_length(install_container, index),
        'shortenedInstallRoot': install_container != requested_install_container,
        'buildId': index['buildId'],
        'installerSha256': packaged_installer_sha,
        'configuredInstallerSha256': hashlib.sha256(configured_installer.read_bytes()).hexdigest(),
        'usesPackagedInstaller': True,
        'account': whoami, 'elevatedAdministrator': bool(ctypes.windll.shell32.IsUserAnAdmin()),
        'localLowRoot': str(local_low), 'profileSha256': profile_sha,
        'visualApproved': False, 'readyAsset': False,
        'upgrade': {'previousBuildId': previous_build, 'currentBuildId': index['buildId']},
    }
    environment = dict(os.environ, BRICKHIGH_INSTALLER_SUPPRESS_NOTICE='1')

    # ET-006：先以同一真實 package payload 建立不同 buildId 的 A 安裝，再由真正 B package 原子升級。
    # A 不啟動；跨版本不同 bytes 的切換另由 test_install_update.py 驗證，這裡聚焦真 packaged Installer + Player。
    emit('install', scenario='upgrade_a', timeoutSeconds=120)
    installed_a = subprocess.run([str(installer), 'install', str(previous_package), str(root), '--no-shortcut'],
                                 env=environment, timeout=120, creationflags=subprocess.CREATE_NO_WINDOW)
    report['upgrade']['installAExitCode'] = installed_a.returncode
    if installed_a.returncode:
        (output / 'run.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
        return installed_a.returncode
    pointer_a = json.loads((root / 'installation.json').read_text(encoding='utf-8'))
    report['upgrade']['pointerAfterA'] = pointer_a.get('buildId')

    emit('install', scenario='upgrade_b', timeoutSeconds=120)
    installed = subprocess.run([str(installer), 'install', str(package), str(root), '--no-shortcut'],
                               env=environment, timeout=120, creationflags=subprocess.CREATE_NO_WINDOW)
    report['installExitCode'] = installed.returncode
    report['upgrade']['installBExitCode'] = installed.returncode
    if installed.returncode:
        (output / 'run.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
        return installed.returncode
    pointer_b = json.loads((root / 'installation.json').read_text(encoding='utf-8'))
    report['upgrade']['pointerAfterB'] = pointer_b.get('buildId')
    report['upgrade']['previousVersionRetained'] = (root / 'versions' / previous_build).is_dir()
    report['upgrade']['profileUnchangedAfterUpgrade'] = hashlib.sha256(profile.read_bytes()).hexdigest() == profile_sha

    emit('verify_installation', timeoutSeconds=90)
    install_before = _hash_tree(root)
    report['installedCatalogAudit'] = _audit_installed_catalog(root)
    environment['BRICKHIGH_ACCEPTANCE_LOCALLOW'] = str(local_low)

    # 同一中文／空白 versioned install 先做可寫 baseline，將 package/native loader 問題與唯讀 ACL 問題分離。
    writable_output = output / 'WritableBaselineEvidence'
    writable_environment = dict(environment, BRICKHIGH_ACCEPTANCE_OUTPUT=str(writable_output))
    writable_pid, writable_exit, writable_timeout = _run_launcher(root, writable_environment, 180, 'writable')
    report['writableBaseline'] = {
        'launcherPid': writable_pid, 'exitCode': writable_exit, 'timeout': writable_timeout,
    }
    writable_result = writable_output / 'result.json'
    if writable_result.exists():
        report['writableBaseline']['playerEvidence'] = json.loads(writable_result.read_text(encoding='utf-8'))
    writable_bootstrap = writable_output / 'bootstrap.json'
    if writable_bootstrap.exists():
        report['writableBaseline']['bootstrapEvidence'] = json.loads(writable_bootstrap.read_text(encoding='utf-8'))
        report['writableBaseline']['bootstrapClassification'] = _classify_bootstrap(
            report['writableBaseline']['bootstrapEvidence'])
    writable_catalog_diagnostics = writable_output / 'catalog-open-diagnostics.json'
    if writable_catalog_diagnostics.exists():
        report['writableBaseline']['catalogOpenDiagnostics'] = json.loads(
            writable_catalog_diagnostics.read_text(encoding='utf-8'))
    report['writableBaseline']['installTreeUnchanged'] = _hash_tree(root) == install_before
    report['writableBaseline']['profileUnchanged'] = hashlib.sha256(profile.read_bytes()).hexdigest() == profile_sha

    emit('apply_readonly_acl', timeoutSeconds=90)
    _make_read_only(root, whoami)
    report['readOnlyInstallWriteProbeDenied'] = True
    before = time.monotonic()
    environment['BRICKHIGH_ACCEPTANCE_OUTPUT'] = str(output / 'PlayerEvidence')
    try:
        pid, exit_code, timed_out = _run_launcher(root, environment, 180, 'readonly')
        report['launcherPid'] = pid
        report['launcherExitCode'] = exit_code
        if timed_out:
            report['timeout'] = True
    finally:
        emit('restore_acl', timeoutSeconds=90)
        _restore_writable(root, whoami)
    report['elapsedSeconds'] = time.monotonic() - before
    install_after = _hash_tree(root)
    report['readOnlyInstallTreeUnchanged'] = install_after == install_before
    report['installSidecars'] = sorted(key for key in install_after
                                       if key.lower().endswith(('-wal', '-shm', '-journal')))
    report['profileUnchangedAfterPlayer'] = hashlib.sha256(profile.read_bytes()).hexdigest() == profile_sha
    result = output / 'PlayerEvidence/result.json'
    if result.exists():
        report['playerEvidence'] = json.loads(result.read_text(encoding='utf-8'))
    progress = output / 'PlayerEvidence/progress.json'
    if progress.exists():
        report['playerProgress'] = json.loads(progress.read_text(encoding='utf-8'))
    bootstrap = output / 'PlayerEvidence/bootstrap.json'
    if bootstrap.exists():
        report['bootstrapEvidence'] = json.loads(bootstrap.read_text(encoding='utf-8'))
    catalog_diagnostics = output / 'PlayerEvidence/catalog-open-diagnostics.json'
    if catalog_diagnostics.exists():
        report['catalogOpenDiagnostics'] = json.loads(catalog_diagnostics.read_text(encoding='utf-8'))

    # 真實不可寫使用者資料根：使用獨立 LocalLow，預先只放既有 profile、不建立 Diagnostics，
    # 這樣 Launcher 的第一個可變資料寫入就必須 fail-closed 為 StorageUnavailable。
    denied_output = output / 'StorageDeniedEvidence'
    denied_output.mkdir()
    denied_local_low = output / 'DeniedLocalLow'
    denied_product_root = denied_local_low / 'GameNenStyle' / 'BrickHighPreview'
    denied_profile = denied_product_root / 'Profiles' / 'acceptance-profile.bin'
    denied_profile.parent.mkdir(parents=True)
    denied_profile.write_bytes(b'brickhigh-private-profile-v1')
    denied_profile_sha = hashlib.sha256(denied_profile.read_bytes()).hexdigest()
    denied_environment = dict(
        environment,
        BRICKHIGH_ACCEPTANCE_OUTPUT=str(denied_output),
        BRICKHIGH_ACCEPTANCE_LOCALLOW=str(denied_local_low),
    )
    emit('apply_storage_denied_acl', timeoutSeconds=90)
    _make_read_only(denied_product_root, whoami)
    try:
        denied_pid, denied_exit, denied_timeout = _run_launcher(root, denied_environment, 30, 'storage_denied')
        report['storageDenied'] = {'launcherPid': denied_pid, 'exitCode': denied_exit, 'timeout': denied_timeout}
    finally:
        _restore_writable(denied_product_root, whoami)
    denied_failure = denied_output / 'launcher-failure.json'
    if denied_failure.exists():
        report['storageDenied']['failureEvidence'] = json.loads(denied_failure.read_text(encoding='utf-8'))
    report['storageDenied']['profileUnchanged'] = hashlib.sha256(denied_profile.read_bytes()).hexdigest() == denied_profile_sha

    # 真實缺 sqlite3 native dependency：只故障注入目前 installation.json 選中的 B version；
    # A→B upgrade 會合法保留歷史版本，因此不能再對整個 install root 假設只有一個 sqlite3.dll。
    current_version_root = root / 'versions' / index['buildId']
    sqlite = [path for path in current_version_root.rglob('sqlite3.dll') if path.is_file()]
    if len(sqlite) != 1:
        report['missingDependency'] = {'error': f'ExpectedOneCurrentSqliteDll:{len(sqlite)}'}
    else:
        sqlite_path = sqlite[0]
        sqlite_sha = hashlib.sha256(sqlite_path.read_bytes()).hexdigest()
        hidden = sqlite_path.with_name(sqlite_path.name + '.acceptance-missing')
        sqlite_path.rename(hidden)
        missing_output = output / 'MissingDependencyEvidence'
        missing_output.mkdir()
        missing_environment = dict(environment, BRICKHIGH_ACCEPTANCE_OUTPUT=str(missing_output))
        try:
            missing_pid, missing_exit, missing_timeout = _run_launcher(root, missing_environment, 60, 'missing_dependency')
            report['missingDependency'] = {
                'launcherPid': missing_pid, 'exitCode': missing_exit, 'timeout': missing_timeout,
                'sqliteRelativePath': sqlite_path.relative_to(root).as_posix(), 'sqliteSha256': sqlite_sha,
            }
        finally:
            hidden.rename(sqlite_path)
        missing_bootstrap = missing_output / 'bootstrap.json'
        if missing_bootstrap.exists():
            report['missingDependency']['bootstrapEvidence'] = json.loads(missing_bootstrap.read_text(encoding='utf-8'))
            report['missingDependency']['bootstrapClassification'] = _classify_bootstrap(
                report['missingDependency']['bootstrapEvidence'])
        missing_catalog_diagnostics = missing_output / 'catalog-open-diagnostics.json'
        if missing_catalog_diagnostics.exists():
            report['missingDependency']['catalogOpenDiagnostics'] = json.loads(
                missing_catalog_diagnostics.read_text(encoding='utf-8'))
        missing_failure = missing_output / 'launcher-failure.json'
        if missing_failure.exists():
            report['missingDependency']['launcherFailureEvidence'] = json.loads(missing_failure.read_text(encoding='utf-8'))
        report['missingDependency']['restored'] = hashlib.sha256(sqlite_path.read_bytes()).hexdigest() == sqlite_sha
        report['missingDependency']['profileUnchanged'] = hashlib.sha256(profile.read_bytes()).hexdigest() == profile_sha

    report['finalInstallTreeUnchanged'] = _hash_tree(root) == install_before

    # ET-006 default uninstall：使用目前安裝版本內的 uninstaller。Windows 執行中的 uninstaller
    # 可能只能保留自身並回 UninstalledWithResidual(8)；除此之外所有 indexed content / pointer 必須移除。
    installed_uninstaller = root / 'versions' / index['buildId'] / 'Installer' / 'BrickHighInstaller.exe'
    uninstaller_sha = hashlib.sha256(installed_uninstaller.read_bytes()).hexdigest()
    emit('uninstall', timeoutSeconds=120)
    uninstall = subprocess.run([str(installed_uninstaller), 'uninstall', str(root), 'Preview', '--no-shortcut'],
                               env=environment, timeout=120, creationflags=subprocess.CREATE_NO_WINDOW)
    remaining_after_uninstall = _hash_tree(root) if root.exists() else {}
    expected_residual = f"versions/{index['buildId']}/Installer/BrickHighInstaller.exe"
    report['uninstall'] = {
        'exitCode': uninstall.returncode,
        'installedUninstallerSha256': uninstaller_sha,
        'pointerRemoved': not (root / 'installation.json').exists(),
        'profileUnchanged': hashlib.sha256(profile.read_bytes()).hexdigest() == profile_sha,
        'remainingFiles': sorted(remaining_after_uninstall),
        'expectedSelfResidual': expected_residual,
    }
    report['uninstall']['onlyExpectedSelfResidual'] = (
        (uninstall.returncode == 0 and not remaining_after_uninstall)
        or (uninstall.returncode == 8 and sorted(remaining_after_uninstall) == [expected_residual])
    )
    emit('verify_result', timeoutSeconds=60)
    storage_failure = report.get('storageDenied', {}).get('failureEvidence', {})
    missing_bootstrap_payload = report.get('missingDependency', {}).get('bootstrapEvidence', {})
    checks = {
        'upgradeInstallA': report.get('upgrade', {}).get('installAExitCode') == 0,
        'upgradePointerA': report.get('upgrade', {}).get('pointerAfterA') == previous_build,
        'upgradeInstallB': report.get('upgrade', {}).get('installBExitCode') == 0,
        'upgradePointerB': report.get('upgrade', {}).get('pointerAfterB') == index['buildId'],
        'upgradePreviousVersionRetained': report.get('upgrade', {}).get('previousVersionRetained') is True,
        'upgradeProfilePreserved': report.get('upgrade', {}).get('profileUnchangedAfterUpgrade') is True,
        'writableLaunchExit': report.get('writableBaseline', {}).get('exitCode') == 0,
        'writablePlayerSuccess': report.get('writableBaseline', {}).get('playerEvidence', {}).get('success') is True,
        'writableInstallTreeUnchanged': report.get('writableBaseline', {}).get('installTreeUnchanged') is True,
        'writableProfilePreserved': report.get('writableBaseline', {}).get('profileUnchanged') is True,
        'readOnlyLaunchExit': report.get('launcherExitCode') == 0,
        'readOnlyPlayerSuccess': report.get('playerEvidence', {}).get('success') is True,
        'readOnlyInstallTreeUnchanged': report.get('readOnlyInstallTreeUnchanged') is True,
        'noInstallSidecars': not report.get('installSidecars'),
        'readOnlyProfilePreserved': report.get('profileUnchangedAfterPlayer') is True,
        'storageDeniedExit': report.get('storageDenied', {}).get('exitCode') == 3,
        'storageDeniedNoTimeout': not report.get('storageDenied', {}).get('timeout'),
        'storageDeniedFailureCode': storage_failure.get('failure') == 'StorageUnavailable',
        'storageDeniedMessage': storage_failure.get('message') == '無法寫入本機資料，請檢查權限與可用空間。',
        'storageDeniedProfilePreserved': report.get('storageDenied', {}).get('profileUnchanged') is True,
        'missingDependencyStage': missing_bootstrap_payload.get('stage') == 'CatalogOpenFailed',
        'missingDependencyCode': missing_bootstrap_payload.get('error') == 'AssetMissing',
        'missingDependencyMessage': missing_bootstrap_payload.get('message') == '必要執行檔不完整，請使用完整安裝包修復。',
        'missingDependencyRestored': report.get('missingDependency', {}).get('restored') is True,
        'missingDependencyProfilePreserved': report.get('missingDependency', {}).get('profileUnchanged') is True,
        'finalInstallTreeUnchanged': report.get('finalInstallTreeUnchanged') is True,
        'uninstallExit': report.get('uninstall', {}).get('exitCode') in {0, 8},
        'uninstallPointerRemoved': report.get('uninstall', {}).get('pointerRemoved') is True,
        'uninstallProfilePreserved': report.get('uninstall', {}).get('profileUnchanged') is True,
        'uninstallOnlyExpectedResidual': report.get('uninstall', {}).get('onlyExpectedSelfResidual') is True,
    }
    passed = all(checks.values())
    report['checks'] = checks
    report['failedChecks'] = [name for name, ok in checks.items() if not ok]
    (output / 'run.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    summary = {
        'buildId': index['buildId'],
        'previousBuildId': previous_build,
        'maxInstalledPathLength': report.get('maxInstalledPathLength'),
        'shortenedInstallRoot': report.get('shortenedInstallRoot'),
        'upgrade': report.get('upgrade'),
        'writableExitCode': report.get('writableBaseline', {}).get('exitCode'),
        'writablePlayerSuccess': report.get('writableBaseline', {}).get('playerEvidence', {}).get('success'),
        'readOnlyExitCode': report.get('launcherExitCode'),
        'readOnlyPlayerSuccess': report.get('playerEvidence', {}).get('success'),
        'storageDeniedExitCode': report.get('storageDenied', {}).get('exitCode'),
        'storageDeniedFailure': storage_failure.get('failure'),
        'missingDependencyError': missing_bootstrap_payload.get('error'),
        'uninstall': report.get('uninstall'),
        'checks': checks,
        'failedChecks': report['failedChecks'],
    }
    # Console code page may not be UTF-8; ASCII escaping keeps structured evidence lossless in MCP logs.
    print(json.dumps(summary, ensure_ascii=True), flush=True)
    emit('completed' if passed else 'verification_failed', failedChecks=report['failedChecks'],
         **({} if passed else dict(failureType='test_failure', reason=str(report['failedChecks']))))
    return 0 if passed else 4


if __name__ == '__main__':
    try:
        raise SystemExit(main())
    except Exception as error:
        failure = failure_event(error)
        emit(**failure)
        # 即使前段例外，也留下可查詢的失敗證據，並避免淹沒原始 traceback。
        import sys
        if '--output' in sys.argv:
            failure_output = Path(sys.argv[sys.argv.index('--output') + 1])
            failure_output.mkdir(parents=True, exist_ok=True)
            (failure_output / 'failure.json').write_text(json.dumps(failure, ensure_ascii=False, indent=2), encoding='utf-8')
        traceback.print_exc()
        raise SystemExit(4)
