#!/usr/bin/env python3
"""取得確切來源 commit、三方合併至暫存區，經閱讀與差異稽核後更新工具。"""
import argparse
import difflib
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile

sys.dont_write_bytecode = True
from common import (digest, files_under, guarded, json_bytes, safe_relative, transaction,
                    validate_links, validate_skill_references)
from secret_guard import validate_blank_examples, validate_platform_contract, validate_source_paths

ROOT = Path(__file__).resolve().parents[1]
LOCK = '.maintenance/source-lock.json'
DELTA = '.maintenance/local-delta.json'
EXCLUDED = ('free-version/', 'codex-version/')
REMOVED = {'LICENSE.md', 'NEWS.md', 'skills/_brand/usage-policy.md'}
LOCAL = ('.maintenance/', '.agents/')
LOCAL_FILES = {'AGENTS.md', 'scripts/install.py', 'scripts/common.py', 'scripts/source_update.py',
               'scripts/secret_guard.py',
               'tests/test_install.py', 'tests/test_source_update.py'}
REASONS = {'課程保護移除', '能力條件', '專案路徑與安裝', '來源更新治理', '矛盾修正', '引用完整性'}


def retained(path):
    return (not path.startswith(EXCLUDED + LOCAL) and path not in REMOVED | LOCAL_FILES
            and '.git' not in path.split('/') and '__pycache__' not in path.split('/')
            and not path.endswith(('.pyc', '.DS_Store')))


def git(repo, *args):
    result = subprocess.run(['git', '-C', str(repo), *args], capture_output=True)
    if result.returncode:
        raise ValueError('來源 Git 操作失敗：' + result.stderr.decode('utf-8', errors='replace')[-1200:])
    return result.stdout


def tree(repo, commit):
    files = {}
    for entry in git(repo, 'ls-tree', '-rz', commit).split(b'\0'):
        if not entry:
            continue
        metadata, raw_path = entry.split(b'\t', 1)
        mode, kind, oid = metadata.split()
        path = raw_path.decode('utf-8')
        safe_relative(path)
        if kind != b'blob' or mode not in (b'100644', b'100755'):
            raise ValueError(f'來源含不支援的連結或子模組：{path}')
        files[path] = git(repo, 'cat-file', 'blob', oid.decode())
    return files


def inventory(files):
    return {path: digest(data) for path, data in sorted(files.items())}


def normalized(data):
    if data is None or b'\0' in data:
        return data
    try:
        data.decode('utf-8')
    except UnicodeDecodeError:
        return data
    return data.replace(b'\r\n', b'\n')


def is_text(data):
    if b'\0' in data:
        return False
    try:
        data.decode('utf-8')
        return True
    except UnicodeDecodeError:
        return False


def delta(upstream, local, previous=None):
    """逐一記錄原文與本地文字差異；以內容雜湊繼承已核對的理由。"""
    validate_source_paths(path for path in set(upstream) | set(local) if retained(path))
    validate_blank_examples(upstream)
    validate_blank_examples(local)
    known = {item['id']: item for item in previous or []}
    result = []
    for path in sorted(set(upstream) | set(local)):
        before, after = normalized(upstream.get(path)), normalized(local.get(path))
        if before == after:
            continue
        try:
            a = (before or b'').decode('utf-8').splitlines(keepends=True)
            b = (after or b'').decode('utf-8').splitlines(keepends=True)
            hunks = [''.join(difflib.unified_diff(a, b, fromfile=path, tofile=path, n=3))]
        except UnicodeDecodeError:
            hunks = [f'二進位差異：{digest(before or b"")} -> {digest(after or b"")}']
        for hunk in hunks:
            identifier = digest((path + '\n' + hunk).encode('utf-8'))
            prior = known.get(identifier, {})
            result.append({'path': path, 'id': identifier, 'diff': hunk,
                           'reason': prior.get('reason', ''), 'detail': prior.get('detail', '')})
    return result


def validate_payload(root, files):
    validate_platform_contract(files)
    validate_links(root, files, ROOT)
    validate_skill_references({'tool/' + path: data for path, data in files.items()})
    forbidden = [r'~[/\\]\.claude[/\\]skills', r'\$HOME/\.claude/skills',
                 r'~[/\\]\.codex[/\\]skills', r'free-version/', r'codex-version/',
                 r'usage-policy\.md', r'LICENSE\.md', r'## 🔒 內容保護',
                 r'僅供購買者|禁止轉載／散布／轉售|unauthorized redistribution',
                 r'Claude (?:付費版|Pro|Max)', r'模型 GPT Image',
                 r'(?m)^(?:<<<<<<< |=======\s*$|>>>>>>> )']
    for path, data in files.items():
        safe_relative(path)
        if not retained(path):
            raise ValueError(f'排除範圍不可回流：{path}')
        if path.endswith(('.md', '.py')):
            text = data.decode('utf-8')
            if any(re.search(pattern, text) for pattern in forbidden):
                raise ValueError(f'仍有未通用化內容或衝突：{path}')
            if path.endswith('/SKILL.md'):
                parts = text.split('---', 2)
                if len(parts) != 3 or not re.search(r'^name: [a-z0-9-]+$', parts[1], re.M) or not re.search(r'^description: .+', parts[1], re.M):
                    raise ValueError(f'技能格式錯誤：{path}')


def local_files(root, lock):
    result = {}
    validate_source_paths(file.relative_to(root).as_posix() for file in root.rglob('*')
                          if file.is_file() and retained(file.relative_to(root).as_posix()))
    for file in sorted(root.rglob('*')):
        path = file.relative_to(root).as_posix()
        if retained(path):
            guarded(root, path)
            if file.is_file():
                result[path] = file.read_bytes()
    return result


def verify_governance(root, lock):
    for path, checksum in lock.get('governance_files', {}).items():
        if digest(guarded(root, path).read_bytes()) != checksum:
            raise ValueError(f'本地工具／治理檔案已修改，需重做驗證與來源稽核：{path}')
    if 'local_delta_sha256' in lock and digest(guarded(root, DELTA).read_bytes()) != lock['local_delta_sha256']:
        raise ValueError('來源差異紀錄與鎖定雜湊不符')


def source_diff(repo, before, after, scope):
    """輸出可重播的來源 patch；只包含保留範圍，另辨識重新命名。"""
    if not scope:
        return b'', {}
    options = ('--no-ext-diff', '--no-textconv', '--find-renames')
    paths = tuple(':(literal)' + path for path in sorted(scope))
    patch = git(repo, '-c', 'core.quotePath=false', 'diff', *options,
                '--binary', '--full-index', before, after, '--', *paths)
    tokens = git(repo, 'diff', *options, '--name-status', '-z', before, after, '--', *paths).split(b'\0')
    renames, i = {}, 0
    while i < len(tokens) and tokens[i]:
        status = tokens[i]
        old = tokens[i + 1].decode('utf-8')
        safe_relative(old)
        if status.startswith(b'R'):
            new = tokens[i + 2].decode('utf-8')
            safe_relative(new)
            renames[old] = new
            i += 3
        else:
            i += 2
    return patch, renames


def reading_scope(base, new, changes, conflicts, local_drift):
    affected = set(changes) | set(conflicts) | set(local_drift)
    required = {path for path in affected if path in new and is_text(new[path])}
    old_required = {path for path in affected if path in base and is_text(base[path])}
    # 有來源業務變更時先讀 Nora 入口，以確認角色與工作流脈絡。
    if changes and 'skills/hello-nora/SKILL.md' in new:
        required.add('skills/hello-nora/SKILL.md')
    return sorted(required), sorted(old_required)


def prepare(root, stage, repository=None):
    lock_data = guarded(root, LOCK).read_bytes()
    lock = json.loads(lock_data)
    verify_governance(root, lock)
    stage = stage.absolute()
    if stage.exists() or stage.resolve().is_relative_to(root.resolve()):
        raise ValueError('暫存區必須是工具目錄外、尚未存在的路徑')
    # 暫存父目錄也不能經 junction 跳到工具或其他位置。
    guarded(stage.parent, stage.name)
    repository = repository or lock['repository']
    with tempfile.TemporaryDirectory(prefix='nora-source-') as tmp:
        repo = Path(tmp) / 'upstream.git'
        result = subprocess.run(['git', 'clone', '--bare', '--', repository, str(repo)], capture_output=True)
        if result.returncode:
            raise ValueError('無法取得來源；工具與鎖定紀錄未變更')
        commit = git(repo, 'rev-parse', 'HEAD').decode().strip()
        branch = git(repo, 'symbolic-ref', 'HEAD').decode().strip()
        base = tree(repo, lock['commit'])
        new = base if commit == lock['commit'] else tree(repo, commit)
        validate_source_paths(path for path in new if retained(path))
        validate_blank_examples({path: data for path, data in new.items() if retained(path)})
        if inventory(base) != lock['upstream_files']:
            raise ValueError('前次來源內容與鎖定清單不符')
        for path in set(new) - set(base):
            if path in LOCAL_FILES or path.startswith(LOCAL):
                raise ValueError(f'新來源與本地治理範圍衝突，需先人工評估：{path}')
        local = local_files(root, lock)
        local_hashes = inventory(local)
        changes = {path: ('新增' if path not in base else '刪除' if path not in new else '修改')
                   for path in sorted(set(base) | set(new)) if retained(path) and base.get(path) != new.get(path)}
        local_drift = sorted(path for path in set(local) | set(lock['managed_files'])
                             if local_hashes.get(path) != lock['managed_files'].get(path))
        metadata = {'version': 2, 'status': 'review_required', 'repository': lock['repository'],
                    'commit': commit, 'branch': branch, 'base_commit': lock['commit'],
                    'lock_sha256': digest(lock_data), 'local_files': local_hashes,
                    'upstream_files': inventory(new), 'local_drift': local_drift,
                    'changes': changes, 'conflicts': []}
        if commit == lock['commit'] and not local_drift:
            validate_payload(root, local)
            metadata['status'] = 'unchanged'
            stage.mkdir(parents=True)
            transaction(stage, {'stage.json': json_bytes(metadata)})
            return metadata
        source_scope = {path for path in set(base) | set(new) if retained(path)}
        patch, renames = source_diff(repo, lock['commit'], commit, source_scope)
        renamed_from = {new_path: old_path for old_path, new_path in renames.items()}
        output, conflicts = {}, []
        scope = {path for path in set(base) | set(new) | set(local) if retained(path)}
        for path in sorted(scope):
            if path in renames:
                continue
            origin = renamed_from.get(path, path)
            a, b, c = normalized(local.get(origin)), normalized(base.get(origin)), normalized(new.get(path))
            if origin != path and path in local:
                output[path] = local[path]
                conflicts.append(path)
                continue
            if c == b:
                merged = a
            elif a == b:
                merged = c
            elif a == c:
                merged = a
            elif a is None or b is None or c is None or b'\0' in a + b + c:
                merged = a
                conflicts.append(path)
            else:
                paths = [Path(tmp) / str(i) for i in range(3)]
                for target, data in zip(paths, (a, b, c)):
                    target.write_bytes(data)
                result = subprocess.run(['git', 'merge-file', '-p', *map(str, paths)], capture_output=True)
                if result.returncode not in range(128):
                    raise ValueError(f'三方合併失敗：{path}')
                merged = result.stdout
                if result.returncode:
                    conflicts.append(path)
            if merged is not None:
                output[path] = merged
        old_delta = json.loads(guarded(root, DELTA).read_text(encoding='utf-8'))
        required, old_required = reading_scope(base, new, changes, conflicts, local_drift)
        metadata.update(source_scope=sorted(path for path in new if retained(path)), renames=renames,
                        base_scope=sorted(path for path in base if retained(path)), conflicts=conflicts,
                        required_read_files=required, required_base_read_files=old_required,
                        upstream_patch_sha256=digest(patch),
                        excluded_changes=sorted(path for path in set(base) | set(new)
                                                if not retained(path) and base.get(path) != new.get(path)))
        review = {'read_files': {}, 'read_base_files': {}, 'analysis_scope': 'affected',
                  'upstream_patch_sha256': '', 'capability_changes': {}, 'resolved_conflicts': [],
                  'exceptions': delta({p: d for p, d in new.items() if retained(p)}, output, old_delta)}
        writes = {'candidate/' + p: d for p, d in output.items()}
        writes.update({'upstream/' + p: d for p, d in new.items() if retained(p)})
        writes.update({'base/' + p: d for p, d in base.items() if retained(p)})
        writes['upstream.patch'] = patch
        writes['stage.json'] = json_bytes(metadata)
        writes['review.json'] = json_bytes(review)
        stage.mkdir(parents=True)
        transaction(stage, writes)
    return metadata


def apply(root, stage):
    metadata = json.loads(guarded(stage, 'stage.json').read_text(encoding='utf-8'))
    if metadata.get('version') != 2:
        raise ValueError('暫存格式已更新，請重新 prepare')
    lock_bytes = guarded(root, LOCK).read_bytes()
    lock = json.loads(lock_bytes)
    verify_governance(root, lock)
    if digest(lock_bytes) != metadata['lock_sha256'] or inventory(local_files(root, lock)) != metadata['local_files']:
        raise ValueError('工具在暫存後已變更，請重新準備，不能覆蓋')
    if metadata.get('status') == 'unchanged':
        if metadata['commit'] != lock['commit'] or metadata['local_files'] != lock['managed_files']:
            raise ValueError('無更新狀態與鎖定紀錄不符')
        validate_payload(root, local_files(root, lock))
        return {'commit': lock['commit'], 'write': [], 'delete': [], 'project_skills_synced': False}
    patch = guarded(stage, 'upstream.patch').read_bytes()
    if digest(patch) != metadata['upstream_patch_sha256']:
        raise ValueError('來源 patch 已被修改')
    base = dict(files_under(stage / 'base'))
    if set(base) != {p for p in lock['upstream_files'] if retained(p)} or any(
            digest(data) != lock['upstream_files'][p] for p, data in base.items()):
        raise ValueError('暫存舊來源快照不完整或已被修改')
    upstream = dict(files_under(stage / 'upstream'))
    if set(upstream) != set(metadata['source_scope']) or any(
            digest(data) != metadata['upstream_files'][p] for p, data in upstream.items()):
        raise ValueError('暫存來源快照不完整或已被修改')
    candidate = dict(files_under(stage / 'candidate'))
    validate_payload(stage / 'candidate', candidate)
    review = json.loads(guarded(stage, 'review.json').read_text(encoding='utf-8'))
    if review.get('analysis_scope') not in ('affected', 'full'):
        raise ValueError('分析範圍必須是 affected 或 full')
    required, old_required = reading_scope(base, upstream, metadata['changes'],
                                          metadata['conflicts'], metadata['local_drift'])
    if review['analysis_scope'] == 'full':
        required = [p for p, data in upstream.items() if is_text(data)]
    for key, source, needed in (('read_files', upstream, required), ('read_base_files', base, old_required)):
        observed = review.get(key, {})
        if not set(needed).issubset(observed) or any(
                p not in source or not is_text(source[p]) or digest(source[p]) != checksum
                for p, checksum in observed.items()):
            raise ValueError('必須完整閱讀並記錄變更檔與受影響範圍的來源文字檔雜湊')
    if review.get('upstream_patch_sha256') != digest(patch):
        raise ValueError('必須閱讀來源 patch 並記錄其雜湊')
    if set(review['capability_changes']) != set(metadata['changes']) or any(
            not isinstance(value, str) or not value.strip() for value in review['capability_changes'].values()):
        raise ValueError('新增、修改、刪除能力必須逐檔說明')
    if set(review['resolved_conflicts']) != set(metadata['conflicts']):
        raise ValueError('仍有未回報解法的合併衝突')
    actual = delta(upstream, candidate)
    by_id = {item['id']: item for item in review['exceptions']}
    if set(by_id) != {item['id'] for item in actual}:
        raise ValueError('通用化差異清單已變更，請重新核對並記錄精確 diff')
    for item in actual:
        recorded = by_id[item['id']]
        if recorded['reason'] not in REASONS or not recorded.get('detail', '').strip() or recorded['diff'] != item['diff']:
            raise ValueError(f'每項差異都需明列理由與具體說明：{item["path"]}')
    writes = {}
    for path, data in candidate.items():
        target = guarded(root, path)
        if path not in lock['managed_files'] and path not in metadata['local_files'] and target.exists():
            raise ValueError(f'來源新增檔案與本地非管理檔案衝突：{path}')
        if not target.exists() or target.read_bytes() != data:
            writes[path] = data
    deletes = sorted(set(lock['managed_files']) - set(candidate))
    delta_data = json_bytes(review['exceptions'])
    updated = {**lock, 'commit': metadata['commit'], 'default_branch': metadata['branch'],
               'upstream_files': metadata['upstream_files'], 'managed_files': inventory(candidate),
               'local_delta_sha256': digest(delta_data),
               'excluded_paths': {p: lock.get('excluded_paths', {}).get(p, '依局部維護規範排除，不併入主技能')
                                  for p in metadata['upstream_files'] if not retained(p)}}
    history = dict(lock.get('updates', {}))
    if metadata['commit'] != lock['commit']:
        history[metadata['commit']] = {'previous': lock['commit'], 'changes': review['capability_changes'],
                                     'exceptions': [item['id'] for item in review['exceptions']]}
    updated['updates'] = history
    for path, data in ((LOCK, json_bytes(updated)), (DELTA, delta_data)):
        if guarded(root, path).read_bytes() != data:
            writes[path] = data
    # 同一次來源重跑且無實際差異時完全不寫入。
    backups = {}
    for path in set(writes) | set(deletes):
        file = guarded(root, path)
        if file.is_file():
            data = file.read_bytes()
            backups['.maintenance/backups/' + digest(data) + '/' + path] = data
    transaction(root, {**backups, **writes}, deletes)
    return {'commit': metadata['commit'], 'write': sorted(writes), 'delete': deletes,
            'project_skills_synced': False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=('prepare', 'refresh-review', 'apply', 'audit'))
    parser.add_argument('--stage-dir', type=Path)
    parser.add_argument('--repository', help='測試或已取得的來源鏡像；鎖定的正式來源網址維持不變')
    args = parser.parse_args()
    try:
        if args.action == 'audit':
            lock = json.loads(guarded(ROOT, LOCK).read_text(encoding='utf-8'))
            files = local_files(ROOT, lock)
            if inventory(files) != lock['managed_files']:
                raise ValueError('管理檔案雜湊與鎖定紀錄不符')
            delta_data = guarded(ROOT, DELTA).read_bytes()
            if digest(delta_data) != lock['local_delta_sha256']:
                raise ValueError('來源差異紀錄與鎖定雜湊不符')
            for item in json.loads(delta_data):
                if item['reason'] not in REASONS or not item['detail'].strip():
                    raise ValueError('來源差異缺少具體理由')
            verify_governance(ROOT, lock)
            validate_payload(ROOT, files)
            result = {'commit': lock['commit'], 'managed_files': len(files), 'status': '通過'}
        elif args.stage_dir is None:
            raise ValueError('prepare/apply 必須指定 --stage-dir')
        elif args.action == 'prepare':
            metadata = prepare(ROOT, args.stage_dir, args.repository)
            result = {key: metadata[key] for key in ('status', 'commit', 'base_commit', 'changes', 'conflicts')}
            result.update(stage_dir=str(args.stage_dir), source_files=len(metadata['upstream_files']))
        elif args.action == 'refresh-review':
            stage = args.stage_dir
            review_path = guarded(stage, 'review.json')
            review = json.loads(review_path.read_text(encoding='utf-8'))
            review['exceptions'] = delta(dict(files_under(stage / 'upstream')),
                                         dict(files_under(stage / 'candidate')), review['exceptions'])
            transaction(stage, {'review.json': json_bytes(review)})
            result = {'exceptions': len(review['exceptions']), 'status': '差異清單已重算，請逐項填寫理由'}
        else:
            result = apply(ROOT, args.stage_dir)
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 0
    except (OSError, ValueError, KeyError) as error:
        print(f'停止：{error}', file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
