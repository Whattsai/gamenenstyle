"""安裝與來源維護共用的路徑、引用與交易檢查；只使用標準函式庫。"""
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import stat
from urllib.parse import unquote


def digest(data):
    return hashlib.sha256(data).hexdigest()


def json_bytes(value):
    return (json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + '\n').encode('utf-8')


def safe_relative(value):
    path = PurePosixPath(value)
    if not value or '\\' in value or ':' in value or path.is_absolute() or any(
            part in ('', '.', '..') for part in value.split('/')):
        raise ValueError(f'不安全的相對路徑：{value}')
    return path


def is_link(path):
    if path.is_symlink():
        return True
    try:
        return bool(getattr(path.lstat(), 'st_file_attributes', 0) & stat.FILE_ATTRIBUTE_REPARSE_POINT)
    except FileNotFoundError:
        return False


def guarded(root, relative):
    """不追隨符號連結、junction 或其他 reparse point。"""
    safe_relative(relative)
    path = root / relative
    for part in (path, *path.parents):
        if is_link(part):
            raise ValueError(f'拒絕連結路徑：{part}')
        if part == root:
            break
    if not path.resolve().is_relative_to(root.resolve()):
        raise ValueError(f'路徑超出專案：{relative}')
    return path


def files_under(root):
    for path in sorted(root.rglob('*')):
        rel = path.relative_to(root).as_posix()
        guarded(root, rel)
        if path.is_file() and '__pycache__' not in path.parts and path.suffix != '.pyc':
            yield rel, path.read_bytes()


LINK = re.compile(r'(!?\[[^\]\n]*\]\()([^\n]*?)(\))')


def local_target(raw):
    raw = raw.strip()
    if raw.startswith('<'):
        raw = raw[1:raw.index('>')]
    elif ' "' in raw:
        raw = raw.split(' "', 1)[0]
    raw = unquote(raw.split('#', 1)[0])
    if not raw or re.match(r'^[a-zA-Z][a-zA-Z0-9+.-]*:', raw) or raw.startswith('//'):
        return None
    return raw


def validate_links(root, payload, fallback_root=None):
    """檢查 Markdown 的本地檔案引用；頁面錨點由閱讀稽核確認。"""
    for rel, data in payload.items():
        if not rel.endswith('.md'):
            continue
        text = data.decode('utf-8')
        for match in LINK.finditer(text):
            target = local_target(match[2])
            if target is None:
                continue
            path = Path(os.path.normpath(root / rel / '..' / target))
            candidate = os.path.relpath(path, root).replace('\\', '/')
            # 將新增/刪除的預定狀態一起納入驗證。
            if candidate in payload:
                continue
            if fallback_root and (candidate.startswith(('.agents/', 'scripts/', 'tests/', '.maintenance/')) or candidate == 'AGENTS.md'):
                if guarded(fallback_root, candidate).exists():
                    continue
            if candidate.startswith(('.agents/skills/', '.agents/hello-nora/docs/')):
                raise ValueError(f'引用不在安裝清單：{rel} -> {target}')
            if not path.exists():
                raise ValueError(f'引用不存在：{rel} -> {target}')


def validate_skill_references(payload):
    """技能內的簡寫路徑以 skill 根為基準，品牌動態資料不當成漏檔。"""
    skill_paths = {rel: data for rel, data in payload.items() if '/skills/' in rel and rel.endswith('.md')}
    names = {rel.split('/skills/', 1)[1].split('/', 1)[0] for rel in skill_paths}
    for rel, data in skill_paths.items():
        text = data.decode('utf-8')
        prefix = rel.split('/skills/', 1)[0] + '/skills/'
        skill_name = rel.split('/skills/', 1)[1].split('/', 1)[0]
        for reference in re.findall(r'`([^`\n]+\.(?:md|py|ttf))`', text):
            if reference.startswith('.agents/skills/'):
                suffix = reference[len('.agents/skills/'):]
                if suffix.startswith('_brand'):
                    continue
                candidate = prefix + suffix
            elif reference.startswith(('workflows/', 'playbooks/', 'references/', 'scripts/', 'assets/')):
                # 安裝器指令在工具根，不是行銷角色腳本。
                if reference == 'scripts/install.py':
                    continue
                candidate = prefix + skill_name + '/' + reference
            elif reference.split('/', 1)[0] in names and not reference.startswith('_brand'):
                candidate = prefix + reference
            else:
                continue
            if candidate not in payload:
                raise ValueError(f'技能引用不存在：{rel} -> {reference}')


def transaction(root, writes, deletes=()):
    """完整預檢後寫入；錯誤時還原原有檔案。"""
    paths = {rel: guarded(root, rel) for rel in set(writes) | set(deletes)}
    original = {rel: p.read_bytes() if p.is_file() else None for rel, p in paths.items()}
    made_dirs = []
    try:
        for rel, data in writes.items():
            p = paths[rel]
            parent = p.parent
            missing = []
            while not parent.exists():
                missing.append(parent)
                parent = parent.parent
            for directory in reversed(missing):
                directory.mkdir()
                made_dirs.append(directory)
            # 同目錄原子替換，暫存檔也不得追隨連結。
            temp = guarded(root, rel + '.nora-tmp')
            if temp.exists():
                raise ValueError(f'暫存檔已存在：{temp}')
            try:
                temp.write_bytes(data)
                temp.replace(p)
            finally:
                if temp.exists():
                    temp.unlink()
        for rel in deletes:
            if paths[rel].is_file():
                paths[rel].unlink()
    except BaseException:
        for rel, data in original.items():
            p = paths[rel]
            if data is None:
                if p.is_file():
                    p.unlink()
            elif not p.is_file() or p.read_bytes() != data:
                p.write_bytes(data)
        for directory in reversed(made_dirs):
            if directory.exists() and not any(directory.iterdir()):
                directory.rmdir()
        raise
